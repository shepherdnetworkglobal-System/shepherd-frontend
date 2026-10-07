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

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 230;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Cinematic angle tilt
    globeGroup.rotation.x = 0.35;
    globeGroup.rotation.z = -0.12;

    const sphereRadius = 82;

    // 3. Inner Sphere (Warm Ivory Base)
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 64);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xefebe4,
      transparent: true,
      opacity: 0.92,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphereMesh);

    // Atmosphere Glow Ring
    const auraGeo = new THREE.SphereGeometry(sphereRadius + 1.8, 64, 64);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xc4a35a,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    globeGroup.add(auraMesh);

    // 4. Soft Circular Texture for Particle Beads
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

    // 5. Convert Lat/Lng to 3D Cartesian Vector
    const latLngToVector3 = (lat: number, lng: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // 6. Precise Geographic Landmass Sampler
    const isLandPoint = (lat: number, lng: number): boolean => {
      if (lat < -56) return false; // Exclude Antarctica base

      // Africa
      if (lat >= -35 && lat <= 37 && lng >= -18 && lng <= 51) {
        if (lat > 5 && lng < -5) return false;
        return true;
      }
      // Europe
      if (lat >= 36 && lat <= 71 && lng >= -10 && lng <= 45) return true;
      // Asia / Middle East
      if (lat >= 5 && lat <= 75 && lng >= 45 && lng <= 148) {
        if (lat < 10 && lng < 95) return false;
        return true;
      }
      // SE Asia & Islands
      if (lat >= -10 && lat <= 20 && lng >= 95 && lng <= 150) return true;
      // Australia / Oceania
      if (lat >= -44 && lat <= -10 && lng >= 112 && lng <= 154) return true;
      // North America
      if (lat >= 15 && lat <= 75 && lng >= -168 && lng <= -52) {
        if (lat < 25 && lng > -80) return false;
        return true;
      }
      // South America
      if (lat >= -56 && lat <= 13 && lng >= -82 && lng <= -34) {
        if (lat < -20 && lng < -70) return false;
        return true;
      }
      // Japan, UK, New Zealand
      if (lat >= 30 && lat <= 46 && lng >= 128 && lng <= 146) return true;
      if (lat >= 50 && lat <= 60 && lng >= -11 && lng <= 2) return true;
      if (lat >= -48 && lat <= -34 && lng >= 165 && lng <= 178) return true;

      return false;
    };

    // 7. Synchronous Fibonacci Sphere Point Cloud (Zero Grid Lines)
    const positions: number[] = [];
    const colors: number[] = [];

    const dotColorDark = new THREE.Color(0x3d3832); // Deep Taupe
    const dotColorEmerald = new THREE.Color(0x064e3b); // Forest Green
    const dotColorGold = new THREE.Color(0xc4a35a); // Accent Gold

    const numPoints = 14000;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = (2 * Math.PI * i) / goldenRatio;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const lat = Math.asin(y) * (180 / Math.PI);
      const lng = Math.atan2(z, -x) * (180 / Math.PI);

      if (isLandPoint(lat, lng)) {
        const vec = latLngToVector3(lat, lng, sphereRadius + 0.8);
        positions.push(vec.x, vec.y, vec.z);

        const rand = Math.random();
        const chosenColor =
          rand > 0.45 ? dotColorEmerald : rand > 0.15 ? dotColorDark : dotColorGold;
        colors.push(chosenColor.r, chosenColor.g, chosenColor.b);
      }
    }

    const landDotsGeo = new THREE.BufferGeometry();
    landDotsGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    landDotsGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const landDotsMat = new THREE.PointsMaterial({
      size: 2.1,
      map: createDotTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      alphaTest: 0.1,
    });

    const landDotsPoints = new THREE.Points(landDotsGeo, landDotsMat);
    globeGroup.add(landDotsPoints);

    // 8. Active Field Beacons (Kenya, Nigeria, Philippines, Pakistan, Uganda)
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
      const ringGeo = new THREE.RingGeometry(2.2, 4.2, 32);
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

    // 9. Interactive Drag Controls
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

    // 10. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDragging) {
        globeGroup.rotation.y += 0.0018;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute top-[45%] right-[-8%] -translate-y-1/2 w-[min(78vw,860px)] aspect-square cursor-grab active:cursor-grabbing select-none"
      title="Click and drag to rotate the globe"
    />
  );
}