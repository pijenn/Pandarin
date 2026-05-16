'use client';

import { useEffect, useRef } from 'react';
import { VocabWord } from '@/lib/vocabulary';

interface ARScannerProps {
  onWordDetected: (word: VocabWord) => void;
  onWordLost: () => void;
  onReady: () => void;
  onError: (error: string) => void;
  words: VocabWord[];
  targetMindFile: string;
}

export default function ARScanner({
  onWordDetected,
  onWordLost,
  onReady,
  onError,
  words,
  targetMindFile,
}: ARScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let isMounted = true;

    // ── Step 1: load A-Frame + MindAR via CDN script tags ──────────────────
    const loadScripts = async () => {
      await injectScript(
        'https://aframe.io/releases/1.3.0/aframe.min.js',
        'aframe-script'
      );
      await injectScript(
        'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js',
        'mindar-script'
      );
    };

    // ── Step 2: build the a-scene after scripts are loaded ─────────────────
    const buildScene = () => {
      if (!isMounted || !containerRef.current) return;

      containerRef.current.innerHTML = '';

      const scene = document.createElement('a-scene') as any;
      // uiScanning: no removes the yellow scanning box so it scans full screen silently
      scene.setAttribute(
        'mindar-image',
        `imageTargetSrc: ${targetMindFile}; uiScanning: no;`
      );
      scene.setAttribute('color-space', 'sRGB');
      scene.setAttribute('renderer', 'colorManagement: true, physicallyCorrectLights');
      scene.setAttribute('vr-mode-ui', 'enabled: false');
      scene.setAttribute('device-orientation-permission-ui', 'enabled: false');

      Object.assign(scene.style, {
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: '0',
        left: '0',
        zIndex: '0',
      });

      // ── Camera ──────────────────────────────────────────────────────────
      const camera = document.createElement('a-camera');
      camera.setAttribute('position', '0 0 0');
      camera.setAttribute('look-controls', 'enabled: false');
      scene.appendChild(camera);

      // ── Targets ─────────────────────────────────────────────────────────
      words.forEach((word) => {
        if (word.markerIndex === undefined) return;
        
        const target = document.createElement('a-entity');
        target.setAttribute('mindar-image-target', `targetIndex: ${word.markerIndex}`);

        target.addEventListener('targetFound', () => {
          if (isMounted) onWordDetected(word);
        });
        target.addEventListener('targetLost', () => {
          if (isMounted) onWordLost();
        });

        scene.appendChild(target);
      });

      containerRef.current!.appendChild(scene);

      // Fix: Ensure MindAR canvas and video are correctly styled
      const fixARVideo = () => {
        document.querySelectorAll('canvas.a-canvas, .a-canvas').forEach((el) => {
          Object.assign((el as HTMLElement).style, {
            width: '100vw',
            height: '100vh',
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: '0',
            backgroundColor: 'transparent',
          });
        });

        document.querySelectorAll('body > video, video').forEach((el) => {
          const video = el as HTMLVideoElement;
          Object.assign(video.style, {
            width: '100vw',
            height: '100vh',
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: '-2', // MindAR needs video far behind
            objectFit: 'cover',
            display: 'block',
          });
          
          if (video.paused) {
            video.play().catch(e => console.error("Video play error:", e));
          }
        });
      };

      [500, 1000, 2000, 3000].forEach((ms) =>
        setTimeout(() => { if (isMounted) fixARVideo(); }, ms)
      );

      const observer = new MutationObserver(fixARVideo);
      observer.observe(document.body, { childList: true, subtree: false });

      // MindAR usually takes a bit to initialize
      scene.addEventListener('arReady', () => {
        if (isMounted) onReady();
      });

      // Fallback ready signal
      setTimeout(() => { if (isMounted) onReady(); }, 3000);

      cleanupRef.current = () => {
        observer.disconnect();
        // Force stop mindar and clean up video
        const systems = scene.systems;
        if (systems && systems['mindar-image-system']) {
          systems['mindar-image-system'].stop();
        }
        document.querySelectorAll('body > video, video').forEach((v) => {
          const vid = v as HTMLVideoElement;
          vid.pause();
          vid.srcObject = null;
          vid.remove();
        });
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
  }, [onWordDetected, onWordLost, onReady, onError, words, targetMindFile]);

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

const scriptPromises = new Map<string, Promise<void>>();

function injectScript(src: string, id: string): Promise<void> {
  if (scriptPromises.has(id)) {
    return scriptPromises.get(id)!;
  }

  const promise = new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
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