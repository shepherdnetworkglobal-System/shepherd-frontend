"use client";

import React, { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    let phi = 0;
    const canvas = canvasRef.current;
    const width = canvas.parentElement?.clientWidth || 650;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.22,
      dark: 0,
      diffuse: 0.8,
      mapSamples: 16000,
      mapBrightness: 0.35, // CRITICAL FIX: Values < 0.5 create dark continent dots on light base
      baseColor: [0.97, 0.95, 0.93], // Warm Ivory #F7F4EF
      markerColor: [0.77, 0.64, 0.35], // Gold pins
      glowColor: [0.97, 0.95, 0.93],
      markers: [
        { location: [-1.2921, 36.8219], size: 0.08 }, // Kenya
        { location: [9.082, 8.6753], size: 0.07 },  // Nigeria
        { location: [14.5995, 120.9842], size: 0.06 }, // Philippines
        { location: [30.3753, 69.3451], size: 0.06 }, // Pakistan
        { location: [0.3476, 32.5825], size: 0.05 }, // Uganda
      ],
      onRender: (state: Record<string, unknown>) => {
        phi += 0.003;
        state.phi = phi;
      },
    } as any);

    return () => {
      globe.destroy();
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="absolute top-[42%] right-[-8%] -translate-y-1/2 w-[min(72vw,800px)] aspect-square pointer-events-none select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}