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

export const Globe3D: React.FC<Globe3DProps> = ({ countries, selectedCountry, onCountrySelect }) => {
  const mountRef   = useRef<HTMLDivElement>(null);
  const rendRef    = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef   = useRef<THREE.Scene | null>(null);
  const cameraRef  = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef   = useRef<THREE.Group | null>(null);   // ← everything rotates as one group
  const cMarkersRef = useRef<THREE.Mesh[]>([]);
  const lMarkersRef = useRef<THREE.Mesh[]>([]);
  const rafRef      = useRef<number>(0);

  // Drag / momentum state
  const isDragging  = useRef(false);
  const prevPtr     = useRef({ x: 0, y: 0 });
  const velY        = useRef(0);
  const velX        = useRef(0);
  const autoRotate  = useRef(true);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movedPx     = useRef(0);

  const [tooltip, setTooltip] = useState<{ landmark: Landmark; x: number; y: number } | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Scene setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const W = container.clientWidth  || 600;
    const H = container.clientHeight || 600;

    // Scene + camera
    const scene  = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 2.8;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendRef.current = renderer;

    // ── Stars ──────────────────────────────────────────────────────────────
    const starPos = new Float32Array(4000 * 3);
    for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 300;
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.13, transparent: true, opacity: 0.6 }),
    ));

    // ── Lights ─────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x334466, 1.4));
    const sun = new THREE.DirectionalLight(0xffffff, 2.0);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x2244aa, 0.6);
    fill.position.set(-5, -3, -5);
    scene.add(fill);

    // ── Globe group — ALL globe objects go in here so they spin together ───
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Textures
    const loader = new THREE.TextureLoader();
    const colorTex    = loader.load('/textures/earth_color.jpg');
    const normalTex   = loader.load('/textures/earth_normal.jpg');
    const specularTex = loader.load('/textures/earth_specular.jpg');

    // Earth sphere
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({
        map:         colorTex,
        normalMap:   normalTex,
        specularMap: specularTex,
        specular:    new THREE.Color(0x336699),
        shininess:   35,
      }),
    );
    group.add(globe);

    // Atmosphere glow (inner)
    const atmoInner = new THREE.Mesh(
      new THREE.SphereGeometry(1.015, 40, 40),
      new THREE.MeshPhongMaterial({
        color: 0x4488ff, transparent: true, opacity: 0.08, side: THREE.FrontSide,
      }),
    );
    group.add(atmoInner);

    // Atmosphere glow (outer halo — stays in scene, not group, so it doesn't rotate)
    const atmoOuter = new THREE.Mesh(
      new THREE.SphereGeometry(1.12, 40, 40),
      new THREE.MeshPhongMaterial({
        color: 0x2255cc, transparent: true, opacity: 0.055, side: THREE.BackSide,
      }),
    );
    scene.add(atmoOuter); // intentionally NOT in group

    // Lat/lng grid lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0x004488, transparent: true, opacity: 0.18 });
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts = Array.from({ length: 73 }, (_, i) => latLngToVec3(lat, i * 5 - 180, 1.003));
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    }
    for (let lng = 0; lng < 360; lng += 30) {
      const pts = Array.from({ length: 37 }, (_, i) => latLngToVec3(i * 5 - 90, lng - 180, 1.003));
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    }

    // ── Country markers ────────────────────────────────────────────────────
    const cMarkers: THREE.Mesh[] = [];
    countries.forEach(c => {
      const pos  = latLngToVec3(c.lat, c.lng, 1.018);
      const dot  = new THREE.Mesh(
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
    });
    cMarkersRef.current = cMarkers;

    // ── Landmark markers ───────────────────────────────────────────────────
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
        new THREE.SphereGeometry(0.020, 10, 10),
        new THREE.MeshBasicMaterial({ color }),
      );
      dot.position.copy(pos);
      dot.userData = { type: 'landmark', landmark: lm };
      group.add(dot);
      lMarkers.push(dot);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.026, 0.036, 20),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
      );
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      ring.userData = { pulse: true, speed: 0.03 + Math.random() * 0.04, base: 0.35 };
      group.add(ring);
    });
    lMarkersRef.current = lMarkers;

    // ── Animation loop ─────────────────────────────────────────────────────
    let frame = 0;
    const FRICTION   = 0.88;
    const AUTO_SPEED = 0.0014;
    const X_LIMIT    = Math.PI / 2.2;

    const animate = () => {
      frame++;
      rafRef.current = requestAnimationFrame(animate);

      if (isDragging.current) {
        // velocity applied live in moveDrag; just clamp x here
        group.rotation.x = Math.max(-X_LIMIT, Math.min(X_LIMIT, group.rotation.x));
      } else {
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
      }

      // Pulse rings
      group.children.forEach(child => {
        const ud = child.userData;
        if (ud?.pulse) {
          const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
          const base = ud.base ?? 0.2;
          mat.opacity = base + Math.sin(frame * (ud.speed ?? 0.05)) * (base * 0.85);
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
  }, [countries]);

  // ── Drag callbacks ─────────────────────────────────────────────────────────
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

    const sensitivity = 0.005;
    velY.current = dx * sensitivity;
    velX.current = dy * sensitivity;

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

  // ── Raycasting (click) ─────────────────────────────────────────────────────
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (movedPx.current > 8) return;
    if (!mountRef.current || !cameraRef.current) return;
    const rect  = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width)  * 2 - 1,
      -((e.clientY - rect.top)  / rect.height) * 2 + 1,
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, cameraRef.current);

    const lmHits = ray.intersectObjects(lMarkersRef.current);
    if (lmHits.length > 0) {
      const lm = lmHits[0].object.userData.landmark as Landmark;
      const rx = e.clientX - rect.left;
      const ry = e.clientY - rect.top;
      setTooltip({ landmark: lm, x: rx, y: ry });
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

  // ── Scroll-to-zoom ────────────────────────────────────────────────────────
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    e.preventDefault();
    cameraRef.current.position.z = Math.max(1.4, Math.min(5.5, cameraRef.current.position.z + e.deltaY * 0.004));
  }, []);

  // ── Event handler wiring ──────────────────────────────────────────────────
  const onMD = useCallback((e: React.MouseEvent) => startDrag(e.clientX, e.clientY), [startDrag]);
  const onMM = useCallback((e: React.MouseEvent) => moveDrag(e.clientX, e.clientY), [moveDrag]);
  const onMU = useCallback(() => endDrag(), [endDrag]);
  const onML = useCallback(() => { if (isDragging.current) endDrag(); }, [endDrag]);

  const onTS = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  }, [startDrag]);
  const onTM = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  }, [moveDrag]);
  const onTE = useCallback(() => endDrag(), [endDrag]);

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
    <div className="relative w-full h-full">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        onMouseDown={onMD}
        onMouseMove={onMM}
        onMouseUp={onMU}
        onMouseLeave={onML}
        onClick={handleClick}
        onWheel={onWheel}
        onTouchStart={onTS}
        onTouchMove={onTM}
        onTouchEnd={onTE}
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
        <div>🔍 Scroll to zoom</div>
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
              left: Math.min(tooltip.x + 14, (mountRef.current?.clientWidth ?? 400) - 230),
              top:  Math.max(tooltip.y - 90, 8),
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
