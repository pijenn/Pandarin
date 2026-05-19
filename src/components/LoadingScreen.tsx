'use client';

import { useEffect, useState } from 'react';

const LOADING_STEPS = [
  'Starting camera... 📷',
  'Loading Pandarin magic... ✨',
  'Preparing AR engine... 🔮',
  'Almost ready! 🐼',
];

export default function LoadingScreen() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-cover bg-center"
      style={{ backgroundImage: 'url(/Background.png)' }}
    >
      <div className="mb-8 text-center">
        <div className="mb-6">
          <img src="/LogoPandarin.svg" alt="Pandarin Logo" className="mx-auto h-64 w-auto" />
        </div>
        <p className="text-[#F8F800] text-lg font-semibold tracking-widest uppercase">
          Belajar Mandarin dengan AR!
        </p>
      </div>
      <div className="flex gap-2 mb-6">
        {LOADING_STEPS.map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-all duration-500"
            style={{
              background: i <= step ? '#F8F800' : 'rgba(255,255,255,0.4)',
              transform: i === step ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      <div className="glass-card px-6 py-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
        <p className="text-white font-semibold text-sm">{LOADING_STEPS[step]}</p>
      </div>

      <p className="text-white/80 text-xs mt-8 text-center max-w-[200px]">
        Please allow camera access when prompted
      </p>
    </div>
  );
}
