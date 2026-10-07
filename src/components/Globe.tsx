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

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 220;

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

    // Exact radius requested
    const sphereRadius = 75;

    // 3. Inner Sphere (Warm Ivory Base)
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 64);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xefebe4,
      transparent: true,
      opacity: 0.9,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphereMesh);

    // Outer Glow Ring
    const auraGeo = new THREE.SphereGeometry(sphereRadius + 1.5, 64, 64);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xc4a35a,
      transparent: true,
      opacity: 0.14,
      side: THREE.BackSide,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    globeGroup.add(auraMesh);

    // 4. Create Offscreen Vector Path Sampler for World Continents
    const mapCanvas = document.createElement("canvas");
    mapCanvas.width = 1000;
    mapCanvas.height = 500;
    const ctx = mapCanvas.getContext("2d");

    // Native Vector Paths for World Continents (Equirectangular 1000x500 scale)
    const continentPath = new Path2D(`
      M140,80 Q200,40 280,60 T360,110 T260,190 T150,160 Z
      M250,210 Q310,200 350,250 T320,360 T250,420 T210,310 Z
      M460,70 Q520,50 560,80 T530,120 T460,110 Z
      M440,140 Q520,130 570,170 T550,290 T500,420 T440,320 T420,210 Z
      M520,50 Q660,30 780,70 T820,170 T750,230 T600,210 T520,130 Z
      M720,280 Q810,270 850,310 T810,380 T730,370 Z
      M360,30 Q420,20 450,40 T410,70 Z
    `);

    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fill(continentPath);
    }

    // Convert (Lat, Lng) to 3D XYZ Vector
    const latLngToVector3 = (lat: number, lng: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // 5. Fibonacci Golden Spiral Point Sampling (No lattice lines)
    const positions: number[] = [];
    const colors: number[] = [];

    const dotColorDark = new THREE.Color(0x3d3832); // Dark Taupe
    const dotColorEmerald = new THREE.Color(0x064e3b); // Forest Green

    const numPoints = 8500;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = (2 * Math.PI * i) / goldenRatio;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const lat = Math.asin(y) * (180 / Math.PI);
      const lng = Math.atan2(z, -x) * (180 / Math.PI);

      // Map lat/lng to 1000x500 canvas coordinates
      const canvasX = ((lng + 180) / 360) * 1000;
      const canvasY = ((90 - lat) / 180) * 500;

      if (ctx && ctx.isPointInPath(continentPath, canvasX, canvasY)) {
        const vec = latLngToVector3(lat, lng, sphereRadius + 0.8);
        positions.push(vec.x, vec.y, vec.z);

        const chosenColor = Math.random() > 0.35 ? dotColorEmerald : dotColorDark;
        colors.push(chosenColor.r, chosenColor.g, chosenColor.b);
      }
    }

    const landDotsGeo = new THREE.BufferGeometry();
    landDotsGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    landDotsGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    // Create Circular Point Material
    const createDotTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      const c = canvas.getContext("2d");
      if (c) {
        c.beginPath();
        c.arc(8, 8, 7, 0, Math.PI * 2);
        c.fillStyle = "#ffffff";
        c.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const landDotsMat = new THREE.PointsMaterial({
      size: 1.9,
      map: createDotTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      alphaTest: 0.1,
    });

    const landDotsPoints = new THREE.Points(landDotsGeo, landDotsMat);
    globeGroup.add(landDotsPoints);

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
      const pinGeo = new THREE.SphereGeometry(1.8, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0xc4a35a });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      beaconGroup.add(pinMesh);

      // Outer Ring
      const ringGeo = new THREE.RingGeometry(2.0, 3.6, 32);
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

    // 7. Mouse Drag Rotation Controls
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

    // 8. Continuous Rotation Loop
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
      className="absolute top-[45%] right-[-10%] -translate-y-1/2 w-[min(75vw,820px)] aspect-square cursor-grab active:cursor-grabbing select-none"
      title="Click and drag to rotate the globe"
    />
  );
}