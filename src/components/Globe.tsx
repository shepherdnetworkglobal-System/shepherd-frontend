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
    let frame = 0;

    const onResize = () => {
      width = canvas.offsetWidth || 600;
    };
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 2, 2),
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 0,
      diffuse: 1.8,
      mapSamples: 24000,
      mapBrightness: 2.2,
      baseColor: [0.62, 0.56, 0.48],
      markerColor: [0.77, 0.64, 0.35],
      glowColor: [0.95, 0.93, 0.88],
      opacity: 0.95,
      offset: [0, 0],
      scale: 1.05,
      markers: [
        { location: [-1.2921, 36.8219], size: 0.12 },
        { location: [14.5995, 120.9842], size: 0.09 },
        { location: [9.082, 8.6753], size: 0.1 },
        { location: [30.3753, 69.3451], size: 0.08 },
        { location: [0.3476, 32.5825], size: 0.07 },
        { location: [-1.9441, 30.0619], size: 0.06 },
      ],
      onRender: (state: any) => {
        phi += 0.0022;
        state.phi = phi;
        state.width = width * 2;
        state.height = width * 2;
      },
    } as any);

    canvas.style.opacity = "1";
    frame = requestAnimationFrame(() => {
      onResize();
    });

    return () => {
      cancelAnimationFrame(frame);
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="absolute top-[45%] right-[-8%] -translate-y-1/2 w-[min(72vw,820px)] aspect-square pointer-events-none select-none opacity-80">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          opacity: 0,
          transition: "opacity 1.4s ease",
          contain: "layout paint size",
        }}
      />
    </div>
  );
}