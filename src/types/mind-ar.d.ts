declare module 'mind-ar/dist/mindar-image-three.prod.js' {
  export class MindARThree {
    constructor(config: {
      container: HTMLElement;
      imageTargetSrc: string;
      maxTrack?: number;
      filterMinCF?: number;
      filterBeta?: number;
      missTolerance?: number;
      warmupTolerance?: number;
    });
    addAnchor(markerIndex: number): any;
    start(): Promise<void>;
    stop(): void;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
  }
}
