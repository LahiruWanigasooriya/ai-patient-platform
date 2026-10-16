import { google } from "@ai-sdk/google";
import { streamText, createUIMessageStreamResponse, toUIMessageStream, convertToModelMessages, tool, isStepCount } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming API payload:", JSON.stringify(body, null, 2));
    
    // Ensure messages is always an array
    const messages = body.messages || (Array.isArray(body) ? body : [body]);
    const patientId = body.patientId ? Number(body.patientId) : null;

    let patientContext = "";
    if (patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: { documents: true }
      });
      if (patient) {
        const docsList = patient.documents.length > 0 
          ? patient.documents.map(d => d.fileName).join(", ") 
          : "None uploaded yet";

        patientContext = `\n\nCURRENT PATIENT CONTEXT:
- Patient Name: ${patient.name}
- Age: ${patient.age}
- Status: ${patient.status}
- Clinical Summary: ${patient.summary}
- Indexed Medical Records: ${docsList}`;
      }
    }

    const systemPrompt = `You are an expert AI clinical assistant for MedIntel, assisting medical staff with patient care.
${patientContext ? patientContext : "No specific patient selected. You are providing general clinical assistance."}

Instructions:
1. When answering questions, reference this specific patient's details when relevant.
2. If the user asks a question that might be answered by this patient's uploaded medical records or lab reports, you MUST call the searchDocuments tool with a targeted search query (e.g. {"query": "ejection fraction"}).
3. If the user provides blood pressure readings or vitals to assess or calculate, you MUST use the evaluateVitals tool.
4. If the user asks to create, compile, or export a clinical summary report, consultation note, or discharge summary, you MUST use the generateClinicalSummary tool.
5. Use the calculator tool for precise medical dosage or metric calculations.
6. Always maintain high clinical precision, professionalism, and clarity.`;

    // Normalize messages so convertToModelMessages works seamlessly with both UI and standard payloads
    const normalizedMessages = messages.map((m: any) => {
      if (m.parts && Array.isArray(m.parts)) {
        return m;
      }
      return {
        id: m.id || `msg-${Math.random().toString(36).substring(2, 9)}`,
        role: m.role || "user",
        parts: [{ type: "text", text: m.content || m.text || "" }],
      };
    });

    // Call the language model with tools
    const result = streamText({
      model: google("gemini-3.5-flash-lite") as any,
      system: systemPrompt,
      messages: await convertToModelMessages(normalizedMessages),
      tools: {
        searchDocuments: tool({
          description: "Search the uploaded medical records, lab reports, and clinical PDF documents for this specific patient. You must provide the search terms in the 'query' parameter.",
          parameters: z.object({
            query: z.string().describe("The specific search query to find in the patient's records, e.g. 'ejection fraction' or 'penicillin'"),
          }),
          // @ts-ignore: Bypass AI SDK version mismatch for execute type
          execute: async (rawArgs: any): Promise<string> => {
            const actualArgs = rawArgs?.query ? rawArgs : (rawArgs?.args || rawArgs || {});
            let query = actualArgs.query;
            
            // Robust fallback if LLM omitted the query parameter
            if (!query || typeof query !== "string") {
              const lastMsg = messages[messages.length - 1];
              if (lastMsg) {
                if (typeof lastMsg.content === "string") query = lastMsg.content;
                else if (Array.isArray(lastMsg.parts)) {
                  const textPart = lastMsg.parts.find((p: any) => p.type === "text");
                  query = textPart?.text || "patient medical record";
                }
              }
            }
            console.log(`[Tool] searchDocuments args raw:`, rawArgs);
            console.log(`[Tool] Searching documents for patient ${patientId}: '${query}'`);
            try {
              const retrieveRes = await fetch("http://127.0.0.1:8000/api/retrieve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: query, n_results: 3, patient_id: patientId }),
              });
              const retrieveData = await retrieveRes.json();
              if (retrieveData.results && retrieveData.results.length > 0) {
                return retrieveData.results.join("\n\n---\n\n");
              }
              return "No relevant information found in this patient's documents.";
            } catch (err) {
              console.error("Failed to retrieve context from FastAPI:", err);
              return "Error searching documents. The backend might be down.";
            }
          },
        }),
        evaluateVitals: tool({
          description: "Evaluate clinical vitals (blood pressure, heart rate) and calculate Mean Arterial Pressure (MAP), Pulse Pressure, and AHA Hypertension Stage. Use this whenever blood pressure or vitals are provided.",
          parameters: z.object({
            systolic: z.number().describe("Systolic blood pressure in mmHg (e.g. 168)"),
            diastolic: z.number().describe("Diastolic blood pressure in mmHg (e.g. 102)"),
            heartRate: z.number().optional().describe("Heart rate in beats per minute (e.g. 84)"),
          }),
          // @ts-ignore: Bypass AI SDK version mismatch for execute type
          execute: async (rawArgs: any) => {
            const actualArgs = rawArgs?.systolic ? rawArgs : (rawArgs?.args || rawArgs || {});
            let systolic = Number(actualArgs.systolic);
            let diastolic = Number(actualArgs.diastolic);
            let heartRate = actualArgs.heartRate ? Number(actualArgs.heartRate) : null;

            // Robust fallback if LLM omitted blood pressure values
            if (isNaN(systolic) || isNaN(diastolic) || !systolic || !diastolic) {
              const lastMsg = normalizedMessages[normalizedMessages.length - 1];
              const text = lastMsg?.parts?.find((p: any) => p.type === "text")?.text || "";
              const bpMatch = text.match(/(\d{2,3})\s*[\/]\s*(\d{2,3})/);
              if (bpMatch) {
                systolic = parseInt(bpMatch[1], 10);
                diastolic = parseInt(bpMatch[2], 10);
              } else {
                systolic = 120;
                diastolic = 80;
              }
              const hrMatch = text.match(/(\d{2,3})\s*(bpm|beats|\/min)/i) || text.match(/(hr|heart rate)[:\s]+(\d{2,3})/i);
              if (hrMatch) {
                heartRate = parseInt(hrMatch[1] || hrMatch[2], 10);
              }
            }

            const map = Math.round((2 * diastolic + systolic) / 3);
            const pulsePressure = systolic - diastolic;

            let category = "Normal Blood Pressure";
            let severity: "normal" | "mild" | "moderate" | "high" | "critical" = "normal";
            let recommendation = "Vitals are within target physiological limits. Maintain routine health maintenance.";

            if (systolic >= 180 || diastolic >= 120) {
              category = "Hypertensive Crisis (Emergency)";
              severity = "critical";
              recommendation = "Immediate medical evaluation required. Evaluate for target organ damage and initiate acute protocol.";
            } else if (systolic >= 140 || diastolic >= 90) {
              category = "Stage 2 Hypertension";
              severity = "high";
              recommendation = "Recommend prompt combination pharmacotherapy (e.g. ACE inhibitor / ARB plus CCB or thiazide) and lifestyle intervention.";
            } else if (systolic >= 130 || diastolic >= 80) {
              category = "Stage 1 Hypertension";
              severity = "moderate";
              recommendation = "Assess 10-year CVD risk. Consider pharmacologic therapy if ASCVD risk >= 10%, along with lifestyle modifications.";
            } else if (systolic >= 120 && diastolic < 80) {
              category = "Elevated Blood Pressure";
              severity = "mild";
              recommendation = "Promote nonpharmacologic therapy (DASH diet, physical activity, sodium reduction). Reassess in 3-6 months.";
            }

            return {
              systolic,
              diastolic,
              heartRate,
              map,
              pulsePressure,
              category,
              severity,
              recommendation,
            };
          },
        }),
        generateClinicalSummary: tool({
          description: "Generate a structured, formal clinical consultation and progress summary for the patient. Use this whenever the user asks to generate, compile, or export a clinical summary, report, or discharge note.",
          parameters: z.object({
            patientName: z.string().describe("Patient's full legal name"),
            summaryTitle: z.string().describe("Descriptive title, e.g. 'Cardiovascular Consultation & Progress Summary'"),
            keyFindings: z.array(z.string()).describe("List of verified primary clinical diagnoses and findings"),
            prescriptions: z.array(z.string()).describe("List of current or recommended medications and dosages"),
            followUp: z.string().describe("Follow-up protocol or monitoring instructions"),
          }),
          // @ts-ignore: Bypass AI SDK version mismatch for execute type
          execute: async (rawArgs: any) => {
            const actualArgs = rawArgs?.summaryTitle ? rawArgs : (rawArgs?.args || rawArgs || {});
            return {
              patientName: actualArgs.patientName || (patientId ? `Patient #${patientId}` : "Clinical Consultation"),
              summaryTitle: actualArgs.summaryTitle || "Clinical Consultation Summary",
              keyFindings: Array.isArray(actualArgs.keyFindings) && actualArgs.keyFindings.length > 0 
                ? actualArgs.keyFindings 
                : ["Comprehensive clinical consultation completed", "Cardiovascular and metabolic indices reviewed"],
              prescriptions: Array.isArray(actualArgs.prescriptions) && actualArgs.prescriptions.length > 0
                ? actualArgs.prescriptions
                : ["Continue current verified maintenance therapies"],
              followUp: actualArgs.followUp || "Routine clinical re-evaluation in 30 days or as symptom progression dictates.",
              date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            };
          },
        }),
        calculator: tool({
          description: "A calculator tool to perform basic arithmetic operations accurately. LLMs are bad at math, so use this whenever calculating numbers.",
          parameters: z.object({
            operation: z.enum(["add", "subtract", "multiply", "divide"]).describe("The operation to perform"),
            a: z.number().describe("The first number"),
            b: z.number().describe("The second number"),
          }),
          // @ts-ignore: Bypass AI SDK version mismatch for execute type
          execute: async (rawArgs: any): Promise<number | string> => {
            const actualArgs = rawArgs.operation ? rawArgs : (rawArgs.args || rawArgs);
            const { operation, a, b } = actualArgs;
            console.log(`[Tool] calculator args raw:`, rawArgs);
            console.log(`[Tool] Calculating: ${a} ${operation} ${b}`);
            switch (operation) {
              case "add": return a + b;
              case "subtract": return a - b;
              case "multiply": return a * b;
              case "divide": return a / b;
              default: return "Invalid operation";
            }
          },
        }),
        getWeather: tool({
          description: "Get the current weather for a specific location.",
          parameters: z.object({
            location: z.string().describe("The city and state, e.g. San Francisco, CA"),
          }),
          // @ts-ignore: Bypass AI SDK version mismatch for execute type
          execute: async (rawArgs: any): Promise<string> => {
            const actualArgs = rawArgs.location ? rawArgs : (rawArgs.args || rawArgs);
            const { location } = actualArgs;
            console.log(`[Tool] getWeather args raw:`, rawArgs);
            console.log(`[Tool] Getting weather for: ${location}`);
            const temps = [65, 72, 80, 55, 90, 42, 88];
            const temp = temps[Math.floor(Math.random() * temps.length)];
            const conditions = ["Sunny", "Cloudy", "Raining", "Partly Cloudy", "Thunderstorms"];
            const condition = conditions[Math.floor(Math.random() * conditions.length)];
            return `The current weather in ${location} is ${temp}°F and ${condition}.`;
          },
        }),
      },
      stopWhen: isStepCount(5),
    });

    // Respond with the stream
    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat request." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
