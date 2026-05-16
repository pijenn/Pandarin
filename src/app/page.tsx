'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import LoadingScreen from '@/components/LoadingScreen';
import ScanPrompt from '@/components/ScanPrompt';
import WordCard from '@/components/WordCard';
import ErrorScreen from '@/components/ErrorScreen';
import { VocabWord, getWordsByLevel } from '@/lib/vocabulary';
import { useLeveling } from '@/hooks/useLeveling';

const ARScanner = dynamic(() => import('@/components/ARScanner'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function Home() {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detectedWord, setDetectedWord] = useState<VocabWord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const { unlockedLevels, unlockNextLevel, isLevelUnlocked, isLoaded } = useLeveling();

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
          words={getWordsByLevel(selectedLevel)}
          targetMindFile={`/markers/targetlevel${selectedLevel}.mind`}
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
              {selectedLevel < 3 && (
                <button
                  onClick={() => {
                    if (isLevelUnlocked(selectedLevel + 1)) {
                      setSelectedLevel((prev) => prev + 1);
                      setDetectedWord(null);
                      setIsLoading(true); // Memunculkan loading saat AR re-mount
                    }
                  }}
                  disabled={!isLevelUnlocked(selectedLevel + 1)}
                  className={`pointer-events-auto px-6 py-3 font-bold rounded-lg transition-colors shadow-lg ${
                    isLevelUnlocked(selectedLevel + 1)
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-70'
                  }`}
                >
                  Next Level {isLevelUnlocked(selectedLevel + 1) ? '➡️' : '🔒'}
                </button>
              )}
            </div>

            {/* Middle - Scan prompt or Word card/Locked Popup */}
            <div className="pointer-events-auto">
              {detectedWord ? (
                isLevelUnlocked(detectedWord.level) ? (
                  <WordCard word={detectedWord} onLevelComplete={unlockNextLevel} />
                ) : (
                  <div className="glass-card p-8 text-center min-w-[280px]">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Level Locked</h2>
                    <p className="text-white/80 mb-6">
                      Selesaikan Level {detectedWord.level - 1} terlebih dahulu untuk membuka level ini.
                    </p>
                    <button
                      onClick={() => setDetectedWord(null)}
                      className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl transition-colors w-full"
                    >
                      Tutup
                    </button>
                  </div>
                )
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

        <p className="text-white text-lg mb-8 max-w-md">
          Pilih level dan tunjukkan Kartu Pandarin ke Kamera untuk melihat 3D Models dan Belajar Katanya!
        </p>

        {/* Level Selection */}
        {isLoaded && (
          <div className="flex gap-4 mb-8 justify-center">
            {[1, 2, 3].map((level) => {
              const isUnlocked = isLevelUnlocked(level);
              return (
                <button
                  key={level}
                  onClick={() => {
                    if (isUnlocked) setSelectedLevel(level);
                  }}
                  disabled={!isUnlocked}
                  className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${
                    selectedLevel === level
                      ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-105'
                      : !isUnlocked
                      ? 'bg-gray-800/60 text-gray-500 cursor-not-allowed opacity-60'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Level {level} {!isUnlocked && '🔒'}
                </button>
              );
            })}
          </div>
        )}

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
