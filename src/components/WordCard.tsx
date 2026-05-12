'use client';

import { useState, useEffect } from 'react';
import { VocabWord } from '@/lib/vocabulary';
import { speakMandarin } from '@/lib/tts';

interface WordCardProps {
  word: VocabWord;
}

export default function WordCard({ word }: WordCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; x: number }[]>([]);

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
              Level 1 · Basic
            </p>
            <p className="text-white font-bold text-lg">{word.english}</p>
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px w-full mb-3 opacity-30"
          style={{ background: word.color }}
        />

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

        {/* Speak button */}
        <button
          onClick={handleSpeak}
          disabled={isSpeaking}
          className="w-full py-3 px-6 rounded-2xl font-bold text-base transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          style={{
            background: isSpeaking
              ? `${word.color}60`
              : `linear-gradient(135deg, ${word.color}, ${word.color}cc)`,
            color: 'white',
            boxShadow: isSpeaking ? 'none' : `0 4px 20px ${word.color}50`,
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
      </div>
    </div>
  );
}
