'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import LoadingScreen from '@/components/LoadingScreen';
import ScanPrompt from '@/components/ScanPrompt';
import WordCard from '@/components/WordCard';
import ErrorScreen from '@/components/ErrorScreen';
import { VocabWord } from '@/lib/vocabulary';

// Lazy load ARScanner only on browser, not on server
const ARScanner = dynamic(() => import('@/components/ARScanner'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function Home() {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detectedWord, setDetectedWord] = useState<VocabWord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartScan = () => {
    setIsScanning(true);
    setIsLoading(true);
    setError(null);
  };

  const handleScannerReady = () => {
    setIsLoading(false);
  };

  const handleWordDetected = (word: VocabWord) => {
    setDetectedWord(word);
  };

  const handleWordLost = () => {
    setDetectedWord(null);
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    setIsScanning(false);
  };

  const handleStopScan = () => {
    setIsScanning(false);
    setDetectedWord(null);
    setError(null);
  };

  // Show error screen if there's an error
  if (error) {
    return <ErrorScreen message={error} onRetry={handleStartScan} />;
  }

  // Show AR scanner with prompt
  if (isScanning) {
    return (
      <div className="relative w-full h-screen bg-transparent">
        <ARScanner
          onWordDetected={handleWordDetected}
          onWordLost={handleWordLost}
          onReady={handleScannerReady}
          onError={handleError}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <LoadingScreen />
          </div>
        )}

        {/* Overlay content */}
        {!isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-between p-8 pointer-events-none z-40">
            {/* Top - Stop button */}
            <button
              onClick={handleStopScan}
              className="pointer-events-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
            >
              Stop Scan
            </button>

            {/* Middle - Scan prompt or Word card */}
            <div className="pointer-events-auto">
              {detectedWord ? (
                <WordCard word={detectedWord} />
              ) : (
                <ScanPrompt />
              )}
            </div>

            {/* Bottom - Info */}
            <div className="text-white text-center text-sm opacity-75">
              <p>Point your camera at a Pandarin card to learn</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show home screen with start button
  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)' }}
    >
      <div className="text-center">
        {/* Logo */}
        <div className="mb-12">
          <div className="text-8xl mb-6">🐼</div>
          <h1 className="text-6xl font-black text-yellow-300 tracking-tight mb-2">
            Pandarin
          </h1>
          <p className="text-white/70 text-lg font-semibold tracking-widest uppercase">
            Learn Mandarin with AR
          </p>
        </div>

        {/* Description */}
        <p className="text-white/60 text-lg mb-12 max-w-md">
          Point your camera at a Pandarin card to see 3D models and learn new vocabulary!
        </p>

        {/* Start button */}
        <button
          onClick={handleStartScan}
          className="px-12 py-4 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-bold text-lg rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Start Scanning 📱
        </button>
      </div>
    </div>
  );
}
