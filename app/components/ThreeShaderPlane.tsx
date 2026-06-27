"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ThreeShaderPlaneProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string; // e.g. "aspect-[4/5]" or "aspect-[16/9]"
}

export default function ThreeShaderPlane({ src, alt, className = "", aspectRatio = "aspect-[4/5]" }: ThreeShaderPlaneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Dimensions of the parent container
    let width = container.clientWidth || 400;
    let height = container.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup (Orthographic for precise 2D image plane mapping)
    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000
    );
    camera.position.z = 100;

    const isMobile = window.innerWidth < 768;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !isMobile,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // 4. Uniforms setup
    const uniforms = {
      uTexture: { value: new THREE.Texture() },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScrollVelocity: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uImageResolution: { value: new THREE.Vector2(1, 1) },
    };

    // 5. Shader material definition
    const vertexShader = `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uHover;
      uniform float uScrollVelocity;
      
      void main() {
        vUv = uv;
        vec3 pos = position;
        
        // Dynamic wave ripple distortion from scrolling and hover
        float wave = sin(pos.x * 0.01 + uTime * 2.0) * cos(pos.y * 0.01 + uTime * 2.0) * (4.0 + uScrollVelocity * 30.0) * (0.15 + uHover * 0.85);
        pos.z += wave;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform float uHover;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec2 uResolution;
      uniform vec2 uImageResolution;
      
      // Helper function to maintain object-fit: cover mapping
      vec2 getCoverUv(vec2 uv, vec2 screenRes, vec2 imgRes) {
        float screenRatio = screenRes.x / screenRes.y;
        float imgRatio = imgRes.x / imgRes.y;
        vec2 newUv = uv;
        if (screenRatio > imgRatio) {
          float scale = imgRatio / screenRatio;
          newUv.y = 0.5 + (uv.y - 0.5) * scale;
        } else {
          float scale = screenRatio / imgRatio;
          newUv.x = 0.5 + (uv.x - 0.5) * scale;
        }
        return newUv;
      }
      
      void main() {
        // Maintain aspect ratio cover
        vec2 uv = getCoverUv(vUv, uResolution, uImageResolution);
        
        // Smooth luxury zoom scale on hover
        vec2 center = vec2(0.5, 0.5);
        uv = center + (uv - center) * (1.0 - uHover * 0.06);
        
        // Micro wave displacement on hover
        float ripple = sin(uv.y * 30.0 + uTime * 3.0) * 0.002 * uHover;
        uv.x += ripple;
        
        // Chromatic aberration (RGB shift)
        // Baseline chromatic drift + hover stretch
        float shift = 0.0015 + (0.007 * uHover);
        
        float r = texture2D(uTexture, uv + vec2(shift, 0.0)).r;
        float g = texture2D(uTexture, uv).g;
        float b = texture2D(uTexture, uv - vec2(shift, 0.0)).b;
        
        vec4 color = vec4(r, g, b, 1.0);
        
        // Subtle gold luxury bloom highlights on hover
        vec4 bloom = vec4(212.0/255.0, 175.0/255.0, 55.0/255.0, 1.0) * 0.08 * uHover;
        color += bloom;
        
        gl_FragColor = color;
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
    });

    // 6. Mesh geometry creation (matching parent size)
    const geometry = new THREE.PlaneGeometry(width, height, 32, 32);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 7. Load texture
    const loader = new THREE.TextureLoader();
    loader.load(src, (texture) => {
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      uniforms.uTexture.value = texture;
      uniforms.uImageResolution.value.set(
        texture.image.width,
        texture.image.height
      );
      setLoading(false);
    });

    // 8. Dynamic Scroll and Hover Listeners
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let targetHover = 0;
    let currentHover = 0;

    const handleMouseEnter = () => {
      targetHover = 1;
    };

    const handleMouseLeave = () => {
      targetHover = 0;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width;
      const y = 1.0 - (e.clientY - rect.top) / height;
      uniforms.uMouse.value.set(x, y);
    };

    container.addEventListener("mouseenter", handleMouseEnter, { passive: true });
    container.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    container.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 9. Resize support
    const handleResize = () => {
      width = container.clientWidth || 400;
      height = container.clientHeight || 500;

      // Update camera bounding box
      camera.left = width / -2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = height / -2;
      camera.updateProjectionMatrix();

      // Update geometry & renderer size
      geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(width, height, 32, 32);
      
      renderer.setSize(width, height);
      uniforms.uResolution.value.set(width, height);
    };

    window.addEventListener("resize", handleResize);

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      uniforms.uTime.value = elapsed;

      // Track scroll velocity with ease-out damping
      const currentScrollY = window.scrollY;
      scrollVelocity = Math.abs(currentScrollY - lastScrollY) * 0.1;
      lastScrollY = currentScrollY;

      uniforms.uScrollVelocity.value += (scrollVelocity - uniforms.uScrollVelocity.value) * 0.15;
      uniforms.uScrollVelocity.value *= 0.95; // decay

      // Interpolate hover values with spring-like physics
      currentHover += (targetHover - currentHover) * 0.1;
      uniforms.uHover.value = currentHover;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 11. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      geometry.dispose();
      material.dispose();
      uniforms.uTexture.value.dispose();
      renderer.dispose();
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${aspectRatio} ${className}`}
    >
      {/* Fallback image for SEO and SSR hydration visibility */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-700 pointer-events-none ${
          loading ? "opacity-100" : "opacity-0 absolute inset-0"
        }`}
      />
      
      {/* Canvas layer */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full block transition-opacity duration-700 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
