import { useState, useEffect, useCallback } from 'react';

export function useLeveling() {
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pandarin_unlocked_levels');
      if (saved) {
        setUnlockedLevels(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load levels from local storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const unlockNextLevel = useCallback((currentLevel: number) => {
    setUnlockedLevels((prev) => {
      const nextLevel = currentLevel + 1;
      if (prev.includes(nextLevel)) return prev;
      
      const newLevels = [...prev, nextLevel];
      try {
        localStorage.setItem('pandarin_unlocked_levels', JSON.stringify(newLevels));
      } catch (e) {
        console.error('Failed to save level progress', e);
      }
      return newLevels;
    });
  }, []);

  const isLevelUnlocked = useCallback((level: number) => {
    return unlockedLevels.includes(level);
  }, [unlockedLevels]);

  return { unlockedLevels, unlockNextLevel, isLevelUnlocked, isLoaded };
}
