'use client';

import { useState, useEffect } from 'react';
import { VocabWord } from '@/lib/vocabulary';
import { speakMandarin } from '@/lib/tts';

interface WordCardProps {
  word: VocabWord;
  onLevelComplete?: (currentLevel: number) => void;
  onNextLevel?: () => void;
}

export default function WordCard({ word, onLevelComplete, onNextLevel }: WordCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; x: number }[]>([]);
  const [isListeningSTT, setIsListeningSTT] = useState(false);
  const [feedbackSTT, setFeedbackSTT] = useState<{ message: string; isCorrect: boolean } | null>(null);

  const levelNames: Record<number, string> = {
    1: 'Basic',
    2: 'Intermediate',
    3: 'Advanced',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSpeak();
    }, 600);
    return () => clearTimeout(timer);
  }, [word.id]);

  async function handleSpeak() {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      await speakMandarin(word.hanzi);
      setHasSpoken(true);
      spawnEmojis();
    } finally {
      setIsSpeaking(false);
    }
  }

  function spawnEmojis() {
    const newEmojis = Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + i,
      x: 20 + Math.random() * 60, // random horizontal position %
    }));
    setFloatingEmojis(newEmojis);
    setTimeout(() => setFloatingEmojis([]), 1600);
  }

  const handleSTT = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setFeedbackSTT({ message: "Browser ini tidak mendukung fitur Speech-to-Text. Harap gunakan Google Chrome.", isCorrect: false });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListeningSTT(true);
      setFeedbackSTT(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const cleanedTranscript = transcript.replace(/[.,。，！？!?\s]/g, '');
      
      if (cleanedTranscript === word.hanzi) {
        setFeedbackSTT({ message: "Keren! Kamu sudah benar mengejanya!", isCorrect: true });
        spawnEmojis();
        if (onLevelComplete) {
          onLevelComplete(word.level);
        }
      } else {
        setFeedbackSTT({ message: `Kamu bilang: "${cleanedTranscript}". Coba ulang lagi, pasti kamu bisa!`, isCorrect: false });
      }
    };

    recognition.onerror = (event: any) => {
      setFeedbackSTT({ message: `Gagal mendengarkan: ${event.error}`, isCorrect: false });
      setIsListeningSTT(false);
    };

    recognition.onend = () => {
      setIsListeningSTT(false);
    };

    recognition.start();
  };

  return (
    <div className="slide-up relative">
    
      <div
        className="glass-card p-5 min-w-[280px]"
        style={{ borderColor: `${word.color}40` }}
      >
     
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{word.emoji}</span>
          <div>
            <p className="text-white/60 text-sm font-semibold uppercase tracking-wider">
              Level {word.level} · {levelNames[word.level] || 'Unknown'}
            </p>
            <p className="text-white font-bold text-lg">{word.english}</p>
          </div>
        </div>

        <div
          className="h-px w-full mb-3 opacity-30"
          style={{ background: word.color }}
        />

        {word.sketchfabEmbed && (
          <div className="sketchfab-embed-wrapper w-full mb-4 rounded-xl overflow-hidden bg-black/20" style={{ height: '220px' }}>
            <iframe 
              title={word.english} 
              frameBorder="0" 
              allowFullScreen 
              allow="autoplay; fullscreen; xr-spatial-tracking" 
              // @ts-ignore
              xr-spatial-tracking="true" 
              execution-while-out-of-viewport="true" 
              execution-while-not-rendered="true" 
              web-share="true" 
              src={`${word.sketchfabEmbed}?autostart=1&ui_theme=dark`}
              className="w-full h-full"
            />
          </div>
        )}
        <div className="text-center mb-2">
          <p
            className="text-6xl font-black leading-none"
            style={{ color: word.color, textShadow: `0 0 30px ${word.color}60` }}
          >
            {word.hanzi}
          </p>
        </div>

        <p className="text-center text-white/80 text-xl font-semibold mb-4">
          {word.pinyin}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleSpeak}
            disabled={isSpeaking || isListeningSTT}
            className="w-full py-3 px-6 rounded-2xl font-bold text-base transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
            style={{
              background: isSpeaking || isListeningSTT
                ? `${word.color}60`
                : `linear-gradient(135deg, ${word.color}, ${word.color}cc)`,
              color: 'white',
              boxShadow: isSpeaking || isListeningSTT ? 'none' : `0 4px 20px ${word.color}50`,
            }}
          >
            {isSpeaking ? (
              <>
                <span className="flex gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-white dot-1" />
                  <span className="inline-block w-2 h-2 rounded-full bg-white dot-2" />
                  <span className="inline-block w-2 h-2 rounded-full bg-white dot-3" />
                </span>
                Speaking...
              </>
            ) : (
              <>
                <span className={hasSpoken ? '' : 'sparkle'}>🔊</span>
                {hasSpoken ? 'Listen Again' : 'Listen!'}
              </>
            )}
          </button>

          <button
            onClick={handleSTT}
            disabled={isSpeaking || isListeningSTT}
            className="w-full py-3 px-6 rounded-2xl font-bold text-base transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 bg-gray-800 text-white"
            style={{
              boxShadow: isListeningSTT ? `0 0 15px ${word.color}` : 'none',
              border: `2px solid ${isListeningSTT ? word.color : '#4b5563'}`
            }}
          >
            {isListeningSTT ? (
              <>
                <span className="flex gap-1 animate-pulse">🎤</span>
                Mendengarkan...
              </>
            ) : (
              <>
                <span>🎤</span>
                Coba Bicara!
              </>
            )}
          </button>

          {/* STT Feedback Full-screen Popup */}
          {feedbackSTT && (
            <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm pointer-events-auto">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl scale-up" style={{ animation: 'scaleUp 0.3s ease-out forwards' }}>
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes scaleUp {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                  }
                `}} />
                <img 
                  src={feedbackSTT.isCorrect ? "/PandaBenar.svg" : "/PandaSalah.svg"} 
                  alt={feedbackSTT.isCorrect ? "Benar" : "Salah"} 
                  className="w-48 h-48 mb-6 drop-shadow-xl"
                />
                <h3 className={`text-2xl font-black mb-2 ${feedbackSTT.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                  {feedbackSTT.isCorrect ? "Keren Banget!" : "Oops!"}
                </h3>
                <p className="text-gray-600 mb-8 font-medium text-lg">
                  {feedbackSTT.message}
                </p>
                
                {feedbackSTT.isCorrect ? (
                  <button 
                    onClick={() => {
                      setFeedbackSTT(null);
                      if (onNextLevel) onNextLevel();
                    }}
                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl text-xl transition-transform active:scale-95 shadow-[0_4px_20px_rgba(34,197,94,0.4)]"
                  >
                    Next Level
                  </button>
                ) : (
                  <button 
                    onClick={() => setFeedbackSTT(null)}
                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl text-xl transition-transform active:scale-95 shadow-[0_4px_20px_rgba(239,68,68,0.4)]"
                  >
                    Coba Lagi
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
