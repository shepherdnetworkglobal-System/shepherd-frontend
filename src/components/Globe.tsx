"use client";

import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = 0;
    let phi = 0;

    const onResize = () => {
      width = canvas.offsetWidth || 600;
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
      diffuse: 1.2,
      mapSamples: 20000,
      mapBrightness: 6,
      baseColor: [0.88, 0.84, 0.78],
      markerColor: [0.04, 0.31, 0.23],
      glowColor: [0.97, 0.95, 0.93],
      markers: [
        { location: [-1.2921, 36.8219], size: 0.1 },
        { location: [14.5995, 120.9842], size: 0.08 },
        { location: [9.082, 8.6753], size: 0.09 },
        { location: [30.3753, 69.3451], size: 0.07 },
        { location: [0.3476, 32.5825], size: 0.06 },
        { location: [-1.9441, 30.0619], size: 0.05 },
      ],
      onRender: (state: any) => {
        phi += 0.0025;
        state.phi = phi;
        state.width = width * 2;
        state.height = width * 2;
      },
    } as any);

    setTimeout(() => {
      canvas.style.opacity = "1";
    }, 100);

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="absolute top-[42%] right-[-12%] -translate-y-1/2 w-[min(75vw,880px)] aspect-square pointer-events-none select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          opacity: 0,
          transition: "opacity 1.5s ease",
          contain: "layout paint size",
        }}
      />
    </div>
  );
}