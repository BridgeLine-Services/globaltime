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

// Color map for landmark types
const LANDMARK_COLORS: Record<Landmark['type'], number> = {
  wonder:  0xffd700,
  nature:  0x00ff88,
  city:    0x00d4ff,
  quirky:  0xff44cc,
  space:   0x8866ff,
};

const LANDMARK_GLOW: Record<Landmark['type'], string> = {
  wonder:  '#ffd700',
  nature:  '#00ff88',
  city:    '#00d4ff',
  quirky:  '#ff44cc',
  space:   '#8866ff',
};

export const Globe3D: React.FC<Globe3DProps> = ({ countries, selectedCountry, onCountrySelect }) => {
  const mountRef    = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef    = useRef<THREE.Scene | null>(null);
  const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);
  const globeRef    = useRef<THREE.Mesh | null>(null);
  const countryMarkersRef  = useRef<THREE.Mesh[]>([]);
  const landmarkMarkersRef = useRef<THREE.Mesh[]>([]);
  const rafRef      = useRef<number>(0);

  // Interaction state
  const isDragging   = useRef(false);
  const prevPointer  = useRef({ x: 0, y: 0 });
  const velY         = useRef(0);
  const velX         = useRef(0);
  const autoRotate   = useRef(true);
  const resumeTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movedPx      = useRef(0); // track if it was a drag vs click

  // Tooltip state
  const [tooltip, setTooltip] = useState<{ landmark: Landmark; x: number; y: number } | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const latLngToVector3 = (lat: number, lng: number, radius: number) => {
    const phi   = (90 - lat) * (Math.PI / 180);
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
    const W = container.clientWidth || 600;
    const H = container.clientHeight || 600;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 2.8;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Globe ───────────────────────────────────────────────────────────────
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0x0a1628, emissive: 0x001040,
        specular: 0x003380, shininess: 50,
        transparent: true, opacity: 0.97,
      })
    );
    scene.add(globe);
    globeRef.current = globe;

    // Wireframe
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.002, 28, 28),
      new THREE.MeshBasicMaterial({ color: 0x0044aa, wireframe: true, transparent: true, opacity: 0.07 })
    ));
    // Inner atmosphere
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.13, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0x0066ff, transparent: true, opacity: 0.07, side: THREE.BackSide })
    ));
    // Outer glow
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.22, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0x0033aa, transparent: true, opacity: 0.025, side: THREE.BackSide })
    ));

    // ── Lights ──────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x334466, 1.6));
    const sun = new THREE.DirectionalLight(0x7799ff, 2.2);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    scene.add(Object.assign(new THREE.DirectionalLight(0x2244aa, 0.5), { position: new THREE.Vector3(-5, -3, -5) }));

    // ── Stars ───────────────────────────────────────────────────────────────
    const starPos = new Float32Array(3000 * 3);
    for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 300;
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.55 })));

    // ── Grid lines ──────────────────────────────────────────────────────────
    const lineMat = new THREE.LineBasicMaterial({ color: 0x002255, transparent: true, opacity: 0.25 });
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts = Array.from({ length: 73 }, (_, i) => latLngToVector3(lat, i * 5 - 180, 1.005));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    }
    for (let lng = 0; lng < 360; lng += 30) {
      const pts = Array.from({ length: 37 }, (_, i) => latLngToVector3(i * 5 - 90, lng - 180, 1.005));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    }

    // ── Country markers (small cyan dots) ───────────────────────────────────
    const cMarkers: THREE.Mesh[] = [];
    countries.forEach(c => {
      const pos  = latLngToVector3(c.lat, c.lng, 1.02);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.014, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x00d4ff })
      );
      mesh.position.copy(pos);
      mesh.userData = { type: 'country', country: c };
      scene.add(mesh);
      cMarkers.push(mesh);

      // Pulse ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.018, 0.026, 16),
        new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
      );
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      ring.userData = { pulse: true, speed: 0.04 + Math.random() * 0.03 };
      scene.add(ring);
    });
    countryMarkersRef.current = cMarkers;

    // ── Landmark markers (larger, colored, type-coded) ──────────────────────
    const lMarkers: THREE.Mesh[] = [];
    LANDMARKS.forEach(lm => {
      const pos   = latLngToVector3(lm.lat, lm.lng, 1.025);
      const color = LANDMARK_COLORS[lm.type];

      // Outer glow sphere
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.036, 12, 12),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18 })
      );
      glow.position.copy(pos);
      scene.add(glow);

      // Inner bright dot
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 10, 10),
        new THREE.MeshBasicMaterial({ color })
      );
      dot.position.copy(pos);
      dot.userData = { type: 'landmark', landmark: lm };
      scene.add(dot);
      lMarkers.push(dot);

      // Orbit ring (rotated to face outward)
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.028, 0.038, 20),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
      );
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      ring.userData = { pulse: true, speed: 0.03 + Math.random() * 0.04, base: 0.4 };
      scene.add(ring);
    });
    landmarkMarkersRef.current = lMarkers;

    // ── Animation loop ──────────────────────────────────────────────────────
    let frame = 0;
    const FRICTION   = 0.87;
    const AUTO_SPEED = 0.0016;
    const X_LIMIT    = Math.PI / 2.5;

    const animate = () => {
      frame++;
      rafRef.current = requestAnimationFrame(animate);

      if (isDragging.current) {
        globe.rotation.y += velY.current;
        globe.rotation.x += velX.current;
        globe.rotation.x = Math.max(-X_LIMIT, Math.min(X_LIMIT, globe.rotation.x));
      } else {
        if (Math.abs(velY.current) > 0.00008 || Math.abs(velX.current) > 0.00008) {
          globe.rotation.y += velY.current;
          globe.rotation.x += velX.current;
          globe.rotation.x = Math.max(-X_LIMIT, Math.min(X_LIMIT, globe.rotation.x));
          velY.current *= FRICTION;
          velX.current *= FRICTION;
        } else if (autoRotate.current) {
          velY.current += (AUTO_SPEED - velY.current) * 0.015;
          globe.rotation.y += velY.current;
        }
      }

      // Pulse all rings
      scene.children.forEach(child => {
        const ud = child.userData;
        if (ud?.pulse) {
          const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
          const base = ud.base ?? 0.2;
          mat.opacity = base + Math.sin(frame * (ud.speed ?? 0.05)) * (base * 0.9);
        }
      });

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

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [countries]);

  // ── Drag helpers ─────────────────────────────────────────────────────────
  const startDrag = useCallback((x: number, y: number) => {
    isDragging.current  = true;
    movedPx.current     = 0;
    prevPointer.current = { x, y };
    velY.current = 0; velX.current = 0;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    autoRotate.current = false;
    setTooltip(null);
  }, []);

  const moveDrag = useCallback((x: number, y: number) => {
    if (!isDragging.current || !globeRef.current) return;
    const dx = x - prevPointer.current.x;
    const dy = y - prevPointer.current.y;
    movedPx.current += Math.abs(dx) + Math.abs(dy);
    velY.current = dx * 0.006;
    velX.current = dy * 0.006;
    globeRef.current.rotation.y += velY.current;
    globeRef.current.rotation.x += velX.current;
    globeRef.current.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, globeRef.current.rotation.x));
    prevPointer.current = { x, y };
  }, []);

  const endDrag = useCallback(() => {
    isDragging.current = false;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => { autoRotate.current = true; }, 4000);
  }, []);

  // ── Raycasting for click ─────────────────────────────────────────────────
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (movedPx.current > 8) return; // was a drag
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, cameraRef.current);

    // Check landmarks first (higher priority)
    const lmHits = ray.intersectObjects(landmarkMarkersRef.current);
    if (lmHits.length > 0) {
      const lm = lmHits[0].object.userData.landmark as Landmark;
      setTooltip({ landmark: lm, x: e.clientX - (mountRef.current?.getBoundingClientRect().left ?? 0), y: e.clientY - (mountRef.current?.getBoundingClientRect().top ?? 0) });
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
      tooltipTimer.current = setTimeout(() => setTooltip(null), 5000);
      return;
    }

    // Then countries
    const cHits = ray.intersectObjects(countryMarkersRef.current);
    if (cHits.length > 0 && cHits[0].object.userData?.country) {
      onCountrySelect?.(cHits[0].object.userData.country as Country);
      setTooltip(null);
    }
  }, [onCountrySelect]);

  // ── Mouse/touch events ───────────────────────────────────────────────────
  const onMD  = useCallback((e: React.MouseEvent) => startDrag(e.clientX, e.clientY), [startDrag]);
  const onMM  = useCallback((e: React.MouseEvent) => moveDrag(e.clientX, e.clientY), [moveDrag]);
  const onMU  = useCallback(() => endDrag(), [endDrag]);
  const onML  = useCallback(() => { if (isDragging.current) endDrag(); }, [endDrag]);

  const onTS  = useCallback((e: React.TouchEvent) => { const t = e.touches[0]; startDrag(t.clientX, t.clientY); }, [startDrag]);
  const onTM  = useCallback((e: React.TouchEvent) => { e.preventDefault(); const t = e.touches[0]; moveDrag(t.clientX, t.clientY); }, [moveDrag]);
  const onTE  = useCallback(() => endDrag(), [endDrag]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(1.6, Math.min(5, cameraRef.current.position.z + e.deltaY * 0.003));
  }, []);

  // ── Selected country focus ───────────────────────────────────────────────
  useEffect(() => {
    if (!selectedCountry || !globeRef.current) return;
    const targetY = -selectedCountry.lng * Math.PI / 180;
    const targetX =  selectedCountry.lat * Math.PI / 180 * 0.45;
    const globe   = globeRef.current;
    const sY = globe.rotation.y, sX = globe.rotation.x;
    let t = 0;
    autoRotate.current = false;
    velY.current = 0; velX.current = 0;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    const anim = () => {
      t += 0.03;
      if (t >= 1) { globe.rotation.y = targetY; globe.rotation.x = targetX; return; }
      const ease = 1 - Math.pow(1 - t, 3);
      globe.rotation.y = sY + (targetY - sY) * ease;
      globe.rotation.x = sX + (targetX - sX) * ease;
      requestAnimationFrame(anim);
    };
    anim();
    resumeTimer.current = setTimeout(() => { autoRotate.current = true; }, 6000);
  }, [selectedCountry]);

  // ── Legend data ──────────────────────────────────────────────────────────
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
        onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onML}
        onClick={handleClick}
        onWheel={onWheel}
        onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
      />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1 pointer-events-none">
        {legend.map(l => (
          <div key={l.type} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: l.color, boxShadow: `0 0 6px ${l.color}` }} />
            <span className="text-white/50 text-xs">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Interaction hint */}
      <div className="absolute top-3 right-3 text-white/20 text-xs pointer-events-none text-right">
        <div>Drag to rotate</div>
        <div>Scroll to zoom</div>
        <div>Click markers</div>
      </div>

      {/* Landmark tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            key={tooltip.landmark.id}
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 8 }}
            className="absolute z-20 pointer-events-none"
            style={{
              left: Math.min(tooltip.x + 12, (mountRef.current?.clientWidth ?? 400) - 220),
              top:  Math.max(tooltip.y - 80, 8),
            }}
          >
            <div className="rounded-xl border border-white/20 bg-slate-900/95 backdrop-blur-xl p-3 w-52 shadow-2xl"
              style={{ borderColor: LANDMARK_GLOW[tooltip.landmark.type] + '55' }}>
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
    </div>
  );
};
