"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroThreeScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene with volumetric FogExp2 matching body background
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0b0c, 0.002);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1200
    );
    // Initial camera position
    const baseZ = 600;
    camera.position.set(0, 0, baseZ);

    const isMobile = window.innerWidth < 768;

    // 3. Renderer with shadow map support
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Create floating cinematic dust particles
    const particleCount = isMobile ? 180 : 600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Distribute dust in a large 3D coordinate volume
      positions[i * 3] = (Math.random() - 0.5) * 800;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 600;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 500;
      speeds[i] = Math.random() * 0.05 + 0.02;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Glow dot texture for particles
    const createParticleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.2, "rgba(212, 175, 55, 0.6)");
        gradient.addColorStop(1, "rgba(212, 175, 55, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 16, 16);
      }
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const material = new THREE.PointsMaterial({
      size: 4,
      map: createParticleTexture(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.7,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 5. Dynamic Volumetric Spotlight beams (God Rays simulation)
    const spotlights: THREE.SpotLight[] = [];
    const lightTarget = new THREE.Object3D();
    lightTarget.position.set(0, 0, 0);
    scene.add(lightTarget);

    const lightColors = [0xd4af37, 0x1a237e, 0x9e1b21]; // gold, luxury blue, crimson accents
    
    lightColors.forEach((color, idx) => {
      const spot = new THREE.SpotLight(
        color,
        25, // intensity
        800, // distance
        Math.PI / 10, // angle
        0.6, // penumbra
        1.2 // decay
      );
      spot.position.set((idx - 1) * 300, 300, -200);
      spot.target = lightTarget;
      spot.castShadow = true;
      scene.add(spot);
      spotlights.push(spot);
    });

    // Ambient support light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // 6. Volumetric Fog mesh sheets (moving fog clouds)
    const cloudCount = 12;
    const cloudGeometry = new THREE.PlaneGeometry(500, 500);
    
    const createCloudTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.08)");
        gradient.addColorStop(0.5, "rgba(212, 175, 55, 0.02)");
        gradient.addColorStop(1, "rgba(212, 175, 55, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
      }
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const cloudMaterial = new THREE.MeshBasicMaterial({
      map: createCloudTexture(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const clouds: THREE.Mesh[] = [];
    for (let i = 0; i < cloudCount; i++) {
      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
      cloud.position.set(
        (Math.random() - 0.5) * 600,
        (Math.random() - 0.5) * 300,
        -100 - Math.random() * 200
      );
      cloud.rotation.z = Math.random() * Math.PI * 2;
      scene.add(cloud);
      clouds.push(cloud);
    }

    // 7. Parallax and Scroll zoom variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentScroll = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
    };

    const handleScroll = () => {
      currentScroll = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // 8. Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // 9. Animation Loop
    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      time += 0.005;

      // Dynamic particle floating loop
      const positionsAttr = geometry.attributes.position as THREE.BufferAttribute;
      const array = positionsAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        array[i * 3 + 1] += speeds[i]; // float upward
        array[i * 3] += Math.sin(time + i) * 0.05; // horizontal sway

        // Reset if floats out of bounds
        if (array[i * 3 + 1] > 300) {
          array[i * 3 + 1] = -300;
          array[i * 3] = (Math.random() - 0.5) * 800;
        }
      }
      positionsAttr.needsUpdate = true;

      // Animate clouds/fog sheets
      clouds.forEach((cloud, idx) => {
        cloud.rotation.z += 0.0008 * (idx % 2 === 0 ? 1 : -1);
        cloud.position.x += Math.sin(time * 0.2 + idx) * 0.05;
      });

      // Animate spotlight beams (God Rays oscillation)
      spotlights.forEach((spot, idx) => {
        spot.position.x += Math.sin(time + idx) * 0.2;
        spot.position.z += Math.cos(time + idx) * 0.2;
      });

      // Camera breathing (sine wave)
      const breathing = Math.sin(time * 1.5) * 8;
      
      // Camera scroll push forward (camera slowly moves in z-depth)
      // Cap scroll-push so it doesn't pass the background meshes
      const scrollPush = Math.min(300, currentScroll * 0.5);
      const targetCameraZ = baseZ - scrollPush;

      // Parallax smooth interpolation
      targetX = mouseX * 0.08;
      targetY = -mouseY * 0.08;

      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY + breathing - camera.position.y) * 0.04;
      camera.position.z += (targetCameraZ - camera.position.z) * 0.04;
      camera.lookAt(0, 0, -100);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 10. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      geometry.dispose();
      material.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
