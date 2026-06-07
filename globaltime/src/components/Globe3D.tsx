import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { type Country } from '../data/countries';

interface Globe3DProps {
  countries: Country[];
  selectedCountry?: Country | null;
  onCountrySelect?: (country: Country) => void;
}

export const Globe3D: React.FC<Globe3DProps> = ({ countries, selectedCountry, onCountrySelect }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const markersRef = useRef<THREE.Mesh[]>([]);
  const rafRef = useRef<number>(0);
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const autoRotate = useRef(true);
  const rotationVelocity = useRef({ x: 0, y: 0.003 });

  const latLngToVector3 = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 2.8;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Globe
    const globeGeo = new THREE.SphereGeometry(1, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x0a1628,
      emissive: 0x001040,
      specular: 0x003380,
      shininess: 40,
      transparent: true,
      opacity: 0.97,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);
    globeRef.current = globe;

    // Wireframe overlay
    const wireGeo = new THREE.SphereGeometry(1.002, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x0044aa,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    });
    scene.add(new THREE.Mesh(wireGeo, wireMat));

    // Atmosphere glow
    const atmosGeo = new THREE.SphereGeometry(1.12, 32, 32);
    const atmosMat = new THREE.MeshPhongMaterial({
      color: 0x0066ff,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(atmosGeo, atmosMat));

    // Outer glow ring
    const outerGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const outerMat = new THREE.MeshPhongMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.02,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(outerGeo, outerMat));

    // Lights
    const ambientLight = new THREE.AmbientLight(0x334466, 1.5);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0x6699ff, 2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);
    const backLight = new THREE.DirectionalLight(0x2244aa, 0.5);
    backLight.position.set(-5, -3, -5);
    scene.add(backLight);

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 200;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.6 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Grid lines (latitude/longitude)
    const createGridLines = () => {
      const lineMat = new THREE.LineBasicMaterial({ color: 0x003366, transparent: true, opacity: 0.3 });
      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        const pts = [];
        for (let lng = 0; lng <= 360; lng += 5) {
          pts.push(latLngToVector3(lat, lng - 180, 1.005));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        scene.add(new THREE.Line(geo, lineMat));
      }
      // Longitude lines
      for (let lng = 0; lng < 360; lng += 30) {
        const pts = [];
        for (let lat = -90; lat <= 90; lat += 5) {
          pts.push(latLngToVector3(lat, lng - 180, 1.005));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        scene.add(new THREE.Line(geo, lineMat));
      }
    };
    createGridLines();

    // Country markers
    const markers: THREE.Mesh[] = [];
    countries.forEach(country => {
      const pos = latLngToVector3(country.lat, country.lng, 1.02);
      const markerGeo = new THREE.SphereGeometry(0.018, 8, 8);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(pos);
      marker.userData = { country };
      scene.add(marker);
      markers.push(marker);

      // Pulse ring
      const ringGeo = new THREE.RingGeometry(0.022, 0.032, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      ring.userData = { pulse: true, baseOpacity: 0.4 };
      scene.add(ring);
    });
    markersRef.current = markers;

    // Animation loop
    let frame = 0;
    const animate = () => {
      frame++;
      rafRef.current = requestAnimationFrame(animate);

      if (autoRotate.current && !isDragging.current) {
        globe.rotation.y += 0.003;
      }
      if (isDragging.current) {
        globe.rotation.y += rotationVelocity.current.y;
        globe.rotation.x += rotationVelocity.current.x;
        globe.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, globe.rotation.x));
        rotationVelocity.current.y *= 0.92;
        rotationVelocity.current.x *= 0.92;
      }

      // Pulse markers
      scene.children.forEach(child => {
        if (child.userData?.pulse) {
          const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
          mat.opacity = 0.2 + Math.sin(frame * 0.05) * 0.3;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const onResize = () => {
      const W2 = container.clientWidth;
      const H2 = container.clientHeight;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    autoRotate.current = false;
    previousMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !globeRef.current) return;
    const dx = e.clientX - previousMouse.current.x;
    const dy = e.clientY - previousMouse.current.y;
    rotationVelocity.current = { x: dy * 0.005, y: dx * 0.005 };
    globeRef.current.rotation.y += dx * 0.005;
    globeRef.current.rotation.x += dy * 0.005;
    globeRef.current.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, globeRef.current.rotation.x));
    previousMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    setTimeout(() => { autoRotate.current = true; }, 3000);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current || !globeRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const hits = raycaster.intersectObjects(markersRef.current);
    if (hits.length > 0 && hits[0].object.userData?.country) {
      const country = hits[0].object.userData.country as Country;
      onCountrySelect?.(country);
    }
  }, [onCountrySelect]);

  // Zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(1.8, Math.min(5, cameraRef.current.position.z + e.deltaY * 0.003));
  }, []);

  // Update selected country
  useEffect(() => {
    if (!selectedCountry || !globeRef.current) return;
    const targetY = -selectedCountry.lng * Math.PI / 180;
    const targetX = selectedCountry.lat * Math.PI / 180 * 0.5;
    const globe = globeRef.current;
    const startY = globe.rotation.y;
    const startX = globe.rotation.x;
    let t = 0;
    const anim = () => {
      t += 0.03;
      if (t >= 1) { globe.rotation.y = targetY; globe.rotation.x = targetX; return; }
      const ease = 1 - Math.pow(1 - t, 3);
      globe.rotation.y = startY + (targetY - startY) * ease;
      globe.rotation.x = startX + (targetX - startX) * ease;
      requestAnimationFrame(anim);
    };
    autoRotate.current = false;
    anim();
    setTimeout(() => { autoRotate.current = true; }, 5000);
  }, [selectedCountry]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs font-mono pointer-events-none">
        DRAG TO ROTATE · SCROLL TO ZOOM · CLICK MARKER TO EXPLORE
      </div>
    </div>
  );
};
