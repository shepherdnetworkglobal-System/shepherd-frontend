"use client";

import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = 0;
    const onResize = () => {
      if (canvas) {
        width = canvas.offsetWidth;
      }
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
      mapBrightness: 8,
      baseColor: [0.92, 0.89, 0.84],
      markerColor: [0.77, 0.64, 0.35],
      glowColor: [0.97, 0.95, 0.93],
      markers: [
        { location: [-1.2921, 36.8219], size: 0.08 },
        { location: [14.5995, 120.9842], size: 0.06 },
        { location: [9.082, 8.6753], size: 0.07 },
        { location: [30.3753, 69.3451], size: 0.05 },
      ],
      onRender: (state: any) => {
        if (!pointerInteracting.current) {
          phiRef.current += 0.0025;
        }
        state.phi = phiRef.current + pointerInteractionMovement.current;
        state.width = width * 2;
        state.height = width * 2;
      },
    } as any);

    canvas.style.opacity = "1";

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="absolute top-1/2 right-[-10%] -translate-y-1/2 w-[70vw] max-w-[900px] aspect-square pointer-events-none select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          opacity: 0,
          transition: "opacity 1.2s ease",
          contain: "layout paint size",
        }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta / 100;
          }
        }}
      />
    </div>
  );
}