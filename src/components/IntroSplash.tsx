import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

export default function IntroSplash({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex flex-col items-center"
      >
        <div className="p-4 bg-emerald-500/10 rounded-2xl mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          <Shield className="w-16 h-16 text-emerald-400" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">Sovereign AI</h1>
        <div className="px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-sm tracking-widest shadow-sm">
          SIH 2026
        </div>
      </motion.div>
    </motion.div>
  );
}
