"use client";

import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let phi = 0;
    let width = 0;

    const onResize = () => {
      width = canvas.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.25,
      dark: 0,
      diffuse: 0.4,
      mapSamples: 16000,
      mapBrightness: 1.2,
      baseColor: [1, 1, 1],
      markerColor: [0.77, 0.64, 0.35],
      glowColor: [1, 1, 1],
      markers: [
        { location: [-1.2921, 36.8219], size: 0.07 },
        { location: [9.082, 8.6753], size: 0.06 },
        { location: [14.5995, 120.9842], size: 0.05 },
        { location: [30.3753, 69.3451], size: 0.05 },
        { location: [0.3476, 32.5825], size: 0.04 },
      ],
      onRender: (state: Record<string, unknown>) => {
        phi += 0.004;
        state.phi = phi;
        state.width = width * 2;
        state.height = width * 2;
      },
    } as any);

    setTimeout(() => {
      canvas.style.opacity = "1";
    }, 50);

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="absolute top-[45%] right-[-8%] -translate-y-1/2 w-[min(78vw,860px)] aspect-square pointer-events-none select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          opacity: 0,
          transition: "opacity 1s ease",
          contain: "layout paint size",
        }}
      />
    </div>
  );
}