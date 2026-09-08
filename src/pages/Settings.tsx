import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../store';

export default function Settings() {
  const { status } = useAppStore();

  if (!status) return null;

  return (
    <div className="p-8 h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-light text-neutral-900 tracking-tight">System Settings</h1>
        <p className="text-neutral-500 mt-1">Configure environment constraints and sovereignty policies.</p>
      </header>

      <div className="max-w-3xl space-y-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Environment Mode</h2>
          
          <div className="flex gap-4">
            <div className={`flex-1 p-4 rounded-xl border-2 transition-all \${
              status.mode === 'SOVEREIGN' ? 'border-emerald-500 bg-emerald-50' : 'border-neutral-200 bg-white opacity-50 cursor-not-allowed'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className={`w-5 h-5 \${status.mode === 'SOVEREIGN' ? 'text-emerald-600' : 'text-neutral-400'}`} />
                <h3 className="font-semibold text-neutral-900">Sovereign Mode</h3>
              </div>
              <p className="text-sm text-neutral-600">Strict air-gapped simulation. Network egress is blocked. All models and RAG processes execute locally.</p>
            </div>

            <div className={`flex-1 p-4 rounded-xl border-2 transition-all \${
              status.mode === 'DEVELOPMENT' ? 'border-amber-500 bg-amber-50' : 'border-neutral-200 bg-white opacity-50 cursor-not-allowed'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className={`w-5 h-5 \${status.mode === 'DEVELOPMENT' ? 'text-amber-600' : 'text-neutral-400'}`} />
                <h3 className="font-semibold text-neutral-900">Development Mode</h3>
              </div>
              <p className="text-sm text-neutral-600">Network egress allowed. Connected to external Gemini API for prototyping or when local hardware is insufficient.</p>
            </div>
          </div>
          
          <p className="text-xs text-neutral-500 mt-4">
            * Note: System mode is configured via server environment variables. To change modes, update the deployment configuration and restart the container.
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Security Policies</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
               <div>
                 <div className="font-medium text-neutral-800">Local Sandbox Execution</div>
                 <div className="text-sm text-neutral-500">Run agentic tools in isolated environments</div>
               </div>
               <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">ENFORCED</div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
               <div>
                 <div className="font-medium text-neutral-800">RBAC Controls</div>
                 <div className="text-sm text-neutral-500">Role-based access control for document uploads</div>
               </div>
               <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">ENFORCED</div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
               <div>
                 <div className="font-medium text-neutral-800">External Network Telemetry</div>
                 <div className="text-sm text-neutral-500">Audit logging for all outbound API requests</div>
               </div>
               <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">ENFORCED</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
