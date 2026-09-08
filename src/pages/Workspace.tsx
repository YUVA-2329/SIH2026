import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, Send, Loader2, Bot, User, CheckCircle2, AlertCircle, FileSearch, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../store';

export default function Workspace() {
  const { documents, agentTasks, fetchDocuments, fetchTasks } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocuments();
    fetchTasks();
    const interval = setInterval(() => {
      fetchDocuments();
      fetchTasks();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchDocuments, fetchTasks]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentTasks]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      await fetchDocuments();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleDocSelection = (id: string) => {
    setSelectedDocs(prev => prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]);
  };

  const handleRunAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsProcessing(true);
    const currentPrompt = prompt;
    setPrompt('');

    try {
      await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPrompt,
          documentIds: selectedDocs,
          useDemoMode: false,
        }),
      });
      await fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateReport = async (taskId: string) => {
      try {
          const res = await fetch('/api/generate-document', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ taskId, format: 'docx' })
          });
          const data = await res.json();
          alert(`Report generated! Download available at: \${data.url}`);
      } catch(err) {
          console.error(err);
      }
  }

  const handleRunDemo = async () => {
    setIsProcessing(true);
    try {
      // 1. Upload mock file
      const formData = new FormData();
      const blob = new Blob(["Simulated inspection report contents for Pump A-214. Pressure is 120 PSI, threshold is 100 PSI."], { type: 'text/plain' });
      formData.append('file', blob, 'Pump_Inspection_A214.txt');
      const uploadRes = await fetch('/api/documents/upload', { method: 'POST', body: formData });
      const doc = await uploadRes.json();
      
      await fetchDocuments();
      setSelectedDocs([doc.id]);

      // 2. Run agent
      await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "Analyze this inspection and determine whether maintenance is required. Generate the required work package.",
          documentIds: [doc.id],
          useDemoMode: false
        })
      });
      await fetchTasks();
    } catch(err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Knowledge Base Sidebar */}
      <div className="w-1/3 bg-neutral-50 border-r border-neutral-200 flex flex-col p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
             <FileSearch className="w-5 h-5 text-indigo-500" />
             Knowledge Base
           </h2>
           <button onClick={handleRunDemo} disabled={isProcessing} className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md font-semibold hover:bg-indigo-200 transition-colors">
             Run SIH Demo
           </button>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-neutral-300 rounded-xl bg-white hover:bg-neutral-50 cursor-pointer transition-colors group">
            <div className="flex flex-col items-center gap-2 text-neutral-500 group-hover:text-neutral-700">
              {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
              <span className="text-sm font-medium">Upload Industrial Document</span>
            </div>
            <input type="file" className="hidden" accept=".pdf,.txt,.docx,.xlsx" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>

        <div className="flex-1 overflow-auto space-y-3">
          {documents.map((doc) => (
            <div 
              key={doc.id} 
              className={`p-3 rounded-lg border text-sm cursor-pointer transition-all \${
                selectedDocs.includes(doc.id) 
                  ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                  : 'bg-white border-neutral-200 hover:border-indigo-100'
              }`}
              onClick={() => toggleDocSelection(doc.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md \${selectedDocs.includes(doc.id) ? 'bg-indigo-100 text-indigo-600' : 'bg-neutral-100 text-neutral-500'}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium text-neutral-800 truncate" title={doc.filename}>{doc.filename}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs \${doc.status === 'INDEXED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
                <div>
                   <input type="checkbox" checked={selectedDocs.includes(doc.id)} readOnly className="w-4 h-4 text-indigo-600 rounded border-neutral-300" />
                </div>
              </div>
            </div>
          ))}
          {documents.length === 0 && (
            <div className="text-center p-6 border border-dashed border-neutral-200 rounded-xl text-neutral-400 text-sm">
              No documents in local knowledge base.
            </div>
          )}
        </div>
      </div>

      {/* Agent Chat / Execution Area */}
      <div className="w-2/3 flex flex-col bg-white">
        <div className="flex-1 overflow-auto p-6 space-y-8">
          {agentTasks.map((task) => (
            <div key={task.id} className="space-y-6">
              {/* User Prompt */}
              <div className="flex items-start gap-4 justify-end">
                 <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-sm max-w-xl shadow-sm text-sm">
                   {task.prompt}
                 </div>
                 <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-neutral-600" />
                 </div>
              </div>

              {/* Agent Trace */}
              <div className="flex flex-col items-center">
                 <div className="w-px h-6 bg-neutral-200"></div>
                 <div className="bg-slate-50 border border-slate-200 rounded-xl w-full max-w-3xl p-5 font-mono text-xs shadow-sm">
                   <div className="flex items-center gap-2 text-slate-500 font-semibold uppercase mb-4 tracking-wider">
                     <ShieldCheck className="w-4 h-4 text-emerald-500" /> Agent Execution Trace
                   </div>
                   <div className="space-y-3 pl-2 border-l-2 border-slate-200">
                     {task.trace.map((t: any, i: number) => (
                       <div key={i} className="flex gap-4">
                         <span className="text-slate-400 min-w-[70px]">{new Date(t.timestamp).toLocaleTimeString([], {hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}</span>
                         <div>
                            <span className="text-indigo-600 font-medium">[{t.step}]</span>
                            <span className="text-slate-600 ml-2">{JSON.stringify(t.details)}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
                 <div className="w-px h-6 bg-neutral-200"></div>
              </div>

              {/* Agent Response */}
              <div className="flex items-start gap-4">
                 <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                 </div>
                 <div className="bg-white border border-neutral-200 p-5 rounded-2xl rounded-tl-sm max-w-3xl shadow-sm text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap flex-1">
                   {task.output}
                   
                   <div className="mt-6 pt-4 border-t border-neutral-100 flex gap-3">
                      <button onClick={() => handleGenerateReport(task.id)} className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Generate DOCX Report
                      </button>
                   </div>
                 </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-neutral-200">
           <form onSubmit={handleRunAgent} className="flex gap-4 max-w-4xl mx-auto">
             <div className="flex-1 relative">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask the sovereign agent to analyze equipment or documents..."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl pl-4 pr-12 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  disabled={isProcessing}
                />
             </div>
             <button
               type="submit"
               disabled={isProcessing || !prompt.trim()}
               className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-medium flex items-center justify-center transition-colors shadow-sm"
             >
               {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
             </button>
           </form>
        </div>
      </div>
    </div>
  );
}
