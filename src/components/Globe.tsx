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
    camera.position.z = 220;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Tilt globe slightly for cinematic angle
    globeGroup.rotation.x = 0.3;
    globeGroup.rotation.z = -0.1;

    // 3. Inner Sphere (Soft Ivory Glass)
    const sphereRadius = 75;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 64);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xefebe4,
      transparent: true,
      opacity: 0.85,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphereMesh);

    // Outer Glow Ring
    const auraGeo = new THREE.SphereGeometry(sphereRadius + 1.5, 64, 64);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xc4a35a,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    globeGroup.add(auraMesh);

    // 4. Generate Landmass Dot Grid
    const landDotsGeo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];

    // Helper: lat/lng to 3D XYZ
    const latLngToVector3 = (lat: number, lng: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // Continental lat/lng bounding approximations
    const isLand = (lat: number, lng: number) => {
      // Africa
      if (lat >= -35 && lat <= 37 && lng >= -18 && lng <= 51) return true;
      // Europe
      if (lat >= 36 && lat <= 71 && lng >= -10 && lng <= 45) return true;
      // Asia
      if (lat >= 5 && lat <= 75 && lng >= 45 && lng <= 180) return true;
      // North America
      if (lat >= 15 && lat <= 72 && lng >= -168 && lng <= -52) return true;
      // South America
      if (lat >= -56 && lat <= 13 && lng >= -82 && lng <= -34) return true;
      // Australia / Oceania
      if (lat >= -44 && lat <= -10 && lng >= 112 && lng <= 154) return true;
      return false;
    };

    const dotColorDark = new THREE.Color(0x1a1612); // Deep Taupe
    const dotColorEmerald = new THREE.Color(0x064e3b); // Forest Green

    // Sample dense lat/lng grid
    for (let lat = -80; lat <= 80; lat += 2.2) {
      for (let lng = -180; lng <= 180; lng += 2.2) {
        if (isLand(lat, lng)) {
          // 12% random noise to create organic continent shapes
          if (Math.random() > 0.15) {
            const vec = latLngToVector3(lat, lng, sphereRadius + 0.6);
            positions.push(vec.x, vec.y, vec.z);

            const chosenColor = Math.random() > 0.4 ? dotColorEmerald : dotColorDark;
            colors.push(chosenColor.r, chosenColor.g, chosenColor.b);
          }
        }
      }
    }

    landDotsGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    landDotsGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const landDotsMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const landDotsPoints = new THREE.Points(landDotsGeo, landDotsMat);
    globeGroup.add(landDotsPoints);

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
      const pos = latLngToVector3(loc.lat, loc.lng, sphereRadius + 1);

      // Gold Pin Mesh
      const pinGeo = new THREE.SphereGeometry(1.8, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0xc4a35a });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      beaconGroup.add(pinMesh);

      // Outer Pulsing Ring
      const ringGeo = new THREE.RingGeometry(2, 3.5, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x064e3b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
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

      // Auto-rotation when not dragging
      if (!isDragging) {
        globeGroup.rotation.y += 0.0018;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
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