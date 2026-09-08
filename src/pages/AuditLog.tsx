import React, { useEffect } from 'react';
import { Activity, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../store';

export default function AuditLog() {
  const { auditLogs, fetchAuditLogs } = useAppStore();

  useEffect(() => {
    fetchAuditLogs();
    const interval = setInterval(fetchAuditLogs, 3000);
    return () => clearInterval(interval);
  }, [fetchAuditLogs]);

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-light text-neutral-900 tracking-tight">System Audit Log</h1>
        <p className="text-neutral-500 mt-1">Immutable record of system events, tool executions, and security policies.</p>
      </header>

      <div className="flex-1 bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Network</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100 font-mono text-xs">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap text-neutral-500">
                    {new Date(log.timestamp).toISOString()}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className="font-semibold text-slate-700">{log.action}</span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    {log.isExternal ? (
                      <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md font-medium">
                        <ShieldAlert className="w-3 h-3" /> External
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-medium">
                        <ShieldCheck className="w-3 h-3" /> Local
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-neutral-600 truncate max-w-xl">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-400 font-sans">
                    No audit events recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
