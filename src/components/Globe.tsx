"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import { feature } from "topojson-client";
import countries from "world-atlas/countries-110m.json";

const GlobeNoSSR = dynamic(
  async () => {
    const mod = await import("react-globe.gl");
    return mod.default as any;
  },
  { ssr: false }
) as any;

const FIELD_STATIONS = [
  { name: "Kenya", lat: -1.2921, lng: 36.8219 },
  { name: "Nigeria", lat: 9.082, lng: 8.6753 },
  { name: "Philippines", lat: 14.5995, lng: 120.9842 },
  { name: "Pakistan", lat: 30.3753, lng: 69.3451 },
  { name: "Uganda", lat: 0.3476, lng: 32.5825 },
];

export default function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const polygons = useMemo(() => {
    const world: any = countries;
    const countriesFeature: any = feature(world, world.objects.countries);
    return countriesFeature.features || [];
  }, []);

  const globeMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: 0xefebe4,
      transparent: true,
      opacity: 0.9,
      shininess: 4,
      specular: new THREE.Color(0xc4a35a),
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      setSize({
        width: Math.max(320, Math.floor(rect.width)),
        height: Math.max(320, Math.floor(rect.height)),
      });
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!globeRef.current || size.width === 0) return;

    const controls = globeRef.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;
    controls.enableZoom = false;

    globeRef.current.pointOfView(
      {
        lat: 8,
        lng: 35,
        altitude: 1.65,
      },
      900
    );
  }, [size.width]);

  return (
    <div
      ref={containerRef}
      className="absolute top-[45%] right-[-10%] -translate-y-1/2 w-[min(75vw,820px)] aspect-square cursor-grab active:cursor-grabbing select-none"
      title="Click and drag to rotate the globe"
    >
      {size.width > 0 && (
        <GlobeNoSSR
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={globeMaterial}
          showAtmosphere={true}
          atmosphereColor="#C4A35A"
          atmosphereAltitude={0.16}
          polygonsData={polygons}
          polygonAltitude={0.012}
          polygonCapColor={() => "rgba(6, 78, 59, 0.42)"}
          polygonSideColor={() => "rgba(6, 78, 59, 0.08)"}
          polygonStrokeColor={() => "rgba(26, 22, 18, 0.14)"}
          pointsData={FIELD_STATIONS}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={0.035}
          pointRadius={0.55}
          pointResolution={24}
          pointColor={() => "#C4A35A"}
          labelsData={FIELD_STATIONS}
          labelLat="lat"
          labelLng="lng"
          labelText="name"
          labelSize={0.9}
          labelDotRadius={0.25}
          labelColor={() => "rgba(26, 22, 18, 0.9)"}
          labelResolution={3}
          ringsData={FIELD_STATIONS}
          ringLat="lat"
          ringLng="lng"
          ringMaxRadius={5}
          ringPropagationSpeed={1.2}
          ringRepeatPeriod={1800}
          ringColor={() => [
            "rgba(196, 163, 90, 0.65)",
            "rgba(6, 78, 59, 0.05)",
          ]}
        />
      )}
    </div>
  );
}