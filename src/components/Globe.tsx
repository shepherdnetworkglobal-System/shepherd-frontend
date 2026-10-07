"use client";

import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    if (!canvasRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 1000,
      height: 1000,
      phi: 0,
      theta: 0.2,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 4,
      baseColor: [0.97, 0.95, 0.93],
      markerColor: [0.77, 0.64, 0.35],
      glowColor: [0.97, 0.95, 0.93],
      markers: [
        { location: [1.2921, 36.8219], size: 0.1 },
        { location: [14.5995, 120.9842], size: 0.08 },
        { location: [9.082, 8.6753], size: 0.1 },
        { location: [30.3753, 69.3451], size: 0.07 },
      ],
      onRender: (state: { phi: number }) => {
        state.phi = phi;
        phi += 0.002;
      },
    } as any);

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 opacity-60">
      <div style={{ width: "100%", maxWidth: 800, aspectRatio: 1 }}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}