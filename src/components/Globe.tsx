"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 700;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 230;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Cinematic angle tilt
    globeGroup.rotation.x = 0.38;
    globeGroup.rotation.z = -0.15;

    // LARGE GLOBE RADIUS
    const sphereRadius = 90;

    // 3. Inner Solid Base Sphere (prevents back dots from bleeding through)
    const sphereGeo = new THREE.SphereGeometry(sphereRadius - 0.8, 64, 64);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xefebe4, // Warm Ivory
      transparent: true,
      opacity: 0.92,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphereMesh);

    // Soft Gold Atmosphere Glow Ring
    const glowGeo = new THREE.SphereGeometry(sphereRadius + 1.2, 64, 64);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xc4a35a,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    globeGroup.add(glowMesh);

    // 4. Circular particle dot texture
    const createDotTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.arc(16, 16, 13, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };
    const dotTexture = createDotTexture();

    // Helper: Convert Lat/Lng to 3D Cartesian Vector
    const latLngToVector3 = (lat: number, lng: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // 5. Build True Continent Points via Canvas Map Sampling
    const mapCanvas = document.createElement("canvas");
    const mapWidth = 800;
    const mapHeight = 400;
    mapCanvas.width = mapWidth;
    mapCanvas.height = mapHeight;
    const ctx = mapCanvas.getContext("2d");

    const img = new Image();
    // High-resolution World Map Silhouette SVG Data URL
    img.crossOrigin = "anonymous";
    img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'><rect width='800' height='400' fill='black'/><g fill='white'><path d='M130,80 Q180,40 260,60 T350,110 T250,190 T150,160 Z'/><path d='M230,200 Q280,190 320,240 T300,340 T220,320 T200,240 Z'/><path d='M380,60 Q440,40 480,70 T450,120 T390,100 Z'/><path d='M390,130 Q470,110 520,170 T480,310 T390,280 T370,180 Z'/><path d='M500,50 Q630,30 720,80 T760,180 T650,220 T520,140 Z'/><path d='M630,240 Q710,230 740,280 T690,340 T610,300 Z'/></g></svg>";

    const sampleAndBuildGlobe = () => {
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, mapWidth, mapHeight);
      const imageData = ctx.getImageData(0, 0, mapWidth, mapHeight);
      const data = imageData.data;

      const positions: number[] = [];
      const colors: number[] = [];

      const dotColorTaupe = new THREE.Color(0x7a736a);
      const dotColorEmerald = new THREE.Color(0x064e3b);

      const rows = 140;
      const cols = 280;

      for (let r = 0; r < rows; r++) {
        const lat = 90 - (r / rows) * 180;
        const yPx = Math.floor((r / rows) * mapHeight);

        for (let c = 0; c < cols; c++) {
          const lng = (c / cols) * 360 - 180;
          const xPx = Math.floor((c / cols) * mapWidth);

          const pixelIndex = (yPx * mapWidth + xPx) * 4;
          const rVal = data[pixelIndex];

          // If pixel is land (white)
          if (rVal > 100) {
            const vec = latLngToVector3(lat, lng, sphereRadius + 0.8);
            positions.push(vec.x, vec.y, vec.z);

            const chosenColor = Math.random() > 0.4 ? dotColorEmerald : dotColorTaupe;
            colors.push(chosenColor.r, chosenColor.g, chosenColor.b);
          }
        }
      }

      const landGeo = new THREE.BufferGeometry();
      landGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      landGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

      const landMat = new THREE.PointsMaterial({
        size: 2.6,
        map: dotTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        alphaTest: 0.1,
      });

      const landPoints = new THREE.Points(landGeo, landMat);
      globeGroup.add(landPoints);
    };

    img.onload = () => {
      sampleAndBuildGlobe();
    };

    // Fallback if image load delay occurs
    if (img.complete) {
      sampleAndBuildGlobe();
    }

    // 6. Active Field Beacons (Kenya, Nigeria, Philippines, Pakistan, Uganda)
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
      const pinGeo = new THREE.SphereGeometry(2.0, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0xc4a35a });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      beaconGroup.add(pinMesh);

      // Outer Pulsing Ring
      const ringGeo = new THREE.RingGeometry(2.2, 4.0, 32);
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

    // 7. Interactive Mouse Drag Controls
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

    // 8. Render Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDragging) {
        globeGroup.rotation.y += 0.002;
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
      className="absolute top-[42%] right-[-10%] -translate-y-1/2 w-[min(80vw,900px)] aspect-square cursor-grab active:cursor-grabbing select-none"
      title="Click and drag to rotate the globe"
    />
  );
}