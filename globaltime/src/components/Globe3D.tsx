import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { type Country } from '../data/countries';
import { LANDMARKS, type Landmark } from '../data/landmarks';
import { useTreasureStore, getTrinketsForCountry, type Trinket } from '../stores/treasureStore';

interface Globe3DProps {
  countries: Country[];
  selectedCountry?: Country | null;
  onCountrySelect?: (country: Country) => void;
}

const LANDMARK_COLORS: Record<Landmark['type'], number> = {
  wonder: 0xffd700,
  nature: 0x00ff88,
  city:   0x00d4ff,
  quirky: 0xff44cc,
  space:  0x8866ff,
};

const LANDMARK_GLOW: Record<Landmark['type'], string> = {
  wonder: '#ffd700',
  nature: '#00ff88',
  city:   '#00d4ff',
  quirky: '#ff44cc',
  space:  '#8866ff',
};

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

function getSunDirection(): THREE.Vector3 {
  const now = new Date();
  const Y = now.getUTCFullYear(), M = now.getUTCMonth() + 1, D = now.getUTCDate();
  const H = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const JD = 367*Y - Math.trunc(7*(Y+Math.trunc((M+9)/12))/4)
           + Math.trunc(275*M/9) + D + 1721013.5 + H/24;
  const n = JD - 2451545.0;
  const L = (280.460 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180;
  const λ = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2*g)) * Math.PI / 180;
  const ε = 23.439 * Math.PI / 180;
  const sinDec  = Math.sin(ε) * Math.sin(λ);
  const RA      = Math.atan2(Math.cos(ε) * Math.sin(λ), Math.cos(λ));
  const GMST    = (280.46061837 + 360.98564736629 * n) * Math.PI / 180;
  const H_rad   = GMST - RA;
  const subLat  = Math.asin(sinDec);
  const subLng  = -H_rad;
  const cosLat = Math.cos(subLat);
  return new THREE.Vector3(
    -cosLat * Math.cos(subLng),
     Math.sin(subLat),
     cosLat * Math.sin(subLng),
  ).normalize();
}

export const Globe3D: React.FC<Globe3DProps> = ({ countries, selectedCountry, onCountrySelect }) => {
  const mountRef       = useRef<HTMLDivElement>(null);
  const rendRef        = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef       = useRef<THREE.Scene | null>(null);
  const cameraRef      = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef       = useRef<THREE.Group | null>(null);
  const lMarkersRef    = useRef<THREE.Mesh[]>([]);
  const trinketMeshRef = useRef<THREE.Mesh[]>([]);
  const rafRef         = useRef<number>(0);

  const isDragging  = useRef(false);
  const prevPtr     = useRef({ x: 0, y: 0 });
  const velY        = useRef(0);
  const velX        = useRef(0);
  const autoRotate  = useRef(true);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movedPx     = useRef(0);
  const pinchRef    = useRef<{ active: boolean; dist: number }>({ active: false, dist: 0 });

  const [tooltip, setTooltip] = useState<{ landmark: Landmark; x: number; y: number } | null>(null);
  const [trinketPopup, setTrinketPopup] = useState<{ trinket: Trinket; x: number; y: number } | null>(null);
  const [claimedPopup, setClaimedPopup] = useState<Trinket | null>(null);
  const tooltipTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isFound, claimTrinket, checkExpiry } = useTreasureStore();

  // Run expiry check once on mount
  useEffect(() => { checkExpiry(); }, [checkExpiry]);

  // Active country trinkets (for showing on globe when zoomed in)
  const [activeTrinketCountry, setActiveTrinketCountry] = useState<string | null>(null);

  // ── Scene setup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const W = container.clientWidth  || 600;
    const H = container.clientHeight || 600;

    const scene  = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 2.8;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.domElement.style.willChange = 'transform';
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendRef.current = renderer;

    // Stars
    const starPos = new Float32Array(4000 * 3);
    for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 300;
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.13, transparent: true, opacity: 0.6 }),
    ));

    // Lights
    scene.add(new THREE.AmbientLight(0x334466, 1.4));
    const sun = new THREE.DirectionalLight(0xffffff, 2.0);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const sunRef = { current: sun };
    const fill = new THREE.DirectionalLight(0x2244aa, 0.6);
    fill.position.set(-5, -3, -5);
    scene.add(fill);

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Textures
    const loader   = new THREE.TextureLoader();
    const colorTex = loader.load('/textures/earth_color.jpg');
    const normalTex= loader.load('/textures/earth_normal.jpg');
    const specTex  = loader.load('/textures/earth_specular.jpg');

    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(1, 48, 48),
      new THREE.MeshPhongMaterial({
        map: colorTex, normalMap: normalTex, specularMap: specTex,
        specular: new THREE.Color(0x336699), shininess: 35,
      }),
    ));

    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.015, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0x4488ff, transparent: true, opacity: 0.08, side: THREE.FrontSide }),
    ));

    // Day/Night terminator
    const nightMat = new THREE.MeshPhongMaterial({
      color: 0x000520,
      transparent: true,
      opacity: 0.55,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const nightMesh = new THREE.Mesh(new THREE.SphereGeometry(1.005, 32, 32), nightMat);
    group.add(nightMesh);

    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.12, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0x2255cc, transparent: true, opacity: 0.055, side: THREE.BackSide }),
    ));

    // Grid lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0x004488, transparent: true, opacity: 0.18 });
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts = Array.from({ length: 37 }, (_, i) => latLngToVec3(lat, i * 10 - 180, 1.003));
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    }
    for (let lng = 0; lng < 360; lng += 30) {
      const pts = Array.from({ length: 19 }, (_, i) => latLngToVec3(i * 10 - 90, lng - 180, 1.003));
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    }

    // NOTE: Country dot markers intentionally removed — globe surface is clickable directly
    // (no pulse rings, no dot markers)

    // Landmark markers (unchanged)
    const lMarkers: THREE.Mesh[] = [];
    LANDMARKS.forEach(lm => {
      const pos   = latLngToVec3(lm.lat, lm.lng, 1.022);
      const color = LANDMARK_COLORS[lm.type];

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.034, 12, 12),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15 }),
      );
      glow.position.copy(pos);
      group.add(glow);

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 10, 10),
        new THREE.MeshBasicMaterial({ color }),
      );
      dot.position.copy(pos);
      dot.userData = { type: 'landmark', landmark: lm };
      group.add(dot);

      const hitSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 8, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001 }),
      );
      hitSphere.position.copy(pos);
      hitSphere.userData = { type: 'landmark', landmark: lm };
      group.add(hitSphere);
      lMarkers.push(hitSphere);
    });
    lMarkersRef.current = lMarkers;

    // Animation
    let frame = 0;
    let lastSunUpdate = 0;
    const X_LIMIT = Math.PI / 2.1;

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      frame++;

      if (autoRotate.current && groupRef.current) {
        groupRef.current.rotation.y += 0.0015;
      }

      if (velY.current !== 0 || velX.current !== 0) {
        if (!isDragging.current && groupRef.current) {
          groupRef.current.rotation.y += velY.current;
          groupRef.current.rotation.x += velX.current;
          groupRef.current.rotation.x = Math.max(-X_LIMIT, Math.min(X_LIMIT, groupRef.current.rotation.x));
          velY.current *= 0.92;
          velX.current *= 0.92;
          if (Math.abs(velY.current) < 0.0002) velY.current = 0;
          if (Math.abs(velX.current) < 0.0002) velX.current = 0;
        }
      }

      const nowMs = Date.now();
      if (nowMs - lastSunUpdate > 30000) {
        lastSunUpdate = nowMs;
        const sunDir = getSunDirection();
        sunRef.current.position.copy(sunDir.clone().multiplyScalar(10));
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const W2 = container.clientWidth;
      const H2 = container.clientHeight;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    window.addEventListener('resize', onResize);

    const el = renderer.domElement;
    const getTouchDist = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        pinchRef.current = { active: true, dist: getTouchDist(e) };
        isDragging.current = false;
      } else if (e.touches.length === 1) {
        e.preventDefault();
        isDragging.current = true;
        movedPx.current    = 0;
        prevPtr.current    = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        velY.current = 0; velX.current = 0;
        if (resumeTimer.current) clearTimeout(resumeTimer.current);
        autoRotate.current = false;
        setTooltip(null); setTrinketPopup(null);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 2 && pinchRef.current.active) {
        const newDist = getTouchDist(e);
        const delta   = pinchRef.current.dist - newDist;
        pinchRef.current.dist = newDist;
        if (cameraRef.current) {
          cameraRef.current.position.z = Math.max(1.2, Math.min(5.5,
            cameraRef.current.position.z + delta * 0.012,
          ));
        }
      } else if (e.touches.length === 1 && isDragging.current && groupRef.current) {
        const x = e.touches[0].clientX, y = e.touches[0].clientY;
        const dx = x - prevPtr.current.x, dy = y - prevPtr.current.y;
        movedPx.current += Math.abs(dx) + Math.abs(dy);
        velY.current = dx * 0.005; velX.current = dy * 0.005;
        groupRef.current.rotation.y += velY.current;
        groupRef.current.rotation.x += velX.current;
        groupRef.current.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, groupRef.current.rotation.x));
        prevPtr.current = { x, y };
      }
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchRef.current.active = false;
      if (e.touches.length === 0) {
        isDragging.current = false;
        if (resumeTimer.current) clearTimeout(resumeTimer.current);
        resumeTimer.current = setTimeout(() => { autoRotate.current = true; }, 4000);
      }
    };
    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove',  handleTouchMove,  { passive: false });
    el.addEventListener('touchend',   handleTouchEnd,   { passive: false });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove',  handleTouchMove);
      el.removeEventListener('touchend',   handleTouchEnd);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [countries]);

  // ── Update trinket markers when country changes ────────────────────────────
  useEffect(() => {
    if (!groupRef.current) return;
    const group = groupRef.current;

    // Remove old trinket meshes
    trinketMeshRef.current.forEach(m => group.remove(m));
    trinketMeshRef.current = [];

    if (!selectedCountry) { setActiveTrinketCountry(null); return; }

    const trinkets = getTrinketsForCountry(selectedCountry.code);
    if (trinkets.length === 0) return;

    setActiveTrinketCountry(selectedCountry.code);

    const newMeshes: THREE.Mesh[] = [];
    trinkets.forEach(t => {
      const pos = latLngToVec3(t.lat, t.lng, 1.03);
      const found = isFound(t.id);

      // Glow sphere
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.032, 12, 12),
        new THREE.MeshBasicMaterial({
          color: found ? 0x888888 : 0xffd700,
          transparent: true,
          opacity: found ? 0.1 : 0.25,
        }),
      );
      glow.position.copy(pos);
      group.add(glow);
      newMeshes.push(glow);

      // Treasure chest dot
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.024, 10, 10),
        new THREE.MeshBasicMaterial({ color: found ? 0x555555 : 0xffd700 }),
      );
      dot.position.copy(pos);
      dot.userData = { type: 'trinket', trinket: t, found };
      group.add(dot);
      newMeshes.push(dot);

      // Hit sphere
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 8, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001 }),
      );
      hit.position.copy(pos);
      hit.userData = { type: 'trinket', trinket: t, found };
      group.add(hit);
      newMeshes.push(hit);
    });
    trinketMeshRef.current = newMeshes;
  }, [selectedCountry, isFound]);

  // ── Drag callbacks ─────────────────────────────────────────────────────────
  const startDrag = useCallback((x: number, y: number) => {
    isDragging.current = true;
    movedPx.current    = 0;
    prevPtr.current    = { x, y };
    velY.current = 0; velX.current = 0;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    autoRotate.current = false;
    setTooltip(null); setTrinketPopup(null);
  }, []);

  const moveDrag = useCallback((x: number, y: number) => {
    if (!isDragging.current || !groupRef.current) return;
    const dx = x - prevPtr.current.x, dy = y - prevPtr.current.y;
    movedPx.current += Math.abs(dx) + Math.abs(dy);
    velY.current = dx * 0.005; velX.current = dy * 0.005;
    groupRef.current.rotation.y += velY.current;
    groupRef.current.rotation.x += velX.current;
    groupRef.current.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, groupRef.current.rotation.x));
    prevPtr.current = { x, y };
  }, []);

  const endDrag = useCallback(() => {
    isDragging.current = false;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => { autoRotate.current = true; }, 4000);
  }, []);

  // ── Raycasting ─────────────────────────────────────────────────────────────
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (movedPx.current > 8) return;
    if (!mountRef.current || !cameraRef.current) return;
    const rect  = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left)  / rect.width)  * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const ray = new THREE.Raycaster();
    ray.params.Mesh = {};
    ray.params.Points = { threshold: 0.1 };
    ray.setFromCamera(mouse, cameraRef.current);

    // Trinket hits first
    const trinketHitMeshes = trinketMeshRef.current.filter(m => m.userData.type === 'trinket');
    if (trinketHitMeshes.length > 0) {
      const tHits = ray.intersectObjects(trinketHitMeshes, false);
      if (tHits.length > 0) {
        const t = tHits[0].object.userData.trinket as Trinket;
        setTrinketPopup({ trinket: t, x: e.clientX - rect.left, y: e.clientY - rect.top });
        setTooltip(null);
        return;
      }
    }

    // Landmark hits
    const lmHits = ray.intersectObjects(lMarkersRef.current, true);
    if (lmHits.length > 0) {
      const lm = lmHits[0].object.userData.landmark as Landmark;
      setTooltip({ landmark: lm, x: e.clientX - rect.left, y: e.clientY - rect.top });
      setTrinketPopup(null);
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
      tooltipTimer.current = setTimeout(() => setTooltip(null), 5000);
      return;
    }

    // Globe surface click → find nearest country by lat/lng projection
    const sphereHits = ray.intersectObject(
      sceneRef.current!.children.find(c => c instanceof THREE.Group) as THREE.Group,
      true
    ).filter(h => (h.object as THREE.Mesh).geometry instanceof THREE.SphereGeometry
      && !(h.object.userData.type));

    if (sphereHits.length > 0) {
      // Get the click point on the globe surface and convert back to lat/lng
      const point = sphereHits[0].point;
      // The group is rotated, so un-rotate the point
      const g = groupRef.current;
      if (!g) return;
      const invQuat = g.quaternion.clone().invert();
      const localPoint = point.clone().applyQuaternion(invQuat);

      // Convert 3D point to lat/lng
      const lat = Math.asin(localPoint.y / localPoint.length()) * (180 / Math.PI);
      const lng = Math.atan2(localPoint.z, -localPoint.x) * (180 / Math.PI) - 180;
      const normLng = ((lng % 360) + 360) % 360 - 180;

      // Find closest country
      let closest: Country | null = null;
      let minDist = Infinity;
      for (const c of countries) {
        const dLat = c.lat - lat;
        const dLng = c.lng - normLng;
        const dist = dLat * dLat + dLng * dLng;
        if (dist < minDist) { minDist = dist; closest = c; }
      }
      if (closest && minDist < 400) {
        onCountrySelect?.(closest);
        setTooltip(null); setTrinketPopup(null);
      }
    }
  }, [onCountrySelect, countries]);

  // ── Mouse wheel zoom ───────────────────────────────────────────────────────
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(1.2, Math.min(5.5,
      cameraRef.current.position.z + e.deltaY * 0.004,
    ));
  }, []);

  const onMD = useCallback((e: React.MouseEvent) => startDrag(e.clientX, e.clientY), [startDrag]);
  const onMM = useCallback((e: React.MouseEvent) => moveDrag(e.clientX, e.clientY), [moveDrag]);
  const onMU = useCallback(() => endDrag(), [endDrag]);
  const onML = useCallback(() => { if (isDragging.current) endDrag(); }, [endDrag]);

  // ── Zoom into selected country ─────────────────────────────────────────────
  useEffect(() => {
    if (!selectedCountry || !groupRef.current || !cameraRef.current) return;
    const targetY =  -selectedCountry.lng * (Math.PI / 180);
    const targetX =   selectedCountry.lat * (Math.PI / 180) * 0.45;
    const g = groupRef.current;
    const cam = cameraRef.current;
    const sY = g.rotation.y, sX = g.rotation.x;
    const startZ = cam.position.z;
    const targetZ = 1.7; // zoom in close
    let t = 0;
    autoRotate.current = false;
    velY.current = 0; velX.current = 0;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);

    const anim = () => {
      t += 0.03;
      if (t >= 1) {
        g.rotation.y = targetY;
        g.rotation.x = targetX;
        cam.position.z = targetZ;
        return;
      }
      const ease = 1 - Math.pow(1 - t, 3);
      g.rotation.y = sY + (targetY - sY) * ease;
      g.rotation.x = sX + (targetX - sX) * ease;
      cam.position.z = startZ + (targetZ - startZ) * ease;
      requestAnimationFrame(anim);
    };
    anim();
    resumeTimer.current = setTimeout(() => { autoRotate.current = true; }, 8000);
  }, [selectedCountry]);

  // ── Zoom back out when country deselected ─────────────────────────────────
  useEffect(() => {
    if (selectedCountry || !cameraRef.current) return;
    const cam = cameraRef.current;
    const startZ = cam.position.z;
    const targetZ = 2.8;
    let t = 0;
    const anim = () => {
      t += 0.03;
      if (t >= 1) { cam.position.z = targetZ; return; }
      cam.position.z = startZ + (targetZ - startZ) * (1 - Math.pow(1 - t, 3));
      requestAnimationFrame(anim);
    };
    anim();
  }, [selectedCountry]);

  // ── Handle trinket claim ───────────────────────────────────────────────────
  const handleClaimTrinket = useCallback((trinket: Trinket) => {
    claimTrinket(trinket.id);
    setClaimedPopup(trinket);
    setTrinketPopup(null);
    // Update trinket meshes
    trinketMeshRef.current.forEach(m => {
      if (m.userData.trinket?.id === trinket.id) {
        m.userData.found = true;
        const mat = m.material as THREE.MeshBasicMaterial;
        mat.color.setHex(0x555555);
      }
    });
    setTimeout(() => setClaimedPopup(null), 3000);
  }, [claimTrinket]);

  const legend = [
    { type: 'wonder', label: 'World Wonders', color: '#ffd700' },
    { type: 'nature', label: 'Nature',         color: '#00ff88' },
    { type: 'city',   label: 'Cities',         color: '#00d4ff' },
    { type: 'quirky', label: 'Quirky',         color: '#ff44cc' },
    { type: 'space',  label: 'Space',          color: '#8866ff' },
  ] as const;

  const trinkets = activeTrinketCountry ? getTrinketsForCountry(activeTrinketCountry) : [];
  const foundCount = trinkets.filter(t => isFound(t.id)).length;

  return (
    <div className="relative w-full h-full" style={{ touchAction: 'none' }}>
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'none' }}
        onMouseDown={onMD}
        onMouseMove={onMM}
        onMouseUp={onMU}
        onMouseLeave={onML}
        onClick={handleClick}
        onWheel={onWheel}
      />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1 pointer-events-none">
        {legend.map(l => (
          <div key={l.type} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: l.color, boxShadow: `0 0 6px ${l.color}` }} />
            <span className="text-white/50 text-xs">{l.label}</span>
          </div>
        ))}
        {trinkets.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#ffd700', boxShadow: '0 0 6px #ffd700' }} />
            <span className="text-yellow-400/80 text-xs">Trinkets ({foundCount}/{trinkets.length})</span>
          </div>
        )}
      </div>

      {/* Hints */}
      <div className="absolute top-3 right-3 text-white/25 text-xs pointer-events-none text-right leading-relaxed">
        <div>🖱 Drag to rotate</div>
        <div>🔍 Pinch / scroll to zoom</div>
        <div>📍 Click globe to explore</div>
        {trinkets.length > 0 && <div className="text-yellow-400/60">✨ Find hidden trinkets!</div>}
      </div>

      {/* Landmark tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            key={tooltip.landmark.id}
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 0.85,    y: 8 }}
            className="absolute z-20 pointer-events-none"
            style={{
              left: Math.min(Math.max(tooltip.x - 110, 8), (mountRef.current?.clientWidth ?? 400) - 240),
              top:  Math.max(Math.min(tooltip.y - 110, (mountRef.current?.clientHeight ?? 400) - 200), 8),
            }}
          >
            <div
              className="rounded-xl border bg-slate-900/95 backdrop-blur-xl p-3 w-52 shadow-2xl"
              style={{ borderColor: LANDMARK_GLOW[tooltip.landmark.type] + '66' }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{tooltip.landmark.emoji}</span>
                <div>
                  <div className="text-white font-semibold text-sm leading-tight">{tooltip.landmark.name}</div>
                  <div className="text-white/40 text-xs">{tooltip.landmark.country}</div>
                </div>
              </div>
              <p className="text-white/65 text-xs leading-relaxed italic">"{tooltip.landmark.fact}"</p>
              <div className="mt-1.5 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: LANDMARK_GLOW[tooltip.landmark.type] }} />
                <span className="text-xs capitalize" style={{ color: LANDMARK_GLOW[tooltip.landmark.type] }}>{tooltip.landmark.type}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trinket popup */}
      <AnimatePresence>
        {trinketPopup && (
          <motion.div
            key={trinketPopup.trinket.id}
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 0.85,    y: 8 }}
            className="absolute z-20"
            style={{
              left: Math.min(Math.max(trinketPopup.x - 110, 8), (mountRef.current?.clientWidth ?? 400) - 240),
              top:  Math.max(Math.min(trinketPopup.y - 120, (mountRef.current?.clientHeight ?? 400) - 220), 8),
            }}
          >
            <div className="rounded-xl border border-yellow-400/40 bg-slate-900/95 backdrop-blur-xl p-3 w-56 shadow-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-2xl">{trinketPopup.trinket.emoji}</span>
                <div>
                  <div className="text-yellow-300 font-bold text-sm">{trinketPopup.trinket.name}</div>
                  <div className="text-white/40 text-xs">{isFound(trinketPopup.trinket.id) ? '✅ Already found!' : '🔍 Hidden trinket'}</div>
                </div>
                <button onClick={() => setTrinketPopup(null)} className="ml-auto text-white/30 hover:text-white/70 text-lg leading-none">×</button>
              </div>
              {isFound(trinketPopup.trinket.id) ? (
                <p className="text-white/60 text-xs italic">"{trinketPopup.trinket.fact}"</p>
              ) : (
                <>
                  <p className="text-white/50 text-xs mb-3 italic">"{trinketPopup.trinket.hint}"</p>
                  <button
                    onClick={() => handleClaimTrinket(trinketPopup.trinket)}
                    className="w-full py-1.5 rounded-lg bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 text-xs font-bold hover:bg-yellow-500/30 transition-colors"
                  >
                    ✨ Claim Trinket!
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Claimed celebration popup */}
      <AnimatePresence>
        {claimedPopup && (
          <motion.div
            key="claimed"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1,   y: 0 }}
            exit={{ opacity: 0, scale: 0.5,    y: -20 }}
            className="absolute inset-x-0 top-8 flex justify-center z-30 pointer-events-none"
          >
            <div className="px-5 py-3 rounded-2xl bg-yellow-500/20 border border-yellow-400/50 backdrop-blur-xl shadow-2xl text-center">
              <div className="text-3xl mb-1">{claimedPopup.emoji}</div>
              <div className="text-yellow-300 font-bold text-sm">Trinket Found!</div>
              <div className="text-white/60 text-xs">{claimedPopup.name}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
