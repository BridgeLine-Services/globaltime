import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { type Country } from '../data/countries';
import { LANDMARKS, type Landmark } from '../data/landmarks';

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

// ── Subsolar point calculation ─────────────────────────────────────────────
// Returns unit vector pointing from Earth center toward the Sun (in globe-fixed coords)
// Based on simplified solar position algorithm (accurate to ~1°)
function getSunDirection(): THREE.Vector3 {
  const now = new Date();
  const Y = now.getUTCFullYear(), M = now.getUTCMonth() + 1, D = now.getUTCDate();
  const H = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  // Julian Date
  const JD = 367*Y - Math.trunc(7*(Y+Math.trunc((M+9)/12))/4)
           + Math.trunc(275*M/9) + D + 1721013.5 + H/24;
  const n = JD - 2451545.0;
  const L = (280.460 + 0.9856474 * n) % 360;       // mean longitude
  const g = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180; // mean anomaly
  const λ = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2*g)) * Math.PI / 180;
  const ε = 23.439 * Math.PI / 180;                 // obliquity of ecliptic

  // Declination & right ascension
  const sinDec  = Math.sin(ε) * Math.sin(λ);
  const RA      = Math.atan2(Math.cos(ε) * Math.sin(λ), Math.cos(λ));

  // Local Hour Angle for prime meridian (Greenwich)
  const GMST    = (280.46061837 + 360.98564736629 * n) * Math.PI / 180;
  const H_rad   = GMST - RA;

  // Subsolar point (lat/lng in radians)
  const subLat  = Math.asin(sinDec);
  const subLng  = -H_rad;  // negate: THREE's X axis points toward lng=0 at H=0

  // Convert to THREE.js coordinate system (Y=up, X=+lng=0, Z=+lat=0 cross)
  // Standard: x = cos(lat)*cos(lng), y = sin(lat), z = cos(lat)*sin(lng)
  // In THREE globe: x = -cos(lat)*cos(lng), y = cos(lat)*sin(lng), z = sin(lat) ... 
  // but since globe texture aligns +X toward lng=180, we use:
  const cosLat = Math.cos(subLat);
  const x = -cosLat * Math.cos(subLng);
  const y =  Math.sin(subLat);
  const z =  cosLat * Math.sin(subLng);
  return new THREE.Vector3(x, y, z).normalize();
}

export const Globe3D: React.FC<Globe3DProps> = ({ countries, selectedCountry, onCountrySelect }) => {
  const mountRef    = useRef<HTMLDivElement>(null);
  const rendRef     = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef    = useRef<THREE.Scene | null>(null);
  const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef    = useRef<THREE.Group | null>(null);
  const cMarkersRef = useRef<THREE.Mesh[]>([]);
  const lMarkersRef = useRef<THREE.Mesh[]>([]);
  const pulseRingsRef = useRef<THREE.Mesh[]>([]);
  const rafRef      = useRef<number>(0);

  // Drag / momentum
  const isDragging  = useRef(false);
  const prevPtr     = useRef({ x: 0, y: 0 });
  const velY        = useRef(0);
  const velX        = useRef(0);
  const autoRotate  = useRef(true);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movedPx     = useRef(0);

  // Pinch-to-zoom state
  const pinchRef     = useRef<{ active: boolean; dist: number }>({ active: false, dist: 0 });

  const [tooltip, setTooltip] = useState<{ landmark: Landmark; x: number; y: number } | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Scene setup ────────────────────────────────────────────────────────────
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
    // Initial position — updated every frame in animate()
    sun.position.set(5, 3, 5);
    scene.add(sun);
    // Ref to sun light so animation can update it
    const sunRef = { current: sun };
    const fill = new THREE.DirectionalLight(0x2244aa, 0.6);
    fill.position.set(-5, -3, -5);
    scene.add(fill);

    // Globe group — everything rotates together
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Textures
    const loader     = new THREE.TextureLoader();
    const colorTex   = loader.load('/textures/earth_color.jpg');
    const normalTex  = loader.load('/textures/earth_normal.jpg');
    const specTex    = loader.load('/textures/earth_specular.jpg');

    // Earth sphere
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(1, 48, 48),
      new THREE.MeshPhongMaterial({
        map: colorTex, normalMap: normalTex, specularMap: specTex,
        specular: new THREE.Color(0x336699), shininess: 35,
      }),
    ));

    // Inner atmosphere
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.015, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0x4488ff, transparent: true, opacity: 0.08, side: THREE.FrontSide }),
    ));

    // ── Day/Night terminator overlay ─────────────────────────────────────
    // A slightly larger sphere on the dark side, semi-transparent blue-black
    const nightMat = new THREE.MeshPhongMaterial({
      color: 0x000520,
      transparent: true,
      opacity: 0.55,
      side: THREE.BackSide,   // render inside-out so it only shows the night hemisphere
      depthWrite: false,
    });
    const nightMesh = new THREE.Mesh(new THREE.SphereGeometry(1.005, 32, 32), nightMat);
    group.add(nightMesh);
    // We'll update this mesh's quaternion each frame to track the real sun position

    // Outer halo (stays in scene — doesn't rotate)
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

    // Country markers
    pulseRingsRef.current = [];
    const cMarkers: THREE.Mesh[] = [];
    countries.forEach(c => {
      const pos = latLngToVec3(c.lat, c.lng, 1.018);
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.013, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x00d4ff }),
      );
      dot.position.copy(pos);
      dot.userData = { type: 'country', country: c };
      group.add(dot);
      cMarkers.push(dot);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.017, 0.024, 16),
        new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.3, side: THREE.DoubleSide }),
      );
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      ring.userData = { pulse: true, speed: 0.04 + Math.random() * 0.03, base: 0.2 };
      group.add(ring);
      pulseRingsRef.current.push(ring);
    });
    cMarkersRef.current = cMarkers;

    // Landmark markers
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
      // dot added via hitSphere below

      // Large hit-sphere: opacity 0.001 keeps it in scene graph for raycasting
      // depthTest:true (default) ensures it participates in depth sorting correctly
      const hitSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001, depthWrite: false }),
      );
      hitSphere.position.copy(pos);
      hitSphere.userData = { type: 'landmark', landmark: lm };
      group.add(hitSphere);
      // Also add the visible dot so clicking directly on it works too
      dot.userData = { type: 'landmark', landmark: lm };
      lMarkers.push(hitSphere);
      lMarkers.push(dot);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.026, 0.036, 20),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
      );
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      ring.userData = { pulse: true, speed: 0.03 + Math.random() * 0.04, base: 0.35 };
      group.add(ring);
      pulseRingsRef.current.push(ring);
    });
    lMarkersRef.current = lMarkers;

    // Animation loop
    let frame = 0;
    const FRICTION   = 0.88;
    const AUTO_SPEED = 0.0014;
    const X_LIMIT    = Math.PI / 2.2;

    let lastSunUpdate = 0;
    const animate = () => {
      frame++;
      rafRef.current = requestAnimationFrame(animate);

      if (!isDragging.current) {
        if (Math.abs(velY.current) > 0.00006 || Math.abs(velX.current) > 0.00006) {
          group.rotation.y += velY.current;
          group.rotation.x += velX.current;
          group.rotation.x  = Math.max(-X_LIMIT, Math.min(X_LIMIT, group.rotation.x));
          velY.current *= FRICTION;
          velX.current *= FRICTION;
        } else if (autoRotate.current) {
          velY.current += (AUTO_SPEED - velY.current) * 0.012;
          group.rotation.y += velY.current;
        }
      } else {
        group.rotation.x = Math.max(-X_LIMIT, Math.min(X_LIMIT, group.rotation.x));
      }

      // Pulse rings — use pre-cached array, throttled every 2 frames
      if (frame % 2 === 0) {
        const rings = pulseRingsRef.current;
        for (let ri = 0; ri < rings.length; ri++) {
          const ud = rings[ri].userData;
          const mat = rings[ri].material as THREE.MeshBasicMaterial;
          const base = ud.base ?? 0.2;
          mat.opacity = base + Math.sin(frame * (ud.speed ?? 0.05)) * (base * 0.85);
        }
      }

      // Update sun direction every 30s to sync with real solar position
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

    // ── Non-passive touch listeners on the canvas element ──────────────────
    // React synthetic touch events are passive by default in modern browsers,
    // which means e.preventDefault() is ignored and the page scrolls/zooms.
    // We attach non-passive listeners directly to the DOM element instead.
    const el = renderer.domElement;

    const getTouchDist = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch start
        e.preventDefault();
        pinchRef.current = { active: true, dist: getTouchDist(e) };
        isDragging.current = false;
      } else if (e.touches.length === 1) {
        e.preventDefault();
        isDragging.current  = true;
        movedPx.current     = 0;
        prevPtr.current     = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        velY.current = 0;
        velX.current = 0;
        if (resumeTimer.current) clearTimeout(resumeTimer.current);
        autoRotate.current = false;
        setTooltip(null);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // always prevent — stops page scroll AND browser pinch-zoom

      if (e.touches.length === 2 && pinchRef.current.active) {
        // Pinch-to-zoom
        const newDist = getTouchDist(e);
        const delta   = pinchRef.current.dist - newDist;
        pinchRef.current.dist = newDist;
        if (cameraRef.current) {
          cameraRef.current.position.z = Math.max(1.4, Math.min(5.5,
            cameraRef.current.position.z + delta * 0.012,
          ));
        }
      } else if (e.touches.length === 1 && isDragging.current && groupRef.current) {
        const x  = e.touches[0].clientX;
        const y  = e.touches[0].clientY;
        const dx = x - prevPtr.current.x;
        const dy = y - prevPtr.current.y;
        movedPx.current += Math.abs(dx) + Math.abs(dy);

        velY.current = dx * 0.005;
        velX.current = dy * 0.005;
        groupRef.current.rotation.y += velY.current;
        groupRef.current.rotation.x += velX.current;
        groupRef.current.rotation.x  = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, groupRef.current.rotation.x));
        prevPtr.current = { x, y };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchRef.current.active = false;
      }
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

  // ── Mouse drag callbacks ───────────────────────────────────────────────────
  const startDrag = useCallback((x: number, y: number) => {
    isDragging.current  = true;
    movedPx.current     = 0;
    prevPtr.current     = { x, y };
    velY.current = 0;
    velX.current = 0;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    autoRotate.current = false;
    setTooltip(null);
  }, []);

  const moveDrag = useCallback((x: number, y: number) => {
    if (!isDragging.current || !groupRef.current) return;
    const dx = x - prevPtr.current.x;
    const dy = y - prevPtr.current.y;
    movedPx.current += Math.abs(dx) + Math.abs(dy);
    velY.current = dx * 0.005;
    velX.current = dy * 0.005;
    groupRef.current.rotation.y += velY.current;
    groupRef.current.rotation.x += velX.current;
    groupRef.current.rotation.x  = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, groupRef.current.rotation.x));
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
      ((e.clientX - rect.left) / rect.width)  * 2 - 1,
      -((e.clientY - rect.top)  / rect.height) * 2 + 1,
    );
    const ray = new THREE.Raycaster();
    ray.params.Mesh = {};
    ray.params.Points = { threshold: 0.1 };
    ray.setFromCamera(mouse, cameraRef.current);

    const lmHits = ray.intersectObjects(lMarkersRef.current, true);
    if (lmHits.length > 0) {
      const lm = lmHits[0].object.userData.landmark as Landmark;
      setTooltip({ landmark: lm, x: e.clientX - rect.left, y: e.clientY - rect.top });
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
      tooltipTimer.current = setTimeout(() => setTooltip(null), 5000);
      return;
    }

    const cHits = ray.intersectObjects(cMarkersRef.current);
    if (cHits.length > 0 && cHits[0].object.userData?.country) {
      onCountrySelect?.(cHits[0].object.userData.country as Country);
      setTooltip(null);
    }
  }, [onCountrySelect]);

  // ── Mouse wheel zoom ───────────────────────────────────────────────────────
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(1.4, Math.min(5.5,
      cameraRef.current.position.z + e.deltaY * 0.004,
    ));
  }, []);

  // ── Mouse event wiring ─────────────────────────────────────────────────────
  const onMD = useCallback((e: React.MouseEvent) => startDrag(e.clientX, e.clientY), [startDrag]);
  const onMM = useCallback((e: React.MouseEvent) => moveDrag(e.clientX, e.clientY), [moveDrag]);
  const onMU = useCallback(() => endDrag(), [endDrag]);
  const onML = useCallback(() => { if (isDragging.current) endDrag(); }, [endDrag]);

  // ── Selected country focus ────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedCountry || !groupRef.current) return;
    const targetY =  -selectedCountry.lng * (Math.PI / 180);
    const targetX =   selectedCountry.lat * (Math.PI / 180) * 0.45;
    const g = groupRef.current;
    const sY = g.rotation.y, sX = g.rotation.x;
    let t = 0;
    autoRotate.current = false;
    velY.current = 0; velX.current = 0;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);

    const anim = () => {
      t += 0.03;
      if (t >= 1) { g.rotation.y = targetY; g.rotation.x = targetX; return; }
      const ease = 1 - Math.pow(1 - t, 3);
      g.rotation.y = sY + (targetY - sY) * ease;
      g.rotation.x = sX + (targetX - sX) * ease;
      requestAnimationFrame(anim);
    };
    anim();
    resumeTimer.current = setTimeout(() => { autoRotate.current = true; }, 6000);
  }, [selectedCountry]);

  // ── Legend ────────────────────────────────────────────────────────────────
  const legend = [
    { type: 'wonder', label: 'World Wonders', color: '#ffd700' },
    { type: 'nature', label: 'Nature',         color: '#00ff88' },
    { type: 'city',   label: 'Cities',         color: '#00d4ff' },
    { type: 'quirky', label: 'Quirky',         color: '#ff44cc' },
    { type: 'space',  label: 'Space',          color: '#8866ff' },
  ] as const;

  return (
    <div className="relative w-full h-full" style={{ touchAction: 'none' }}>
      {/* touchAction:none on the wrapper also tells the browser this region
          handles its own touch gestures — belt-and-suspenders with the
          non-passive listeners on the canvas */}
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
        // Touch events handled via non-passive DOM listeners in useEffect
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
      </div>

      {/* Hints */}
      <div className="absolute top-3 right-3 text-white/25 text-xs pointer-events-none text-right leading-relaxed">
        <div>🖱 Drag to rotate</div>
        <div>🔍 Pinch / scroll to zoom</div>
        <div>📍 Click markers</div>
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
                <div className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: LANDMARK_GLOW[tooltip.landmark.type] }} />
                <span className="text-xs capitalize"
                  style={{ color: LANDMARK_GLOW[tooltip.landmark.type] }}>
                  {tooltip.landmark.type}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
