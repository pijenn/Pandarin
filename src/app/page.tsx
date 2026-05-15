'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import LoadingScreen from '@/components/LoadingScreen';
import ScanPrompt from '@/components/ScanPrompt';
import WordCard from '@/components/WordCard';
import ErrorScreen from '@/components/ErrorScreen';
import { VocabWord } from '@/lib/vocabulary';
const ARScanner = dynamic(() => import('@/components/ARScanner'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function Home() {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detectedWord, setDetectedWord] = useState<VocabWord | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Removed manual body style overrides as we will use a robust <style> tag instead

  const handleStartScan = () => {
    setIsScanning(true);
    setIsLoading(true);
    setError(null);
  };

  const handleScannerReady = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleWordDetected = useCallback((word: VocabWord) => {
    setDetectedWord(word);
  }, []);

  const handleWordLost = useCallback(() => {
    // Kartu tetap terbuka walaupun kamera dipalingkan
    // setDetectedWord(null);
  }, []);

  const handleError = useCallback((errorMsg: string) => {
    setError(errorMsg);
    setIsScanning(false);
  }, []);

  const handleStopScan = () => {
    setIsScanning(false);
    setDetectedWord(null);
    setError(null);
  };

  if (error) {
    return <ErrorScreen message={error} onRetry={handleStartScan} />;
  }

  if (isScanning) {
    return (
      <div className="relative w-full h-screen bg-transparent">

        <style dangerouslySetInnerHTML={{__html: `
          html, body {
            background: transparent !important;
            background-color: transparent !important;
          }
        `}} />
        <ARScanner
          onWordDetected={handleWordDetected}
          onWordLost={handleWordLost}
          onReady={handleScannerReady}
          onError={handleError}
        />

        {/* Overlay Loading Screen */}
        {isLoading && (
          <div className="absolute inset-0 z-50">
            <LoadingScreen />
          </div>
        )}

        {/* Overlay content */}
        {!isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-between p-8 pointer-events-none z-10">
            {/* Top - Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleStopScan}
                className="pointer-events-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-lg"
              >
                Stop Scan
              </button>
              {detectedWord && (
                <button
                  onClick={() => setDetectedWord(null)}
                  className="pointer-events-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors shadow-lg"
                >
                  Scan Kartu Lain
                </button>
              )}
            </div>

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
      className="w-full h-screen flex flex-col items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: 'url(/Background.png)' }}
    >
      <div className="text-center">
        {/* Logo */}
        <div className="mb-12">
          <div className="text-8xl mb-6"><img src="/LogoPandarin.svg" alt="Pandarin Logo" className="mx-auto h-64 w-auto" /></div>
          <p className="text-[#F8F800] text-lg font-semibold tracking-widest uppercase">
            Belajar Mandarin dengan AR!
          </p>
        </div>

        <p className="text-white text-lg mb-12 max-w-md">
          Tunjukkan Kartu Pandarin ke Kamera untuk melihat 3D Models dan Belajar Katanya!
        </p>

        {/* Start button */}
        <button
          onClick={handleStartScan}
          className="px-12 py-4 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-bold text-lg rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Mulai Belajar!
        </button>
      </div>
    </div>
  );
}
