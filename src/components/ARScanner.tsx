'use client';

import { useEffect, useRef } from 'react';
import { LEVEL_1_WORDS, VocabWord } from '@/lib/vocabulary';

interface ARScannerProps {
  onWordDetected: (word: VocabWord) => void;
  onWordLost: () => void;
  onReady: () => void;
  onError: (error: string) => void;
}

export default function ARScanner({
  onWordDetected,
  onWordLost,
  onReady,
  onError,
}: ARScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    const initAFrame = async () => {
      try {
        // Check for camera access first
        try {
          await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
        } catch (err) {
          onError('Camera access denied. Please allow camera permissions.');
          return;
        }

        // Wait a tiny bit to ensure global AFRAME is ready (loaded via Script tags)
        if (typeof window !== 'undefined' && !(window as any).AFRAME) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Create the a-scene element
        const scene = document.createElement('a-scene');
        scene.setAttribute('embedded', '');
        scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_stereo;');
        scene.setAttribute('vr-mode-ui', 'enabled: false');

        // Add camera
        const camera = document.createElement('a-camera');
        camera.setAttribute('position', '0 0 0');
        scene.appendChild(camera);

        // Add lighting
        const ambientLight = document.createElement('a-light');
        ambientLight.setAttribute('type', 'ambient');
        ambientLight.setAttribute('color', '#ffffff');
        ambientLight.setAttribute('intensity', '0.9');
        scene.appendChild(ambientLight);

        const directionalLight = document.createElement('a-light');
        directionalLight.setAttribute('type', 'directional');
        directionalLight.setAttribute('color', '#ffffff');
        directionalLight.setAttribute('intensity', '1.2');
        directionalLight.setAttribute('position', '5 5 5');
        scene.appendChild(directionalLight);

        // Add markers for each vocabulary word
        LEVEL_1_WORDS.forEach((word, index) => {
          const marker = document.createElement('a-marker');
          // Use different marker patterns
          marker.setAttribute('preset', index === 0 ? 'hiro' : 'kanji');
          marker.id = `marker-${word.id}`;

          // Create model entity
          const entity = document.createElement('a-entity');
          entity.setAttribute('gltf-model', word.modelPath);
          entity.setAttribute('scale', '0.5 0.5 0.5');
          entity.setAttribute('position', '0 0 0');
          entity.setAttribute('animation', 
            'property: rotation; to: 0 360 0; dur: 4000; easing: linear; loop: true'
          );

          // Fallback: Create colored box
          const box = document.createElement('a-box');
          box.setAttribute('color', word.color);
          box.setAttribute('width', '0.1');
          box.setAttribute('height', '0.1');
          box.setAttribute('depth', '0.1');
          box.setAttribute('animation', 
            'property: rotation; to: 0 360 0; dur: 4000; easing: linear; loop: true'
          );

          marker.appendChild(entity);
          marker.appendChild(box);

          // Track marker events
          let lastDetected = false;

          marker.addEventListener('markerFound', () => {
            lastDetected = true;
            onWordDetected(word);
          });

          marker.addEventListener('markerLost', () => {
            lastDetected = false;
            onWordLost();
          });

          scene.appendChild(marker);
          markerRefs.current.set(word.id, marker);
        });

        // Add scene to container
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(scene);

          // Wait for scene to be ready
          setTimeout(() => {
            onReady();
          }, 1000);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'AR initialization failed';
        console.error('AR Error:', err);
        onError(errorMsg);
      }
    };

    initAFrame();

    return () => {
      // Cleanup
      markerRefs.current.clear();
      if (containerRef.current) {
        try {
          containerRef.current.innerHTML = '';
        } catch (e) {
          // Ignore A-Frame disconnectedCallback errors during Fast Refresh
        }
      }
    };
  }, [onWordDetected, onWordLost, onReady, onError]);

  return (
    <div
      ref={containerRef}
      style={{ 
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
    />
  );
}
