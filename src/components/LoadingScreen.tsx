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
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)' }}
    >
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-7xl mb-4">🐼</div>
        <h1 className="text-5xl font-black gradient-text tracking-tight">
          Pandarin
        </h1>
        <p className="text-white/50 text-sm mt-2 font-semibold tracking-widest uppercase">
          Learn Mandarin with AR
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-6">
        {LOADING_STEPS.map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-all duration-500"
            style={{
              background: i <= step ? '#FFD93D' : 'rgba(255,255,255,0.2)',
              transform: i === step ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Current step */}
      <div className="glass-card px-6 py-3">
        <p className="text-white font-semibold text-sm">{LOADING_STEPS[step]}</p>
      </div>

      {/* Permission hint */}
      <p className="text-white/30 text-xs mt-8 text-center max-w-[200px]">
        Please allow camera access when prompted
      </p>
    </div>
  );
}
