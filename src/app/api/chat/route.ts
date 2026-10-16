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
2. If the user asks a question that might be answered by this patient's uploaded medical records or lab reports, you MUST call the searchDocuments tool and provide a specific, targeted search query in the 'query' argument (e.g. {"query": "ejection fraction"} or {"query": "penicillin allergy"}).
3. Use the calculator tool for precise medical dosage or metric calculations.
4. Always maintain high clinical precision, professionalism, and clarity.`;

    // Call the language model with tools
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
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
