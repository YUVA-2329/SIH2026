import React, { useEffect, useState } from 'react';
import { ShieldCheck, Server, AlertTriangle, Network, Lock, Cpu, Activity } from 'lucide-react';
import { useAppStore } from '../store';
import { motion } from 'motion/react';

const AnimatedCounter = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let current = displayValue;
    if (current === value) return;
    
    const step = Math.max(1, Math.floor(Math.abs(value - current) / 10));
    const timer = setInterval(() => {
      current += (current < value) ? step : -step;
      if ((step > 0 && current >= value) || (step < 0 && current <= value)) {
        current = value;
        clearInterval(timer);
      }
      setDisplayValue(current);
    }, 30);
    
    return () => clearInterval(timer);
  }, [value, displayValue]);

  return <>{displayValue}</>;
};

export default function Dashboard() {
  const { status, fetchStatus } = useAppStore();

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  if (!status) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center text-neutral-400 gap-4">
        <Activity className="w-8 h-8 animate-spin" />
        <p className="tracking-widest font-mono text-sm">INITIALIZING SOVEREIGN CORE...</p>
      </div>
    </div>
  );

  const isSovereign = status.mode === 'SOVEREIGN';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="p-8 h-full overflow-auto bg-neutral-50/50">
      <header className="mb-10">
        <h1 className="text-3xl font-light text-neutral-900 tracking-tight">System Telemetry</h1>
        <p className="text-neutral-500 mt-2 font-mono text-sm tracking-wide uppercase">Real-time Node Status</p>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Top KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              {isSovereign ? <Lock className="w-24 h-24 text-emerald-600" /> : <Network className="w-24 h-24 text-amber-600" />}
            </div>
            <div className="relative z-10">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Network Policy</h3>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl font-light tracking-tight text-neutral-900">
                  {isSovereign ? 'ISOLATED' : 'OPEN'}
                </span>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${isSovereign ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isSovereign ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                {isSovereign ? 'Zero Egress Enforced' : 'External Access Allowed'}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Activity className="w-24 h-24 text-blue-600" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">External API Calls</h3>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-light tracking-tight text-neutral-900">
                  <AnimatedCounter value={status.network.externalCalls} />
                </span>
                <span className="text-sm font-medium text-neutral-400 mb-1">reqs</span>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${status.network.externalCalls === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {status.network.externalCalls === 0 ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {status.network.externalCalls === 0 ? 'Clean Audit' : 'Policy Violation Risk'}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Server className="w-24 h-24 text-indigo-600" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Data Egress</h3>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-light tracking-tight text-neutral-900">
                  <AnimatedCounter value={status.network.dataEgressBytes} />
                </span>
                <span className="text-sm font-medium text-neutral-400 mb-1">bytes</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">
                <Server className="w-3.5 h-3.5" />
                Local Storage Active
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Model Registry */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4 mt-4">
             <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Active Model Matrix</h2>
             <span className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
             </span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {status.models.map((model) => (
              <div key={model.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${model.status === 'READY' ? 'bg-white border-neutral-200 shadow-sm' : 'bg-neutral-50 border-neutral-100 opacity-60'}`}>
                <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-lg ${model.type === 'LOCAL' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                     <Cpu className="w-5 h-5" />
                   </div>
                   <div>
                     <div className="font-semibold text-neutral-900">{model.name}</div>
                     <div className="text-xs font-medium text-neutral-500 mt-0.5 flex gap-2">
                       <span className="uppercase tracking-wide">{model.runtime}</span>
                       <span className="text-neutral-300">•</span>
                       <span className="uppercase tracking-wide">{model.type}</span>
                     </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden md:flex gap-1.5">
                    {model.capabilities.map((cap: string) => (
                      <span key={cap} className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-[10px] font-bold uppercase tracking-wider">
                        {cap}
                      </span>
                    ))}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${model.status === 'READY' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-200 text-neutral-500'}`}>
                    {model.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

