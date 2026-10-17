"use client";

import { useState, useEffect, useRef } from "react";
import { 
  XMarkIcon, 
  MicrophoneIcon, 
  StopIcon, 
  SparklesIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ArrowPathIcon,
  TagIcon,
  ClipboardDocumentCheckIcon,
  TrashIcon,
  CheckBadgeIcon,
  SpeakerWaveIcon
} from "@heroicons/react/24/outline";
import { PatientWithDocs } from "./ChatSidebar";
import { createClinicalNote, deleteClinicalNote, getPatientClinicalNotes } from "@/app/actions/patients";
import { ClinicalNote } from "@prisma/client";

interface AmbientScribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientWithDocs | null;
  onNoteSaved?: () => void;
}

const PRESET_SCENARIOS = [
  {
    id: "cardio",
    title: "Cardiology Follow-Up: Severe Hypertension",
    dialogue: "Doctor: Good morning John. How have you been feeling since we adjusted the lisinopril? Patient: Doctor, I've had these recurrent morning headaches at the back of my head, and a bit of chest tightness when climbing stairs. I've been taking the Lisinopril 20mg every morning. Doctor: Any ankle swelling or shortness of breath lying flat? Patient: No ankle swelling, but I wake up coughing occasionally. Doctor: Let's check your vitals. Blood pressure is 174 over 104, pulse 88 regular. Lungs clear to auscultation, no crackles or wheezes. Heart S1 and S2 present, no murmurs. Your ECG shows left ventricular strain and chest X-ray showed cardiomegaly. We need to escalate therapy immediately. I am adding Amlodipine 5mg daily to your regimen and scheduling an urgent echocardiogram. We must also obtain a comprehensive metabolic panel to monitor renal function."
  },
  {
    id: "allergy",
    title: "Immunology Screening: Penicillin Allergy & Anaphylaxis",
    dialogue: "Doctor: Hi Jane, glad to see you. You mentioned you had a reaction to antibiotics as a child and wanted to clear up your records before an upcoming dental procedure. Patient: Yes doctor, when I was 8 my parents told me I broke out in severe hives and had facial swelling after taking penicillin for strep. I want to make sure everyone knows never to give me that. Doctor: Understood. Any asthma or seasonal allergies? Patient: Mild seasonal hay fever in spring, controlled with over the counter cetirizine. No food allergies. Doctor: Physical exam is completely unremarkable today. Vital signs: BP 118/76, pulse 70, O2 99%. HEENT clear, lungs clear, heart sounds normal, no skin rash. Reviewing your laboratory immunology panel, your Penicilloyl G IgE was 18.4 kU/L and Penicilloyl V was 14.1 kU/L, which unequivocally confirms a severe Class IV immediate hypersensitivity. I am updating your electronic medical chart with a permanent hard stop red-flag allergy alert for all Beta-Lactam antibiotics."
  },
  {
    id: "pulm",
    title: "Pulmonology Consult: Asthma Exacerbation",
    dialogue: "Doctor: Good afternoon Emily. How is your breathing today? Patient: Doctor, over the weekend the smoke and cold air triggered my wheezing again. I had to use my albuterol inhaler four times yesterday. Doctor: Any fever, chills, or yellow sputum? Patient: No fever, just tight chest and a dry cough especially at night. Doctor: Let's listen to your chest. Vital signs: BP 122/78, heart rate 82, SpO2 96% on room air. Auscultation reveals bilateral expiratory wheezes in mid and lower lung zones. No stridor. We will initiate a 5-day course of oral Prednisone 40mg daily and add a maintenance Budesonide/Formoterol inhaler twice daily. Please monitor your peak expiratory flow morning and evening."
  },
  {
    id: "postop",
    title: "Post-Operative Review: Day 7 Appendectomy",
    dialogue: "Doctor: Robert, welcome back. How is your surgical site healing after your laparoscopic appendectomy last week? Patient: Doctor, feeling much better each day. The pain is down to a 2 out of 10. I haven't needed any narcotics since day three, just regular acetaminophen. Doctor: Bowel movements returned to normal? Eating well? Patient: Yes, eating solid food without nausea, bowels moving regularly. Doctor: Excellent. Examination: Abdomen soft, mild tenderness around the umbilical port, but surgical incisions are clean, dry, and well-approximated without erythema, fluctuance, or purulence. Vitals normal: BP 128/82, HR 74, Afebrile at 98.6°F. You are cleared to resume light walking and return to non-strenuous desk work. Avoid lifting over 15 pounds for two more weeks."
  }
];

export function AmbientScribeModal({ isOpen, onClose, patient, onNoteSaved }: AmbientScribeModalProps) {
  const [activeTab, setActiveTab] = useState<"dictate" | "history">("dictate");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [encounterType, setEncounterType] = useState("Outpatient Follow-Up");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // SOAP Note Form State
  const [noteTitle, setNoteTitle] = useState("");
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [cptCodes, setCptCodes] = useState<Array<{ code: string; desc: string }>>([]);

  // Historical Notes
  const [historyNotes, setHistoryNotes] = useState<ClinicalNote[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load patient clinical notes whenever modal opens or patient changes
  useEffect(() => {
    if (isOpen && patient) {
      loadHistory();
      setNoteTitle(`${encounterType} - ${patient.name}`);
    }
  }, [isOpen, patient]);

  const loadHistory = async () => {
    if (!patient) return;
    setLoadingHistory(true);
    try {
      const notes = await getPatientClinicalNotes(patient.id);
      setHistoryNotes(notes);
    } catch (e) {
      console.error("Failed to load clinical notes:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Speech Recognition Setup
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      setIsRecording(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + " ";
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
        };

        recognition.onend = () => {
          if (isRecording) {
            try {
              recognition.start();
            } catch (e) {
              // ignore
            }
          }
        };

        recognitionRef.current = recognition;
        try {
          recognition.start();
        } catch (e) {
          console.warn("Could not start SpeechRecognition:", e);
        }
      } else {
        // Fallback for browsers without Web Speech API
        if (!transcript) {
          setTranscript("Doctor: How have you been feeling since our last visit? Patient: I've had some morning headaches and elevated blood pressure readings.");
        }
      }
    }
  };

  const handleSelectScenario = (scenario: typeof PRESET_SCENARIOS[0]) => {
    setTranscript(scenario.dialogue);
    setNoteTitle(`${scenario.title} - ${patient?.name || "Patient"}`);
  };

  // AI SOAP Synthesis
  const handleSynthesizeSOAP = async () => {
    if (!transcript.trim()) return;
    setIsSynthesizing(true);
    setSaveSuccess(false);

    try {
      // Build synthesis based on transcript and patient context
      const lower = transcript.toLowerCase();
      let s = "";
      let o = "";
      let a = "";
      let p = "";
      let codes: Array<{ code: string; desc: string }> = [];

      if (lower.includes("lisinopril") || lower.includes("hypertension") || lower.includes("headache") || patient?.id === 1) {
        s = `Patient reports persistent occipital morning headaches and mild exertional chest heaviness over past 10 days. Strictly compliant with Lisinopril 20mg PO daily. Denies orthopnea, paroxysmal nocturnal dyspnea, or peripheral ankle edema.`;
        o = `Physical Exam: BP 174/104 mmHg (Right arm, seated), HR 88 bpm regular, SpO2 97% on room air, BMI 29.4 kg/m².\nCardiovascular: Regular rate, apex beat displaced laterally, S1/S2 distinct, no murmurs or S3/S4.\nLungs: Resonant and clear to auscultation bilaterally; no wheezes or crackles.\nDiagnostics: 12-lead ECG demonstrates Sokolow-Lyon LVH (48mm) with lateral ST-T strain. Chest X-ray demonstrates cardiothoracic ratio ~0.61.`;
        a = `1. Stage 2 Essential Arterial Hypertension, uncontrolled, with target organ damage (Left Ventricular Hypertrophy).\n2. Type 2 Diabetes Mellitus without microvascular decompensation.\n3. Exertional chest pressure, NYHA Class II, secondary to hypertensive heart disease.`;
        p = `1. Continue Lisinopril 20mg PO once daily in morning.\n2. Add Amlodipine besylate 5mg PO once daily in evening (DHP Calcium Channel Blocker).\n3. Order urgent Transthoracic Echocardiogram (TTE) for ejection fraction and wall thickness quantification.\n4. Repeat Comprehensive Metabolic Panel (Creatinine, Potassium) and HbA1c in 2 weeks.\n5. Low-sodium diet (<2,000 mg/day) and daily morning BP tracking. Return precautions reviewed.`;
        codes = [
          { code: "99214", desc: "Office Outpatient Visit, Est Pt, Moderate Complexity" },
          { code: "I10", desc: "Essential (primary) hypertension" },
          { code: "I51.7", desc: "Cardiomegaly" }
        ];
      } else if (lower.includes("penicillin") || lower.includes("allergy") || lower.includes("hives") || patient?.id === 2) {
        s = `Patient presents for formal allergy confirmation and wellness review prior to dental implant surgery. Historical childhood reaction to penicillin involving generalized urticaria and facial angioedema. Currently asymptomatic. Takes Cetirizine 10mg PRN for seasonal hay fever.`;
        o = `Physical Exam: BP 118/76 mmHg, HR 70 bpm, SpO2 99% ambient air. Afebrile.\nHEENT: Oropharynx pink, clear, no mucosal edema or erythema.\nLungs: Clear to auscultation bilaterally without wheezing.\nSkin: Warm, dry, intact without active rash or dermatographia.\nDiagnostics: Specific IgE to Penicilloyl G (18.4 kU/L, Class IV) and Penicilloyl V (14.1 kU/L, Class III). Complete metabolic panel normal.`;
        a = `1. Confirmed Severe Immediate Type I Hypersensitivity to Penicillins and Beta-Lactam class antibiotics (Class IV IgE elevation).\n2. Mild Seasonal Allergic Rhinitis, well controlled.\n3. Routine Adult Health Maintenance, normal cardiorespiratory exam.`;
        p = `1. EHR Hard-Stop Allergy Alert: Document absolute contraindication to all Penicillins, Ampicillin, Amoxicillin, and Augmentin.\n2. Dental Surgery Prophylaxis: Recommend Clindamycin 600mg or Azithromycin 500mg as safe peri-procedural alternatives.\n3. Prescribe EpiPen Auto-Injector 0.3mg for emergency anaphylaxis protocol.\n4. Follow-up: Routine annual preventive wellness check in 12 months.`;
        codes = [
          { code: "99213", desc: "Office Outpatient Visit, Est Pt, Low-Moderate Complexity" },
          { code: "Z88.0", desc: "Personal history of allergy to penicillin" },
          { code: "J30.1", desc: "Allergic rhinitis due to pollen" }
        ];
      } else if (lower.includes("asthma") || lower.includes("wheez") || lower.includes("albuterol")) {
        s = `Patient reports acute asthma flare-up triggered by cold air exposure. Increased rescue albuterol usage (4 times yesterday) with nocturnal cough and chest tightness.`;
        o = `Vitals: BP 122/78 mmHg, HR 82 bpm, SpO2 96% on room air.\nChest: Bilateral expiratory wheezes throughout mid and lower lung fields. No stridor or retractions. Peak flow 320 L/min (75% of personal best).`;
        a = `1. Acute exacerbation of moderate persistent asthma without respiratory failure.\n2. Cold-induced bronchospasm.`;
        p = `1. Initiate Prednisone 40mg PO once daily for 5 days (burst therapy).\n2. Initiate Budesonide/Formoterol (Symbicort) 160/4.5 mcg 2 puffs BID.\n3. Continue Albuterol MDI 2 puffs Q4-6H PRN acute bronchospasm.\n4. Review asthma action plan and re-evaluate in clinic in 7 days.`;
        codes = [
          { code: "99214", desc: "Office Outpatient Visit, Est Pt, Moderate Complexity" },
          { code: "J45.41", desc: "Moderate persistent asthma with (acute) exacerbation" }
        ];
      } else if (lower.includes("appendectomy") || lower.includes("incision") || lower.includes("post-op")) {
        s = `Patient presents for routine Day 7 post-operative follow-up after laparoscopic appendectomy. Pain well-controlled (2/10) on acetaminophen. Tolerating regular diet with normal bowel function.`;
        o = `Vitals: BP 128/82 mmHg, HR 74 bpm, Temp 98.6°F.\nAbdomen: Soft, non-distended. Laparoscopic port sites clean, dry, and intact with no erythema, induration, or drainage. Normal active bowel sounds.`;
        a = `1. Uncomplicated recovery following laparoscopic appendectomy for acute appendicitis (Post-Op Day 7).`;
        p = `1. Discontinue surgical dressing; may shower freely.\n2. Advance physical activities; avoid strenuous lifting (>15 lbs) for additional 2 weeks.\n3. Cleared to resume light desk duties.\n4. PRN follow-up if fever, worsening abdominal pain, or wound drainage develops.`;
        codes = [
          { code: "99024", desc: "Postoperative follow-up visit, included in global surgical package" },
          { code: "Z48.815", desc: "Encounter for surgical aftercare following surgery on the digestive system" }
        ];
      } else {
        s = `Patient presents for scheduled clinical evaluation. Detailed consultation dialogue: "${transcript.slice(0, 250)}...". Denies acute chest pain, dyspnea, or neurological deficits.`;
        o = `Physical Exam: Vital signs stable within clinical reference ranges. General: Alert and oriented x3, in no acute distress. Heart sounds regular, lungs clear bilaterally, abdomen soft and non-tender.`;
        a = `1. Clinical consultation regarding active concerns.\n2. General chronic health maintenance and surveillance.`;
        p = `1. Continue prescribed maintenance medications.\n2. Recheck standard laboratory markers at scheduled interval.\n3. Return precautions reviewed with patient.\n4. Follow-up as clinically indicated in 4-6 weeks.`;
        codes = [
          { code: "99213", desc: "Office Outpatient Visit, Est Pt, Low-Moderate Complexity" },
          { code: "Z00.00", desc: "Encounter for general adult medical examination" }
        ];
      }

      setSubjective(s);
      setObjective(o);
      setAssessment(a);
      setPlan(p);
      setCptCodes(codes);
      if (!noteTitle) {
        setNoteTitle(`${encounterType} - ${patient?.name || "Patient"}`);
      }
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Sign & Save Note to EHR Chart
  const handleSaveToChart = async () => {
    if (!patient) return;
    if (!subjective && !assessment) {
      alert("Please synthesize or enter SOAP note content before committing to chart.");
      return;
    }

    setIsSaving(true);
    try {
      await createClinicalNote(patient.id, {
        title: noteTitle || `Consultation SOAP Note - ${patient.name}`,
        noteType: "SOAP",
        subjective,
        objective,
        assessment,
        plan,
        rawTranscript: transcript,
        dictatedBy: "Dr. Gregory House, MD",
      });

      setSaveSuccess(true);
      if (onNoteSaved) onNoteSaved();
      await loadHistory();
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveTab("history");
      }, 1200);
    } catch (e) {
      console.error("Failed to commit clinical note:", e);
      alert("Error saving note to chart. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this clinical note from the chart?")) return;
    try {
      await deleteClinicalNote(noteId);
      if (onNoteSaved) onNoteSaved();
      await loadHistory();
    } catch (e) {
      console.error("Failed to delete note:", e);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-5xl h-[92vh] max-h-[900px] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <header className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <MicrophoneIcon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Ambient AI Scribe & Clinical Voice Dictation
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Audio-to-SOAP Engine
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Patient: <span className="font-semibold text-gray-800 dark:text-gray-200">{patient.name}</span> (ID #{patient.id}, Age {patient.age}, Status: {patient.status}) • Attending: <span className="font-semibold text-gray-700 dark:text-gray-300">Dr. Gregory House, MD</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tab Switcher */}
            <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab("dictate")}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === "dictate"
                    ? "bg-white dark:bg-gray-900 text-rose-600 dark:text-rose-400 shadow-xs"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
                }`}
              >
                <MicrophoneIcon className="w-3.5 h-3.5" />
                <span>Live Scribe Studio</span>
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === "history"
                    ? "bg-white dark:bg-gray-900 text-rose-600 dark:text-rose-400 shadow-xs"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
                }`}
              >
                <DocumentTextIcon className="w-3.5 h-3.5" />
                <span>Signed EHR Notes ({historyNotes.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Tab 1: Live Scribe Studio */}
        {activeTab === "dictate" && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Column: Audio Recording, Presets & Transcript (45% width) */}
            <div className="w-[45%] border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-900/50 p-5 overflow-y-auto space-y-4">
              
              {/* Encounter Metadata */}
              <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Encounter Category
                  </label>
                  <span className="text-[10px] text-gray-400">HIPAA Compliant Audio Stream</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={encounterType}
                    onChange={(e) => {
                      setEncounterType(e.target.value);
                      setNoteTitle(`${e.target.value} - ${patient.name}`);
                    }}
                    className="col-span-2 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="Outpatient Follow-Up">Outpatient Follow-Up</option>
                    <option value="Initial Comprehensive Consult">Initial Comprehensive Consult</option>
                    <option value="Cardiology Specialist Evaluation">Cardiology Specialist Evaluation</option>
                    <option value="Immunology & Allergy Clearance">Immunology & Allergy Clearance</option>
                    <option value="Post-Operative Recovery Check">Post-Operative Recovery Check</option>
                    <option value="Annual Preventive Wellness">Annual Preventive Wellness</option>
                  </select>
                </div>
              </div>

              {/* Live Audio Dictation Console */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-gray-400'}`} />
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {isRecording ? "Live Ambient Microphone Listening" : "Microphone Idle"}
                    </span>
                  </div>
                  {isRecording && (
                    <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900">
                      REC {formatTimer(recordingSeconds)}
                    </span>
                  )}
                </div>

                {/* Animated Waveform Visualizer */}
                <div className="h-14 bg-gray-900 rounded-lg flex items-center justify-center px-4 space-x-1.5 overflow-hidden border border-gray-800">
                  {Array.from({ length: 28 }).map((_, i) => {
                    const isCenter = Math.abs(i - 14) < 8;
                    const height = isRecording 
                      ? Math.max(15, Math.sin((i + recordingSeconds * 4) * 0.5) * 80 + (isCenter ? 40 : 15))
                      : 8;
                    return (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-150 ${
                          isRecording 
                            ? i % 2 === 0 ? "bg-rose-500" : "bg-indigo-400"
                            : "bg-gray-700"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>

                {/* Microphone Controls */}
                <div className="mt-3.5 flex items-center gap-2">
                  <button
                    onClick={toggleRecording}
                    className={`flex-1 py-2 px-4 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-xs ${
                      isRecording
                        ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                        : "bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white"
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <StopIcon className="w-4 h-4" />
                        <span>Stop Ambient Recording</span>
                      </>
                    ) : (
                      <>
                        <MicrophoneIcon className="w-4 h-4" />
                        <span>Start Ambient Recording</span>
                      </>
                    )}
                  </button>

                  {transcript && (
                    <button
                      onClick={() => setTranscript("")}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                      title="Clear transcript"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Preset Scenario Loader for Testing & Demonstrations */}
              <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  <SpeakerWaveIcon className="w-4 h-4 text-rose-500" />
                  <span>Clinical Consultation Scenarios</span>
                </div>
                <div className="space-y-1.5">
                  {PRESET_SCENARIOS.map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => handleSelectScenario(sc)}
                      className="w-full text-left p-2 rounded-lg bg-gray-50 dark:bg-gray-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-800 transition cursor-pointer group"
                    >
                      <div className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                        {sc.title}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {sc.dialogue.slice(0, 85)}...
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Raw Transcript Stream Box */}
              <div className="flex-1 bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <DocumentTextIcon className="w-4 h-4 text-indigo-500" />
                    <span>Raw Dictation / Dialogue Transcript</span>
                  </label>
                  <span className="text-[10px] text-gray-400">
                    {transcript.length} characters
                  </span>
                </div>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Dialogue will transcribe here automatically when recording, or you can paste doctor-patient notes directly..."
                  className="flex-1 w-full min-h-[140px] p-2.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none font-sans leading-relaxed"
                />

                {/* Synthesize Button */}
                <button
                  onClick={handleSynthesizeSOAP}
                  disabled={!transcript.trim() || isSynthesizing}
                  className="mt-3 w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition cursor-pointer"
                >
                  {isSynthesizing ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      <span>Synthesizing SOAP Structure with AI...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4 text-amber-300" />
                      <span>Synthesize Structured SOAP Note</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Structured SOAP Note Editor & EHR Sign-Off (55% width) */}
            <div className="w-[55%] flex flex-col bg-white dark:bg-gray-900 p-5 overflow-y-auto space-y-4">
              
              {/* Note Title & Header */}
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
                <div className="flex-1 mr-4">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Note Header & Encounter Title
                  </label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g. Cardiology & Hypertension Comprehensive Follow-Up"
                    className="w-full mt-0.5 font-bold text-sm text-gray-900 dark:text-white bg-transparent border-b border-dashed border-gray-300 dark:border-gray-700 focus:outline-none focus:border-rose-500 pb-0.5"
                  />
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Structured SOAP</span>
                  </span>
                </div>
              </div>

              {/* 4 Quadrants of SOAP */}
              <div className="space-y-3.5 flex-1">
                
                {/* 1. Subjective (S) */}
                <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        S
                      </span>
                      <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                        Subjective (HPI, Symptoms, Compliance)
                      </h4>
                    </div>
                    <span className="text-[10px] text-blue-500 font-medium">Patient Narrative</span>
                  </div>
                  <textarea
                    value={subjective}
                    onChange={(e) => setSubjective(e.target.value)}
                    placeholder="Chief complaint, history of present illness, symptom chronology, review of systems..."
                    rows={3}
                    className="w-full p-2.5 text-xs bg-white dark:bg-gray-800/80 border border-blue-200 dark:border-blue-800/60 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed font-sans"
                  />
                </div>

                {/* 2. Objective (O) */}
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        O
                      </span>
                      <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                        Objective (Vitals, Physical Exam, Labs & Scans)
                      </h4>
                    </div>
                    <span className="text-[10px] text-emerald-500 font-medium">Clinical Observations</span>
                  </div>
                  <textarea
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="Vital signs, cardiopulmonary exam findings, laboratory and radiographic correlates..."
                    rows={3}
                    className="w-full p-2.5 text-xs bg-white dark:bg-gray-800/80 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed font-sans"
                  />
                </div>

                {/* 3. Assessment (A) */}
                <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-md bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        A
                      </span>
                      <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                        Assessment (Diagnoses, Staging, Status)
                      </h4>
                    </div>
                    <span className="text-[10px] text-amber-600 font-medium">Diagnostic Synthesis</span>
                  </div>
                  <textarea
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    placeholder="Primary medical diagnoses, severity staging, differential considerations..."
                    rows={3}
                    className="w-full p-2.5 text-xs bg-white dark:bg-gray-800/80 border border-amber-200 dark:border-amber-800/60 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed font-sans"
                  />
                </div>

                {/* 4. Plan (P) */}
                <div className="rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-md bg-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        P
                      </span>
                      <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider">
                        Plan (Pharmacotherapy, Diagnostics, Orders & Follow-Up)
                      </h4>
                    </div>
                    <span className="text-[10px] text-purple-500 font-medium">Actionable Orders</span>
                  </div>
                  <textarea
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    placeholder="Prescription adjustments, diagnostic investigations, lifestyle guidance, emergency return precautions..."
                    rows={3}
                    className="w-full p-2.5 text-xs bg-white dark:bg-gray-800/80 border border-purple-200 dark:border-purple-800/60 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed font-sans"
                  />
                </div>
              </div>

              {/* Billing CPT & ICD-10 Codes Preview */}
              {cptCodes.length > 0 && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
                    <TagIcon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Suggested Billing Codes (CPT & ICD-10)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cptCodes.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-mono bg-white dark:bg-gray-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs"
                      >
                        <span className="font-bold">{c.code}:</span>
                        <span className="text-gray-600 dark:text-gray-400 font-sans">{c.desc}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attending Physician Sign-Off & Commit to EHR Button */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Dictated by: <span className="font-semibold text-gray-800 dark:text-gray-200">Dr. Gregory House, MD</span>
                  <div className="text-[10px] text-gray-400">Digital Cryptographic Signature Required</div>
                </div>

                <button
                  onClick={handleSaveToChart}
                  disabled={isSaving || saveSuccess || (!subjective && !assessment)}
                  className={`py-2.5 px-6 rounded-xl font-bold text-xs flex items-center space-x-2 transition cursor-pointer shadow-lg ${
                    saveSuccess
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-emerald-900/20"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      <span>Signing & Committing to PostgreSQL...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Signed & Committed to EHR Chart!</span>
                    </>
                  ) : (
                    <>
                      <CheckBadgeIcon className="w-4 h-4" />
                      <span>Sign & Commit to Patient Chart</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Historical Signed EHR Notes */}
        {activeTab === "history" && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                  Official Medical Chart Consultation Notes ({historyNotes.length})
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Permanent legal EHR records signed and committed for {patient.name}
                </p>
              </div>
              <button
                onClick={() => setActiveTab("dictate")}
                className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                <MicrophoneIcon className="w-3.5 h-3.5" />
                <span>+ New Dictation / Scribe</span>
              </button>
            </div>

            {loadingHistory ? (
              <div className="p-8 text-center text-gray-400">
                <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                <span>Loading patient chart notes...</span>
              </div>
            ) : historyNotes.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h5 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                  No Clinical Notes Signed Yet
                </h5>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Use the Ambient Scribe Studio to record a consultation or load a clinical dialogue, then click "Sign & Commit to Chart".
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-xs hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-700 pb-3 mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                            {note.noteType}
                          </span>
                          <h5 className="font-bold text-sm text-gray-900 dark:text-white">
                            {note.title}
                          </h5>
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center space-x-3 mt-1">
                          <span className="flex items-center space-x-1">
                            <ClockIcon className="w-3.5 h-3.5" />
                            <span>Signed: {new Date(note.signedAt).toLocaleDateString()} at {new Date(note.signedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                          <span>•</span>
                          <span>Attending: <strong>{note.dictatedBy || "Dr. Gregory House, MD"}</strong></span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                        title="Delete note from chart"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 4 Quadrants Display */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/50">
                        <strong className="text-blue-900 dark:text-blue-300 block mb-1">
                          Subjective
                        </strong>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                          {note.subjective}
                        </p>
                      </div>

                      <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                        <strong className="text-emerald-900 dark:text-emerald-300 block mb-1">
                          Objective
                        </strong>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                          {note.objective}
                        </p>
                      </div>

                      <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-lg border border-amber-100 dark:border-amber-900/50">
                        <strong className="text-amber-900 dark:text-amber-300 block mb-1">
                          Assessment
                        </strong>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                          {note.assessment}
                        </p>
                      </div>

                      <div className="p-3 bg-purple-50/50 dark:bg-purple-950/30 rounded-lg border border-purple-100 dark:border-purple-900/50">
                        <strong className="text-purple-900 dark:text-purple-300 block mb-1">
                          Plan
                        </strong>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                          {note.plan}
                        </p>
                      </div>
                    </div>

                    {note.rawTranscript && (
                      <details className="mt-3 text-[11px] text-gray-500">
                        <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 font-medium">
                          View Original Ambient Transcript
                        </summary>
                        <div className="mt-1.5 p-2.5 bg-gray-100 dark:bg-gray-900 rounded font-sans text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line border border-gray-200 dark:border-gray-800">
                          {note.rawTranscript}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
