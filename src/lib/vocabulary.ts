// lib/vocabulary.ts
// Pandarin Level 1 vocabulary - single nouns/characters

export interface VocabWord {
  id: string;
  hanzi: string;       // Chinese character
  pinyin: string;      // Romanized pronunciation with tones
  english: string;     // English translation
  emoji: string;       // Emoji representation
  color: string;       // Card accent color
  modelPath: string;   // Path to 3D model in /public/models/
  markerIndex: number; // MindAR marker index (0-based from .mind file)
}

// Level 1: Basic nouns
// markerIndex maps to the order of images in your MindAR .mind target file
export const LEVEL_1_WORDS: VocabWord[] = [
  {
    id: 'apple',
    hanzi: '苹果',
    pinyin: 'píng guǒ',
    english: 'Apple',
    emoji: '🍎',
    color: '#FF4757',
    modelPath: '/models/apple.glb',       // Add your GLB here
    markerIndex: 0,
  },
  // Add more words as you expand:
  // {
  //   id: 'water',
  //   hanzi: '水',
  //   pinyin: 'shuǐ',
  //   english: 'Water',
  //   emoji: '💧',
  //   color: '#4D96FF',
  //   modelPath: '/models/water.glb',
  //   markerIndex: 1,
  // },
  // {
  //   id: 'cat',
  //   hanzi: '猫',
  //   pinyin: 'māo',
  //   english: 'Cat',
  //   emoji: '🐱',
  //   color: '#FFD93D',
  //   modelPath: '/models/cat.glb',
  //   markerIndex: 2,
  // },
];

// Get a word by its marker index
export function getWordByMarkerIndex(index: number): VocabWord | undefined {
  return LEVEL_1_WORDS.find((w) => w.markerIndex === index);
}
