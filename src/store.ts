import { create } from 'zustand';

interface SystemStatus {
  mode: string;
  network: {
    externalCalls: number;
    dataEgressBytes: number;
    blockedRequests: number;
  };
  models: any[];
}

interface AppState {
  status: SystemStatus | null;
  auditLogs: any[];
  documents: any[];
  agentTasks: any[];
  fetchStatus: () => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
  fetchDocuments: () => Promise<void>;
  fetchTasks: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  status: null,
  auditLogs: [],
  documents: [],
  agentTasks: [],
  
  fetchStatus: async () => {
    const res = await fetch('/api/system/status');
    const data = await res.json();
    set({ status: data });
  },
  
  fetchAuditLogs: async () => {
    const res = await fetch('/api/system/audit');
    const data = await res.json();
    set({ auditLogs: data });
  },
  
  fetchDocuments: async () => {
    const res = await fetch('/api/documents');
    const data = await res.json();
    set({ documents: data });
  },
  
  fetchTasks: async () => {
    const res = await fetch('/api/agent/tasks');
    const data = await res.json();
    set({ agentTasks: data });
  }
}));
