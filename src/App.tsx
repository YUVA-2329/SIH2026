import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Activity, Shield, FileText, Settings, Terminal, ShieldAlert, Cpu } from 'lucide-react';
import { useAppStore } from './store';
import { AnimatePresence } from 'motion/react';
import IntroSplash from './components/IntroSplash';

import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import AuditLog from './pages/AuditLog';
import SettingsPage from './pages/Settings';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { status, fetchStatus } = useAppStore();

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/workspace', label: 'Workspace', icon: Terminal },
    { path: '/audit', label: 'Audit Log', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isSovereign = status?.mode === 'SOVEREIGN';

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white leading-tight tracking-tight">Sovereign AI</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">INDUSTRIAL WORKBENCH</p>
          </div>
        </div>

        <div className="px-4 py-6">
          <div className={`px-3 py-2 rounded-md mb-6 flex items-center gap-2 text-sm font-semibold \${
            isSovereign ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {isSovereign ? <Shield className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            {isSovereign ? 'SOVEREIGN MODE' : 'DEVELOPMENT MODE'}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 \${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-400 font-medium' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 \${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50">
             <Cpu className="w-4 h-4 text-indigo-400" />
             <div className="text-xs">
               <div className="text-white font-medium">Local Runtime</div>
               <div className="text-slate-500">Active (llama.cpp)</div>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <BrowserRouter>
      <AnimatePresence>
        {showIntro && <IntroSplash onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/audit" element={<AuditLog />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
