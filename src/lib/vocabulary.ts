// lib/vocabulary.ts
// Pandarin vocabulary dictionary

export interface VocabWord {
  id: string;
  level: number;       // Level of the word
  hanzi: string;       // Chinese character
  pinyin: string;      // Romanized pronunciation with tones
  english: string;     // English translation
  emoji: string;       // Emoji representation
  color: string;       // Card accent color
  modelPath: string;   // Path to 3D model in /public/models/
  markerIndex: number; // MindAR marker index (0-based from .mind file)
  sketchfabEmbed?: string; // Sketchfab iframe embed HTML
}

// Level 1: Basic nouns
// markerIndex maps to the order of images in your MindAR .mind target file
export const LEVEL_1_WORDS: VocabWord[] = [
  {
    id: 'level1',
    level: 1,
    hanzi: '苹果',
    pinyin: 'píngguǒ',
    english: 'Apel',
    emoji: '🍎',
    color: '#FF4757',
    modelPath: '',
    markerIndex: 0,
    sketchfabEmbed: 'https://sketchfab.com/models/1dfea701d5aa4ea0975ca921e0620fee/embed',
  },
];

export const LEVEL_2_WORDS: VocabWord[] = [
  {
    id: 'level2',
    level: 2,
    hanzi: '喝水',
    pinyin: 'hē shuǐ',
    english: 'Sedang minum',
    emoji: '💧',
    color: '#4D96FF',
    modelPath: '',
    markerIndex: 0,
    sketchfabEmbed: 'https://sketchfab.com/models/2790e2c9c7f04c4b94d836cd3055093c/embed',
  },
];

export const LEVEL_3_WORDS: VocabWord[] = [
  {
    id: 'level3',
    level: 3,
    hanzi: '工人正在建房子',
    pinyin: 'gōngrén zhèngzài jiàn fángzi',
    english: 'Para pekerja sedang membangun rumah',
    emoji: '👷',
    color: '#FFD93D',
    modelPath: '',
    markerIndex: 0,
    sketchfabEmbed: 'https://sketchfab.com/models/a99c39331bf047acafdc64a6ed37d151/embed',
  },
];

// Helper to get words by level
export function getWordsByLevel(level: number): VocabWord[] {
  switch (level) {
    case 1: return LEVEL_1_WORDS;
    case 2: return LEVEL_2_WORDS;
    case 3: return LEVEL_3_WORDS;
    default: return [];
  }
}

// Get a word by its marker index and level
export function getWordByMarkerIndex(index: number, level: number = 1): VocabWord | undefined {
  const words = getWordsByLevel(level);
  return words.find((w) => w.markerIndex === index);
}
