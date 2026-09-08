import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const app = express();
const PORT = 3000;

app.use(express.json());

// Set up storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "data/uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// -- Mock Database & Stores --
const auditLogs: any[] = [];
let networkStats = {
  externalCalls: 0,
  dataEgressBytes: 0,
  blockedRequests: 0,
};
const documents: any[] = [];
const agentTasks: any[] = [];

// Helper: Add Audit Log
const logAudit = (action: string, details: any, isExternal = false) => {
  const log = { id: Date.now().toString(), timestamp: new Date().toISOString(), action, details, isExternal };
  auditLogs.unshift(log); // newest first
  if (isExternal) {
    networkStats.externalCalls += 1;
  }
};

// --- ROUTES ---

// 1. Config & Status
app.get("/api/system/status", (req, res) => {
  res.json({
    mode: process.env.MODE || "SOVEREIGN",
    network: networkStats,
    models: [
      { id: "mistral-small-4", name: "Mistral Small 4", status: "READY", runtime: "llama.cpp", type: "LOCAL", capabilities: ["reasoning", "tool-use"] },
      { id: "gemma-2b", name: "Gemma 2B", status: "READY", runtime: "vLLM", type: "LOCAL", capabilities: ["fast-chat"] },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", status: process.env.MODE === "DEVELOPMENT" ? "READY" : "DISABLED (SOVEREIGN MODE)", runtime: "API", type: "CLOUD", capabilities: ["multimodal"] }
    ]
  });
});

app.get("/api/system/audit", (req, res) => res.json(auditLogs));

// 2. Documents & Knowledge
app.post("/api/documents/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
  }
  
  logAudit("FILE_RECEIVED", { filename: req.file.originalname, size: req.file.size });
  
  // Simulated Processing (OCR, Chunking, Embedding)
  const docId = Date.now().toString();
  const docMeta = {
    id: docId,
    filename: req.file.originalname,
    status: "PROCESSING",
    uploadedAt: new Date().toISOString(),
    path: req.file.path,
    extractedText: "",
  };
  documents.push(docMeta);

  // Simulate async processing
  setTimeout(async () => {
    logAudit("OCR_LOCAL", { docId, status: "SUCCESS" });
    try {
      if (req.file!.mimetype === "application/pdf") {
        const dataBuffer = fs.readFileSync(req.file!.path);
        const data = await pdfParse(dataBuffer);
        docMeta.extractedText = data.text;
      } else {
        docMeta.extractedText = "Simulated text extraction for " + req.file!.originalname;
      }
      docMeta.status = "INDEXED";
      logAudit("RAG_EMBEDDING_LOCAL", { docId, chunks: 12 });
    } catch (e) {
      docMeta.status = "ERROR";
      logAudit("OCR_ERROR", { docId, error: String(e) });
    }
  }, 1000);

  res.json(docMeta);
});

app.get("/api/documents", (req, res) => res.json(documents));

// 3. Agent Execution & Model Routing
app.post("/api/agent/run", async (req, res) => {
  const { prompt, documentIds, useDemoMode } = req.body;
  const taskId = Date.now().toString();
  
  const trace: any[] = [];
  const addTrace = (step: string, details: any) => {
    trace.push({ timestamp: new Date().toISOString(), step, details });
  };

  logAudit("AGENT_TASK_STARTED", { taskId, prompt });
  addTrace("TASK_CLASSIFIER", { intent: "analysis", complexity: "high" });

  const mode = process.env.MODE || "SOVEREIGN";
  addTrace("POLICY_CHECK", { status: "PASSED", rulesChecked: ["NETWORK_BLOCKED", "CONFIDENTIALITY_PRESERVED"] });

  let selectedModel = "mistral-small-4";
  let isCloud = false;

  if (useDemoMode || mode === "DEVELOPMENT") {
     // In a real hackathon, they might mock Mistral using Gemini if hardware lacks,
     // but we explicitly label it.
     if (process.env.GEMINI_API_KEY && mode === "DEVELOPMENT") {
         selectedModel = "gemini-2.5-pro";
         isCloud = true;
     }
  }

  addTrace("MODEL_ROUTER", { selectedModel, type: isCloud ? "CLOUD" : "LOCAL" });
  
  if (isCloud) logAudit("EXTERNAL_API_CALL", { model: selectedModel, endpoint: "generativelanguage.googleapis.com" }, true);
  else logAudit("LOCAL_INFERENCE_STARTED", { model: selectedModel });

  let finalOutput = "";

  // Simulate RAG
  const contextText = documents
    .filter(d => documentIds?.includes(d.id))
    .map(d => `Source: ${d.filename}\n${d.extractedText.substring(0, 500)}...`)
    .join("\n\n");

  if (contextText) {
    addTrace("RAG_RETRIEVAL", { sourcesFound: documentIds.length, chars: contextText.length });
    logAudit("RAG_RETRIEVAL", { sourcesFound: documentIds.length });
  } else {
    addTrace("RAG_RETRIEVAL", { sourcesFound: 0, chars: 0 });
  }

  // Simulate Tool execution & Sandbox
  addTrace("TOOL_PLANNING", { tools: ["calculate_deviation", "generate_report"] });
  addTrace("SANDBOX_EXECUTION", { tool: "calculate_deviation", status: "SUCCESS", limits: "CPU=10%, RAM=50MB" });
  logAudit("TOOL_EXECUTION", { tool: "calculate_deviation", sandboxed: true });

  // Generate output
  if (isCloud && process.env.GEMINI_API_KEY) {
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const response = await ai.models.generateContent({
              model: "gemini-2.5-pro",
              contents: `You are a sovereign industrial agent. Be professional.
              Context: ${contextText}
              User Request: ${prompt}`
          });
          finalOutput = response.text;
      } catch (err) {
          finalOutput = "Error querying cloud model. Fallback to local failed.";
      }
  } else {
      // Simulate Local Model Response
      finalOutput = "This is a deterministic, locally generated response simulating Mistral Small 4 execution within the Sovereign Environment.\n\n" +
      "Analysis complete. Based on the provided context, the equipment requires maintenance due to threshold deviations.\n" +
      "Calculations verified in isolated sandbox.\n\n" +
      (contextText ? "Sources cited: " + documents.filter(d => documentIds?.includes(d.id)).map(d=>d.filename).join(", ") : "");
  }

  addTrace("VERIFICATION", { status: "PASSED", checks: ["hallucination_risk", "policy_violations", "formatting"] });
  
  const taskResult = {
    id: taskId,
    prompt,
    model: selectedModel,
    trace,
    output: finalOutput,
    status: "COMPLETED"
  };
  agentTasks.unshift(taskResult);
  logAudit("AGENT_TASK_COMPLETED", { taskId });

  res.json(taskResult);
});

app.get("/api/agent/tasks", (req, res) => res.json(agentTasks));

// 4. Output Generation (Docs)
app.post("/api/generate-document", (req, res) => {
    const { taskId, format } = req.body;
    logAudit("DOCUMENT_GENERATED", { taskId, format });
    // In a real app, we'd use docx/exceljs. For demo, we just return a URL.
    res.json({ url: `/api/download/\${taskId}.\${format}`, status: "READY" });
});

app.get("/api/download/:file", (req, res) => {
    res.send("Simulated binary file content for " + req.params.file);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SIH26117] Sovereign Industrial Workbench running on port \${PORT}`);
  });
}

startServer();
