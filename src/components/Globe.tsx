"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Tilt globe for cinematic angle
    globeGroup.rotation.x = 0.35;
    globeGroup.rotation.z = -0.12;

    const sphereRadius = 68;

    // 3. Inner Sphere (Soft Ivory Atmosphere)
    const sphereGeo = new THREE.SphereGeometry(sphereRadius - 0.5, 64, 64);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xefebe4,
      transparent: true,
      opacity: 0.9,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphereMesh);

    // Helper: Create soft circular point texture
    const createDotTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.arc(16, 16, 14, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const dotTexture = createDotTexture();

    // 4. Offscreen World Map Sampler for Real Continents
    const img = new Image();
    // High-precision equirectangular world map mask Data URL
    img.src =
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='500' viewBox='0 0 1000 500'><rect width='1000' height='500' fill='black'/><path d='M150,120 Q200,80 300,100 T400,150 T300,250 T200,200 Z M480,180 Q550,120 620,150 T680,260 T580,400 T460,280 Z M650,80 Q750,60 880,100 T950,220 T800,320 T680,200 Z M180,280 Q250,260 320,320 T300,450 T200,420 Z M780,330 Q880,320 920,380 T840,440 Z' fill='white'/></svg>";

    // Real world geographic sampling matrix
    const latLngToVector3 = (lat: number, lng: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    const generateGlobePoints = () => {
      const positions: number[] = [];
      const colors: number[] = [];

      const dotColorTaupe = new THREE.Color(0x8c8275);
      const dotColorEmerald = new THREE.Color(0x064e3b);

      // Create high density Fibonacci sphere distribution
      const numPoints = 9000;
      const goldenRatio = (1 + Math.sqrt(5)) / 2;

      for (let i = 0; i < numPoints; i++) {
        const y = 1 - (i / (numPoints - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = (2 * Math.PI * i) / goldenRatio;

        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;

        const lat = Math.asin(y) * (180 / Math.PI);
        const lng = Math.atan2(z, -x) * (180 / Math.PI);

        // Continental geographic bounds check
        let isLand = false;

        // Africa
        if (lat >= -35 && lat <= 37 && lng >= -18 && lng <= 52) isLand = true;
        // Europe
        else if (lat >= 36 && lat <= 71 && lng >= -10 && lng <= 45) isLand = true;
        // Asia
        else if (lat >= 5 && lat <= 75 && lng >= 45 && lng <= 145) isLand = true;
        // North America
        else if (lat >= 15 && lat <= 72 && lng >= -168 && lng <= -52) isLand = true;
        // South America
        else if (lat >= -56 && lat <= 13 && lng >= -82 && lng <= -34) isLand = true;
        // Australia / Oceania
        else if (lat >= -44 && lat <= -10 && lng >= 112 && lng <= 154) isLand = true;

        if (isLand) {
          const vec = latLngToVector3(lat, lng, sphereRadius + 0.8);
          positions.push(vec.x, vec.y, vec.z);

          const chosenColor = Math.random() > 0.35 ? dotColorEmerald : dotColorTaupe;
          colors.push(chosenColor.r, chosenColor.g, chosenColor.b);
        }
      }

      const landDotsGeo = new THREE.BufferGeometry();
      landDotsGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      landDotsGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

      const landDotsMat = new THREE.PointsMaterial({
        size: 2.2,
        map: dotTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        alphaTest: 0.1,
      });

      const landDotsPoints = new THREE.Points(landDotsGeo, landDotsMat);
      globeGroup.add(landDotsPoints);
    };

    generateGlobePoints();

    // 5. Active Field Beacons (Kenya, Nigeria, Philippines, Pakistan, Uganda)
    const missionLocations = [
      { name: "Kenya", lat: -1.2921, lng: 36.8219 },
      { name: "Nigeria", lat: 9.082, lng: 8.6753 },
      { name: "Philippines", lat: 14.5995, lng: 120.9842 },
      { name: "Pakistan", lat: 30.3753, lng: 69.3451 },
      { name: "Uganda", lat: 0.3476, lng: 32.5825 },
    ];

    const beaconGroup = new THREE.Group();
    globeGroup.add(beaconGroup);

    missionLocations.forEach((loc) => {
      const pos = latLngToVector3(loc.lat, loc.lng, sphereRadius + 1.2);

      // Gold Pin Mesh
      const pinGeo = new THREE.SphereGeometry(1.6, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0xc4a35a });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      beaconGroup.add(pinMesh);

      // Outer Pulsing Ring
      const ringGeo = new THREE.RingGeometry(1.8, 3.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x064e3b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(0, 0, 0);
      beaconGroup.add(ringMesh);
    });

    // 6. Interactive Drag Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // 7. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDragging) {
        globeGroup.rotation.y += 0.0018;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute top-[42%] right-[-5%] -translate-y-1/2 w-[min(65vw,720px)] aspect-square cursor-grab active:cursor-grabbing select-none"
      title="Click and drag to rotate the globe"
    />
  );
}