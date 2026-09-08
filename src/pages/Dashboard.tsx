import React, { useEffect } from 'react';
import { ShieldCheck, Server, AlertTriangle, Network, Lock, Cpu } from 'lucide-react';
import { useAppStore } from '../store';

export default function Dashboard() {
  const { status, fetchStatus } = useAppStore();

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  if (!status) return <div className="p-8">Loading dashboard...</div>;

  const isSovereign = status.mode === 'SOVEREIGN';

  return (
    <div className="p-8 h-full overflow-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-light text-neutral-900 tracking-tight">System Dashboard</h1>
        <p className="text-neutral-500 mt-1">Real-time sovereignty and infrastructure telemetry.</p>
      </header>

      {/* Network & Sovereignty Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Network Policy</h3>
            <div className={`p-2 rounded-md \${isSovereign ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {isSovereign ? <Lock className="w-4 h-4" /> : <Network className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-light">{isSovereign ? 'ISOLATED' : 'OPEN'}</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">External API Calls</h3>
            <div className={`p-2 rounded-md \${status.network.externalCalls === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {status.network.externalCalls === 0 ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-light">{status.network.externalCalls}</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Data Egress</h3>
            <div className="p-2 rounded-md bg-blue-50 text-blue-600">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-light">{status.network.dataEgressBytes}</span>
            <span className="text-neutral-500 font-medium">bytes</span>
          </div>
        </div>
        
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Local RAG</h3>
            <div className="p-2 rounded-md bg-indigo-50 text-indigo-600">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-light text-indigo-700">ACTIVE</span>
          </div>
        </div>
      </section>

      {/* Model Registry */}
      <section>
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">Model Registry</h2>
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Capabilities</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {status.models.map((model) => (
                <tr key={model.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-neutral-400" />
                    {model.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${
                      model.type === 'LOCAL' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {model.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {model.capabilities.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${
                      model.status === 'READY' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {model.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
