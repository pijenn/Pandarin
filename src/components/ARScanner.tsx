'use client';

import { useEffect, useRef } from 'react';
import { LEVEL_1_WORDS, VocabWord } from '@/lib/vocabulary';

interface ARScannerProps {
  onWordDetected: (word: VocabWord) => void;
  onWordLost: () => void;
  onReady: () => void;
  onError: (error: string) => void;
}

// Preset markers available in AR.js without any .patt file
const AR_PRESETS = ['hiro', 'kanji'];

export default function ARScanner({
  onWordDetected,
  onWordLost,
  onReady,
  onError,
}: ARScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let isMounted = true;

    // ── Step 1: load A-Frame + AR.js via CDN script tags ──────────────────
    // We avoid npm imports because AR.js conflicts with Next.js SSR/React 19.
    const loadScripts = async () => {
      await injectScript(
        'https://aframe.io/releases/1.2.0/aframe.min.js',
        'aframe-script'
      );
      await injectScript(
        'https://raw.githack.com/AR-js-org/AR.js/3.3.2/aframe/build/aframe-ar.js',
        'arjs-script'
      );
    };

    // ── Step 2: build the a-scene after scripts are loaded ─────────────────
    const buildScene = () => {
      if (!isMounted || !containerRef.current) return;

      // Remove any stale scene from previous mount
      containerRef.current.innerHTML = '';

      const scene = document.createElement('a-scene') as any;
      scene.setAttribute('embedded', '');
      scene.setAttribute('background', 'transparent: true');
      scene.setAttribute('renderer', 'alpha: true; antialias: true;');
      scene.setAttribute(
        'arjs',
        'sourceType: webcam; debugUIEnabled: false;'
      );
      scene.setAttribute('vr-mode-ui', 'enabled: false');

      // Critical sizing — a-scene must have explicit dimensions
      Object.assign(scene.style, {
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: '0',
        left: '0',
        zIndex: '0',
      });

      // ── Camera ──────────────────────────────────────────────────────────
      const camera = document.createElement('a-entity');
      camera.setAttribute('camera', '');
      camera.setAttribute('look-controls', 'enabled: false');
      scene.appendChild(camera);

      // ── Lighting ────────────────────────────────────────────────────────
      const ambient = document.createElement('a-light');
      ambient.setAttribute('type', 'ambient');
      ambient.setAttribute('color', '#ffffff');
      ambient.setAttribute('intensity', '0.9');
      scene.appendChild(ambient);

      const dir = document.createElement('a-light');
      dir.setAttribute('type', 'directional');
      dir.setAttribute('color', '#ffffff');
      dir.setAttribute('intensity', '1.2');
      dir.setAttribute('position', '5 5 5');
      scene.appendChild(dir);

      // ── Markers ─────────────────────────────────────────────────────────
      LEVEL_1_WORDS.forEach((word, i) => {
        const marker = document.createElement('a-marker');

        if (i < AR_PRESETS.length) {
          // Use built-in hiro/kanji presets — no .patt file needed
          marker.setAttribute('preset', AR_PRESETS[i]);
        } else {
          // Fallback to hiro for any additional words
          marker.setAttribute('preset', 'hiro');
        }

        marker.id = `marker-${word.id}`;

        // Spinning colored box (shows while 3D model loads / as fallback)
        const box = document.createElement('a-box');
        box.setAttribute('color', word.color);
        box.setAttribute('width', '0.08');
        box.setAttribute('height', '0.08');
        box.setAttribute('depth', '0.08');
        box.setAttribute('position', '0 0.04 0');
        box.setAttribute(
          'animation',
          'property: rotation; to: 0 360 0; dur: 3000; easing: linear; loop: true'
        );
        marker.appendChild(box);

        // Text label above the box
        const text = document.createElement('a-text');
        text.setAttribute('value', `${word.hanzi}\n${word.pinyin}`);
        text.setAttribute('align', 'center');
        text.setAttribute('color', '#FFFFFF');
        text.setAttribute('position', '0 0.2 0');
        text.setAttribute('scale', '0.3 0.3 0.3');
        marker.appendChild(text);

        // 3D model (if GLB exists)
        const model = document.createElement('a-entity');
        model.setAttribute('gltf-model', word.modelPath);
        model.setAttribute('scale', '0.05 0.05 0.05');
        model.setAttribute('position', '0 0.05 0');
        model.setAttribute(
          'animation',
          'property: rotation; to: 0 360 0; dur: 4000; easing: linear; loop: true'
        );
        marker.appendChild(model);

        marker.addEventListener('markerFound', () => {
          if (isMounted) onWordDetected(word);
        });
        marker.addEventListener('markerLost', () => {
          if (isMounted) onWordLost();
        });

        scene.appendChild(marker);
      });

      containerRef.current!.appendChild(scene);

      // Fix: AR.js injects <video> directly into <body> — force it visible
      const fixARVideo = () => {
        // Fix canvas
        document.querySelectorAll('canvas.a-canvas, .a-canvas').forEach((el) => {
          Object.assign((el as HTMLElement).style, {
            width: '100vw',
            height: '100vh',
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: '0',
            backgroundColor: 'transparent', // Force transparency on the canvas element
          });
        });

        // Fix video element AR.js injects into <body>
        document.querySelectorAll('body > video, #arjs-video').forEach((el) => {
          const video = el as HTMLVideoElement;
          Object.assign(video.style, {
            width: '100vw',
            height: '100vh',
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: '-1', // Behind the canvas but above the browser background
            objectFit: 'cover',
            display: 'block',
          });
          
          // CRITICAL: Force video to play if browser blocked autoplay
          if (video.paused) {
            video.play().catch(e => console.error("Video play error:", e));
          }
        });
      };

      // Run multiple times — AR.js injects video asynchronously
      [300, 600, 1000, 1500, 2000].forEach((ms) =>
        setTimeout(() => { if (isMounted) fixARVideo(); }, ms)
      );

      // Also watch DOM for late-injected video
      const observer = new MutationObserver(fixARVideo);
      observer.observe(document.body, { childList: true, subtree: false });

      // Signal ready after 2s (AR.js init time)
      setTimeout(() => { if (isMounted) onReady(); }, 2000);

      // Cleanup function
      cleanupRef.current = () => {
        observer.disconnect();
        // Remove AR.js video from body
        document.querySelectorAll('body > video, #arjs-video').forEach((v) => v.remove());
        if (containerRef.current) containerRef.current.innerHTML = '';
      };
    };

    const run = async () => {
      try {
        await loadScripts();
        if (isMounted) buildScene();
      } catch (err: any) {
        if (isMounted) onError(err?.message ?? 'Failed to load AR libraries');
      }
    };

    run();

    return () => {
      isMounted = false;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [onWordDetected, onWordLost, onReady, onError]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0,
        overflow: 'hidden',
        backgroundColor: 'transparent',
      }}
    />
  );
}

// Keep track of loading promises to prevent double-injection in React Strict Mode
const scriptPromises = new Map<string, Promise<void>>();

// ── Inject script tag once, return Promise that resolves when loaded ─────────
function injectScript(src: string, id: string): Promise<void> {
  if (scriptPromises.has(id)) {
    return scriptPromises.get(id)!;
  }

  const promise = new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve(); // already loaded
      return;
    }
    const s = document.createElement('script');
    s.id = id;
    s.src = src;
    s.crossOrigin = 'anonymous';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
  });

  scriptPromises.set(id, promise);
  return promise;
}