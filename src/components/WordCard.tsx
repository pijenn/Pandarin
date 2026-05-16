'use client';

import { useState, useEffect } from 'react';
import { VocabWord } from '@/lib/vocabulary';
import { speakMandarin } from '@/lib/tts';

interface WordCardProps {
  word: VocabWord;
  onLevelComplete?: (level: number) => void;
}

export default function WordCard({ word, onLevelComplete }: WordCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; x: number }[]>([]);
  const [isListeningSTT, setIsListeningSTT] = useState(false);
  const [feedbackSTT, setFeedbackSTT] = useState<{ message: string; isCorrect: boolean } | null>(null);

  // Auto-play pronunciation when card appears
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSpeak();
    }, 600);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Bersihkan tanda baca dari hasil transcript
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
      {/* Floating emoji burst */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingEmojis.map((e) => (
          <span
            key={e.id}
            className="float-emoji absolute bottom-0 text-2xl select-none"
            style={{ left: `${e.x}%` }}
          >
            {word.emoji}
          </span>
        ))}
      </div>

      {/* Word card */}
      <div
        className="glass-card p-5 min-w-[280px]"
        style={{ borderColor: `${word.color}40` }}
      >
        {/* Emoji + English */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{word.emoji}</span>
          <div>
            <p className="text-white/60 text-sm font-semibold uppercase tracking-wider">
              Level {word.level} · {word.level === 1 ? 'Basic' : word.level === 2 ? 'Intermediate' : 'Advanced'}
            </p>
            <p className="text-white font-bold text-lg">{word.english}</p>
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px w-full mb-3 opacity-30"
          style={{ background: word.color }}
        />

        {/* Sketchfab Embed */}
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
              src={word.sketchfabEmbed}
              className="w-full h-full"
            />
          </div>
        )}

        {/* Hanzi */}
        <div className="text-center mb-2">
          <p
            className="text-6xl font-black leading-none"
            style={{ color: word.color, textShadow: `0 0 30px ${word.color}60` }}
          >
            {word.hanzi}
          </p>
        </div>

        {/* Pinyin */}
        <p className="text-center text-white/80 text-xl font-semibold mb-4">
          {word.pinyin}
        </p>

        {/* Actions Container */}
        <div className="flex flex-col gap-3">
          {/* Speak button */}
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

          {/* STT button */}
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

          {/* STT Feedback */}
          {feedbackSTT && (
            <div className={`flex flex-col items-center justify-center text-center font-semibold text-sm p-3 rounded-xl mt-2 animate-in fade-in zoom-in duration-300 ${feedbackSTT.isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              <img 
                src={feedbackSTT.isCorrect ? '/PandaBenar.svg' : '/PandaSalah.svg'} 
                alt={feedbackSTT.isCorrect ? 'Panda Benar' : 'Panda Salah'} 
                className={`w-28 h-auto mb-2 ${feedbackSTT.isCorrect ? 'animate-bounce' : ''}`}
              />
              <p>{feedbackSTT.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
