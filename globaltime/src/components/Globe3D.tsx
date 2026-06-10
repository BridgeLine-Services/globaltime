import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { type Country } from '../data/countries';
import { LANDMARKS, type Landmark } from '../data/landmarks';
import { useTreasureStore, getTrinketsForCountry, type Trinket } from '../stores/treasureStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Globe3DProps {
  countries: Country[];
  selectedCountry?: Country | null;
  onCountrySelect?: (country: Country) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MARKER_COLORS: Record<Landmark['type'], number> = {
  wonder: 0xffd700,  // gold  — World Wonders
  nature: 0x00ff88,  // green — Nature
  city:   0x00d4ff,  // blue  — Cities
  quirky: 0xff44cc,  // pink  — Quirky
  space:  0x8866ff,  // purple — Space
};

const MARKER_GLOW: Record<Landmark['type'], string> = {
  wonder: '#ffd700',
  nature: '#00ff88',
  city:   '#00d4ff',
  quirky: '#ff44cc',
  space:  '#8866ff',
};

const MARKER_LABEL: Record<Landmark['type'], string> = {
  wonder: '🌟 World Wonder',
  nature: '🌿 Nature',
  city:   '🏙️ City Fact',
  quirky: '😜 Quirky Fact',
  space:  '🔭 Space Fact',
};

// Major city locations for night-side lights (procedural, no texture needed)
const CITY_LIGHTS: { lat: number; lng: number; size: number }[] = [
  // N. America
  { lat: 40.71, lng: -74.01, size: 0.022 }, { lat: 34.05, lng: -118.24, size: 0.020 },
  { lat: 41.85, lng: -87.65, size: 0.018 }, { lat: 29.76, lng: -95.37, size: 0.016 },
  { lat: 33.45, lng: -112.07, size: 0.015 }, { lat: 37.77, lng: -122.42, size: 0.017 },
  { lat: 47.61, lng: -122.33, size: 0.014 }, { lat: 25.77, lng: -80.19, size: 0.014 },
  { lat: 45.50, lng: -73.57, size: 0.016 }, { lat: 43.70, lng: -79.42, size: 0.017 },
  { lat: 19.43, lng: -99.13, size: 0.019 }, { lat: 23.13, lng: -82.38, size: 0.012 },
  // Europe
  { lat: 51.51, lng: -0.13, size: 0.021 }, { lat: 48.86, lng: 2.35, size: 0.020 },
  { lat: 52.52, lng: 13.40, size: 0.019 }, { lat: 41.90, lng: 12.50, size: 0.018 },
  { lat: 40.42, lng: -3.70, size: 0.017 }, { lat: 48.21, lng: 16.37, size: 0.016 },
  { lat: 50.08, lng: 14.44, size: 0.014 }, { lat: 52.23, lng: 21.01, size: 0.015 },
  { lat: 53.34, lng: -6.27, size: 0.014 }, { lat: 59.33, lng: 18.07, size: 0.014 },
  { lat: 60.17, lng: 24.94, size: 0.013 }, { lat: 55.68, lng: 12.57, size: 0.013 },
  { lat: 47.38, lng: 8.54, size: 0.014 }, { lat: 45.46, lng: 9.19, size: 0.016 },
  { lat: 37.98, lng: 23.73, size: 0.015 }, { lat: 44.80, lng: 20.46, size: 0.013 },
  // Asia
  { lat: 35.69, lng: 139.69, size: 0.022 }, { lat: 31.23, lng: 121.47, size: 0.021 },
  { lat: 39.93, lng: 116.39, size: 0.021 }, { lat: 28.61, lng: 77.21, size: 0.020 },
  { lat: 19.08, lng: 72.88, size: 0.020 }, { lat: 1.35, lng: 103.82, size: 0.018 },
  { lat: 37.57, lng: 126.98, size: 0.019 }, { lat: 22.33, lng: 114.17, size: 0.018 },
  { lat: 13.75, lng: 100.52, size: 0.017 }, { lat: 3.14, lng: 101.69, size: 0.016 },
  { lat: 25.20, lng: 55.27, size: 0.018 }, { lat: 24.69, lng: 46.72, size: 0.017 },
  { lat: 33.34, lng: 44.40, size: 0.015 }, { lat: 35.69, lng: 51.42, size: 0.017 },
  { lat: 41.01, lng: 28.98, size: 0.018 }, { lat: 55.75, lng: 37.62, size: 0.021 },
  { lat: 59.95, lng: 30.32, size: 0.017 }, { lat: 43.26, lng: 76.93, size: 0.014 },
  // Africa
  { lat: 30.06, lng: 31.25, size: 0.019 }, { lat: -26.20, lng: 28.04, size: 0.017 },
  { lat: 6.45, lng: 3.38, size: 0.018 }, { lat: -33.93, lng: 18.42, size: 0.016 },
  { lat: -4.32, lng: 15.32, size: 0.014 }, { lat: 15.55, lng: 32.53, size: 0.013 },
  // S. America
  { lat: -23.55, lng: -46.63, size: 0.021 }, { lat: -34.60, lng: -58.38, size: 0.019 },
  { lat: -12.05, lng: -77.04, size: 0.017 }, { lat: -33.46, lng: -70.65, size: 0.016 },
  { lat: 4.71, lng: -74.07, size: 0.014 }, { lat: -22.91, lng: -43.17, size: 0.018 },
  // Oceania
  { lat: -33.87, lng: 151.21, size: 0.018 }, { lat: -37.81, lng: 144.96, size: 0.017 },
  { lat: -27.47, lng: 153.02, size: 0.014 }, { lat: -36.85, lng: 174.76, size: 0.013 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  const JD = 367*Y - Math.trunc(7*(Y + Math.trunc((M+9)/12))/4)
           + Math.trunc(275*M/9) + D + 1721013.5 + H/24;
  const n  = JD - 2451545.0;
  const L  = (280.460 + 0.9856474 * n) % 360;
  const g  = ((357.528 + 0.9856003 * n) % 360) * (Math.PI / 180);
  const λ  = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2*g)) * (Math.PI / 180);
  const ε  = 23.439 * (Math.PI / 180);
  const sinDec = Math.sin(ε) * Math.sin(λ);
  const RA     = Math.atan2(Math.cos(ε) * Math.sin(λ), Math.cos(λ));
  const GMST   = (280.46061837 + 360.98564736629 * n) * (Math.PI / 180);
  const H_rad  = GMST - RA;
  const subLat = Math.asin(sinDec);
  const cosLat = Math.cos(subLat);
  return new THREE.Vector3(
    -cosLat * Math.cos(-H_rad),
     Math.sin(subLat),
     cosLat * Math.sin(-H_rad),
  ).normalize();
}

// TopoJSON → THREE.js Lines (inline decoder — no extra library needed)
// We use the `countries-110m` TopoJSON directly via the public topojson-client
type TopoArc  = number[][];
type TopoGeom = { type: string; arcs: number[][][] | number[][] };
interface TopoJSON {
  type: 'Topology';
  transform?: { scale: [number, number]; translate: [number, number] };
  arcs: TopoArc[];
  objects: Record<string, { type: string; geometries: TopoGeom[] }>;
}

function decodeTopoBorders(topo: TopoJSON, objectKey: string): THREE.Vector3[][] {
  const { scale, translate } = topo.transform ?? { scale: [1,1], translate: [0,0] };
  // Decode all arcs to [lng,lat] coordinates
  const decodedArcs: [number,number][][] = topo.arcs.map(arc => {
    let x = 0, y = 0;
    return arc.map(([dx, dy]) => {
      x += dx; y += dy;
      const lng = x * scale[0] + translate[0];
      const lat = y * scale[1] + translate[1];
      return [lng, lat] as [number, number];
    });
  });

  const lines: THREE.Vector3[][] = [];
  const obj = topo.objects[objectKey];
  if (!obj) return lines;

  // Collect all polygon rings as separate line strips
  const processArcs = (arcIdxList: number[]) => {
    const pts: THREE.Vector3[] = [];
    for (const arcIdx of arcIdxList) {
      const arc = arcIdx >= 0 ? decodedArcs[arcIdx] : [...decodedArcs[~arcIdx]].reverse();
      for (let i = 0; i < arc.length; i++) {
        if (i === 0 && pts.length > 0) continue; // avoid duplicate join point
        pts.push(latLngToVec3(arc[i][1], arc[i][0], 1.003));
      }
    }
    if (pts.length > 1) lines.push(pts);
  };

  for (const geom of obj.geometries) {
    if (geom.type === 'Polygon') {
      for (const ring of geom.arcs as number[][]) processArcs(ring);
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.arcs as number[][][]) {
        for (const ring of poly) processArcs(ring);
      }
    }
  }
  return lines;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Globe3D: React.FC<Globe3DProps> = ({ countries, selectedCountry, onCountrySelect }) => {
  const mountRef         = useRef<HTMLDivElement>(null);
  const rendRef          = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef         = useRef<THREE.Scene | null>(null);
  const cameraRef        = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef         = useRef<THREE.Group | null>(null);
  const lMarkersRef      = useRef<THREE.Mesh[]>([]);
  const clickSphereRef   = useRef<THREE.Mesh | null>(null);
  const trinketMeshRef   = useRef<THREE.Mesh[]>([]);
  const borderGroupRef   = useRef<THREE.Group | null>(null);
  const cityLightsRef    = useRef<THREE.Points | null>(null);
  const sunDirRef        = useRef<THREE.Vector3>(getSunDirection());
  const rafRef           = useRef<number>(0);

  const isDragging  = useRef(false);
  const prevPtr     = useRef({ x: 0, y: 0 });
  const velY        = useRef(0);
  const velX        = useRef(0);
  const autoRotate  = useRef(true);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movedPx     = useRef(0);
  const pinchRef    = useRef<{ active: boolean; dist: number }>({ active: false, dist: 0 });

  const [tooltip, setTooltip]           = useState<{ landmark: Landmark; x: number; y: number } | null>(null);
  const [trinketPopup, setTrinketPopup] = useState<{ trinket: Trinket; x: number; y: number } | null>(null);
  const [claimedPopup, setClaimedPopup] = useState<Trinket | null>(null);
  const tooltipTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isFound, claimTrinket, checkExpiry } = useTreasureStore();
  const [activeTrinketCountry, setActiveTrinketCountry] = useState<string | null>(null);

  useEffect(() => { checkExpiry(); }, [checkExpiry]);

  // ── Scene setup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const W = container.clientWidth  || 600;
    const H = container.clientHeight || 600;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.willChange = 'transform';
    container.appendChild(renderer.domElement);
    rendRef.current = renderer;

    const scene  = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 2.8;
    cameraRef.current = camera;

    // ── Stars ──────────────────────────────────────────────────────────────
    const starPos = new Float32Array(3000 * 3);
    for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 300;
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.55 })));

    // ── Lighting ───────────────────────────────────────────────────────────
    // Ambient — soft base fill so night side isn't completely black
    scene.add(new THREE.AmbientLight(0x223355, 1.2));

    // Sun light — moves with real sun position
    const sunLight = new THREE.DirectionalLight(0xfff5e0, 2.2);
    sunLight.position.copy(sunDirRef.current.clone().multiplyScalar(10));
    scene.add(sunLight);

    // Night-side warm fill — simulates city light pollution glow
    const nightFill = new THREE.DirectionalLight(0xff8833, 0.15);
    nightFill.position.set(-8, -2, -8);
    scene.add(nightFill);

    // Atmospheric rim on the day/night terminator
    const rimLight = new THREE.DirectionalLight(0x4488cc, 0.4);
    rimLight.position.set(-5, 0, 0);
    scene.add(rimLight);

    // ── Globe Group ────────────────────────────────────────────────────────
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Earth surface
    const loader = new THREE.TextureLoader();
    const colorTex  = loader.load('/textures/earth_color.jpg');
    const normalTex = loader.load('/textures/earth_normal.jpg');
    const specTex   = loader.load('/textures/earth_specular.jpg');

    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({
        map: colorTex, normalMap: normalTex, specularMap: specTex,
        specular: new THREE.Color(0x335577), shininess: 40,
      }),
    ));

    // Thin ocean atmosphere layer
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.012, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0x4499ff, transparent: true, opacity: 0.06, side: THREE.FrontSide, depthWrite: false }),
    ));

    // ── Night side overlay ────────────────────────────────────────────────
    // MeshBasicMaterial so it's pure overlay regardless of scene lighting
    const nightOverlay = new THREE.Mesh(
      new THREE.SphereGeometry(1.004, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x000818,
        transparent: true,
        opacity: 0.0,          // set per-frame via shader tweak below
        side: THREE.FrontSide,
        depthWrite: false,
        blending: THREE.MultiplyBlending,
      }),
    );
    group.add(nightOverlay);

    // We use a custom uniform approach: update the night overlay rotation
    // so it always faces AWAY from the sun. This creates the terminator.
    // The nightOverlay sphere uses BackSide with a dark color so the
    // "inside facing away from sun" gets darkened.

    // Better approach: use a properly-oriented half-sphere as night mask
    const nightMask = new THREE.Mesh(
      new THREE.SphereGeometry(1.005, 48, 48),
      new THREE.ShaderMaterial({
        uniforms: { sunDir: { value: sunDirRef.current.clone() } },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 sunDir;
          varying vec3 vNormal;
          void main() {
            float d = dot(vNormal, sunDir);
            // Smooth terminator: bright on day, dark blue-black on night
            float t = smoothstep(-0.1, 0.15, d);
            float nightAlpha = (1.0 - t) * 0.72;
            gl_FragColor = vec4(0.0, 0.01, 0.06, nightAlpha);
          }
        `,
        transparent: true,
        side: THREE.FrontSide,
        depthWrite: false,
      }),
    );
    group.add(nightMask);

    // ── City Lights (night side) ──────────────────────────────────────────
    const cityPositions = new Float32Array(CITY_LIGHTS.length * 3);
    const citySizes     = new Float32Array(CITY_LIGHTS.length);
    CITY_LIGHTS.forEach((c, i) => {
      const v = latLngToVec3(c.lat, c.lng, 1.008);
      cityPositions[i*3]   = v.x;
      cityPositions[i*3+1] = v.y;
      cityPositions[i*3+2] = v.z;
      citySizes[i] = c.size;
    });
    const cityGeo = new THREE.BufferGeometry();
    cityGeo.setAttribute('position', new THREE.BufferAttribute(cityPositions, 3));
    cityGeo.setAttribute('size', new THREE.BufferAttribute(citySizes, 1));

    const cityLightsMesh = new THREE.Points(cityGeo, new THREE.ShaderMaterial({
      uniforms: { sunDir: { value: sunDirRef.current.clone() } },
      vertexShader: `
        attribute float size;
        uniform vec3 sunDir;
        varying float vNightFactor;
        void main() {
          vec3 norm = normalize(position);
          float d = dot(norm, sunDir);
          // Only visible on night side (d < 0), fade in twilight
          vNightFactor = smoothstep(0.1, -0.25, d);
          gl_PointSize = size * 900.0 * vNightFactor;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying float vNightFactor;
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float r = length(uv);
          if (r > 0.5) discard;
          float alpha = (1.0 - r * 2.0) * vNightFactor * 0.9;
          // Warm orange-yellow city glow
          gl_FragColor = vec4(1.0, 0.75, 0.3, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    group.add(cityLightsMesh);
    cityLightsRef.current = cityLightsMesh;

    // Outer atmospheric halo (faint blue ring visible from the outside)
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.14, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0x1155cc, transparent: true, opacity: 0.04, side: THREE.BackSide, depthWrite: false }),
    ));

    // ── Click sphere (transparent, exact globe size for raycasting) ────────
    const clickSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.001, 64, 64),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false }),
    );
    clickSphere.userData = { type: 'globe_surface' };
    group.add(clickSphere);
    clickSphereRef.current = clickSphere;

    // ── Lat/lng grid lines ─────────────────────────────────────────────────
    const gridMat = new THREE.LineBasicMaterial({ color: 0x004466, transparent: true, opacity: 0.15 });
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts = Array.from({ length: 73 }, (_, i) => latLngToVec3(lat, i * 5 - 180, 1.0025));
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }
    for (let lng = 0; lng < 360; lng += 30) {
      const pts = Array.from({ length: 37 }, (_, i) => latLngToVec3(i * 5 - 90, lng - 180, 1.0025));
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }

    // ── Equator & prime meridian highlights ───────────────────────────────
    const eqMat = new THREE.LineBasicMaterial({ color: 0x006688, transparent: true, opacity: 0.3 });
    const eqPts = Array.from({ length: 73 }, (_, i) => latLngToVec3(0, i * 5 - 180, 1.003));
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(eqPts), eqMat));

    // ── Landmark markers ──────────────────────────────────────────────────
    const lMarkers: THREE.Mesh[] = [];
    LANDMARKS.forEach(lm => {
      const pos   = latLngToVec3(lm.lat, lm.lng, 1.025);
      const color = MARKER_COLORS[lm.type];

      // Outer glow ring
      const glowRing = new THREE.Mesh(
        new THREE.SphereGeometry(0.040, 14, 14),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18, depthWrite: false }),
      );
      glowRing.position.copy(pos);
      group.add(glowRing);

      // Core dot — visible marker
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.026, 10, 10),
        new THREE.MeshBasicMaterial({ color }),
      );
      dot.position.copy(pos);
      dot.userData = { type: 'landmark', landmark: lm };
      group.add(dot);

      // Invisible hit sphere — generous click area
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(0.062, 8, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001, depthWrite: false }),
      );
      hit.position.copy(pos);
      hit.userData = { type: 'landmark', landmark: lm };
      group.add(hit);
      lMarkers.push(hit);
    });
    lMarkersRef.current = lMarkers;

    // ── Border group (populated async after globe renders) ─────────────────
    const borderGroup = new THREE.Group();
    group.add(borderGroup);
    borderGroupRef.current = borderGroup;

    // ── Async: load country + US state borders ─────────────────────────────
    const countryBorderMat = new THREE.LineBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0.35 });
    const stateBorderMat   = new THREE.LineBasicMaterial({ color: 0x0077aa, transparent: true, opacity: 0.22 });

    const loadBorders = async () => {
      try {
        // Load both in parallel
        const [worldResp, usResp] = await Promise.all([
          fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
          fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'),
        ]);
        const [worldTopo, usTopo] = await Promise.all([
          worldResp.json() as Promise<TopoJSON>,
          usResp.json() as Promise<TopoJSON>,
        ]);

        // Country borders
        const countryLines = decodeTopoBorders(worldTopo, 'countries');
        countryLines.forEach(pts => {
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          borderGroup.add(new THREE.Line(geo, countryBorderMat));
        });

        // US state borders
        const stateLines = decodeTopoBorders(usTopo, 'states');
        stateLines.forEach(pts => {
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          const line = new THREE.Line(geo, stateBorderMat);
          line.userData = { type: 'state_border' };
          borderGroup.add(line);
        });
      } catch (err) {
        console.warn('Border data unavailable:', err);
      }
    };
    // Small delay so the globe renders first
    setTimeout(loadBorders, 400);

    // ── Animation loop ─────────────────────────────────────────────────────
    let lastSunUpdate = 0;
    const X_LIMIT = Math.PI / 2.1;

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);

      if (autoRotate.current && groupRef.current) {
        groupRef.current.rotation.y += 0.0012;
      }

      if (!isDragging.current && (velY.current !== 0 || velX.current !== 0) && groupRef.current) {
        groupRef.current.rotation.y += velY.current;
        groupRef.current.rotation.x += velX.current;
        groupRef.current.rotation.x = Math.max(-X_LIMIT, Math.min(X_LIMIT, groupRef.current.rotation.x));
        velY.current *= 0.92;
        velX.current *= 0.92;
        if (Math.abs(velY.current) < 0.0002) velY.current = 0;
        if (Math.abs(velX.current) < 0.0002) velX.current = 0;
      }

      // Update sun direction every 30s
      const now = Date.now();
      if (now - lastSunUpdate > 30000) {
        lastSunUpdate = now;
        const sd = getSunDirection();
        sunDirRef.current.copy(sd);
        sunLight.position.copy(sd.clone().multiplyScalar(10));
        // Update shader uniforms
        (nightMask.material as THREE.ShaderMaterial).uniforms.sunDir.value.copy(sd);
        (cityLightsMesh.material as THREE.ShaderMaterial).uniforms.sunDir.value.copy(sd);
      }

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize handler ─────────────────────────────────────────────────────
    const onResize = () => {
      const W2 = container.clientWidth;
      const H2 = container.clientHeight;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    window.addEventListener('resize', onResize);

    // ── Touch events ───────────────────────────────────────────────────────
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
      } else {
        e.preventDefault();
        isDragging.current = true;
        movedPx.current = 0;
        prevPtr.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        velY.current = 0; velX.current = 0;
        if (resumeTimer.current) clearTimeout(resumeTimer.current);
        autoRotate.current = false;
        setTooltip(null); setTrinketPopup(null);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 2 && pinchRef.current.active) {
        const nd = getTouchDist(e);
        cameraRef.current!.position.z = Math.max(1.2, Math.min(5.5,
          cameraRef.current!.position.z + (pinchRef.current.dist - nd) * 0.012));
        pinchRef.current.dist = nd;
      } else if (e.touches.length === 1 && isDragging.current && groupRef.current) {
        const x = e.touches[0].clientX, y = e.touches[0].clientY;
        const dx = x - prevPtr.current.x, dy = y - prevPtr.current.y;
        movedPx.current += Math.abs(dx) + Math.abs(dy);
        velY.current = dx * 0.005; velX.current = dy * 0.005;
        groupRef.current.rotation.y += velY.current;
        groupRef.current.rotation.x += velX.current;
        groupRef.current.rotation.x = Math.max(-X_LIMIT, Math.min(X_LIMIT, groupRef.current.rotation.x));
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Trinket markers (update when selected country changes) ─────────────────
  useEffect(() => {
    if (!groupRef.current) return;
    const group = groupRef.current;
    trinketMeshRef.current.forEach(m => group.remove(m));
    trinketMeshRef.current = [];
    if (!selectedCountry) { setActiveTrinketCountry(null); return; }

    const trinkets = getTrinketsForCountry(selectedCountry.code);
    if (!trinkets.length) return;
    setActiveTrinketCountry(selectedCountry.code);

    const newMeshes: THREE.Mesh[] = [];
    trinkets.forEach(t => {
      const pos   = latLngToVec3(t.lat, t.lng, 1.032);
      const found = isFound(t.id);

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.032, 12, 12),
        new THREE.MeshBasicMaterial({ color: found ? 0x666666 : 0xffd700, transparent: true, opacity: found ? 0.08 : 0.22, depthWrite: false }),
      );
      glow.position.copy(pos);
      group.add(glow);
      newMeshes.push(glow);

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 10, 10),
        new THREE.MeshBasicMaterial({ color: found ? 0x555555 : 0xffd700 }),
      );
      dot.position.copy(pos);
      dot.userData = { type: 'trinket', trinket: t, found };
      group.add(dot);
      newMeshes.push(dot);

      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(0.058, 8, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001, depthWrite: false }),
      );
      hit.position.copy(pos);
      hit.userData = { type: 'trinket', trinket: t, found };
      group.add(hit);
      newMeshes.push(hit);
    });
    trinketMeshRef.current = newMeshes;
  }, [selectedCountry, isFound]);

  // ── Drag callbacks ──────────────────────────────────────────────────────────
  const startDrag = useCallback((x: number, y: number) => {
    isDragging.current = true;
    movedPx.current = 0;
    prevPtr.current = { x, y };
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

  // ── Raycasting ──────────────────────────────────────────────────────────────
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (movedPx.current > 8) return;
    if (!mountRef.current || !cameraRef.current) return;

    const rect  = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left)  / rect.width)  * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, cameraRef.current);

    // 1. Trinket markers (priority)
    const trinketHits = trinketMeshRef.current.filter(m => m.userData.type === 'trinket');
    if (trinketHits.length > 0) {
      const hits = ray.intersectObjects(trinketHits, false);
      if (hits.length > 0) {
        const t = hits[0].object.userData.trinket as Trinket;
        setTrinketPopup({ trinket: t, x: e.clientX - rect.left, y: e.clientY - rect.top });
        setTooltip(null);
        return;
      }
    }

    // 2. Landmark markers
    if (lMarkersRef.current.length > 0) {
      const hits = ray.intersectObjects(lMarkersRef.current, false);
      if (hits.length > 0) {
        const lm = hits[0].object.userData.landmark as Landmark;
        setTooltip({ landmark: lm, x: e.clientX - rect.left, y: e.clientY - rect.top });
        setTrinketPopup(null);
        if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
        tooltipTimer.current = setTimeout(() => setTooltip(null), 6000);
        return;
      }
    }

    // 3. Globe surface — dedicated transparent click sphere
    if (clickSphereRef.current) {
      const hits = ray.intersectObject(clickSphereRef.current, false);
      if (hits.length > 0) {
        const g = groupRef.current;
        if (!g) return;
        const local = hits[0].point.clone()
          .applyQuaternion(g.quaternion.clone().invert())
          .normalize();
        const lat = Math.asin(Math.max(-1, Math.min(1, local.y))) * (180 / Math.PI);
        const lng = ((Math.atan2(local.z, -local.x) * (180 / Math.PI) - 180) % 360 + 360) % 360 - 180;

        let closest: Country | null = null;
        let minDist = Infinity;
        for (const c of countries) {
          const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2;
          if (d < minDist) { minDist = d; closest = c; }
        }
        if (closest) {
          onCountrySelect?.(closest);
          setTooltip(null); setTrinketPopup(null);
        }
      }
    }
  }, [onCountrySelect, countries]);

  // ── Wheel zoom ─────────────────────────────────────────────────────────────
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(1.2, Math.min(5.5,
      cameraRef.current.position.z + e.deltaY * 0.004));
  }, []);

  const onMD = useCallback((e: React.MouseEvent) => startDrag(e.clientX, e.clientY), [startDrag]);
  const onMM = useCallback((e: React.MouseEvent) => moveDrag(e.clientX, e.clientY), [moveDrag]);
  const onMU = useCallback(() => endDrag(), [endDrag]);
  const onML = useCallback(() => { if (isDragging.current) endDrag(); }, [endDrag]);

  // ── Zoom to selected country ────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedCountry || !groupRef.current || !cameraRef.current) return;
    const g   = groupRef.current;
    const cam = cameraRef.current;
    const targetRotY =  -(selectedCountry.lng) * (Math.PI / 180);
    const targetRotX =   (selectedCountry.lat)  * (Math.PI / 180) * 0.5;
    const startRotY  = g.rotation.y, startRotX = g.rotation.x;
    const startZ     = cam.position.z;
    const targetZ    = 1.65;
    let t = 0;
    autoRotate.current = false;
    velY.current = 0; velX.current = 0;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);

    const anim = () => {
      t = Math.min(1, t + 0.025);
      const ease = 1 - Math.pow(1 - t, 3);
      g.rotation.y  = startRotY  + (targetRotY - startRotY)  * ease;
      g.rotation.x  = startRotX  + (targetRotX - startRotX)  * ease;
      cam.position.z = startZ    + (targetZ     - startZ)     * ease;
      if (t < 1) requestAnimationFrame(anim);
    };
    anim();
    resumeTimer.current = setTimeout(() => { autoRotate.current = true; }, 9000);
  }, [selectedCountry]);

  // ── Zoom out when deselected ────────────────────────────────────────────────
  useEffect(() => {
    if (selectedCountry || !cameraRef.current) return;
    const cam = cameraRef.current;
    const startZ = cam.position.z;
    let t = 0;
    const anim = () => {
      t = Math.min(1, t + 0.025);
      cam.position.z = startZ + (2.8 - startZ) * (1 - Math.pow(1 - t, 3));
      if (t < 1) requestAnimationFrame(anim);
    };
    anim();
  }, [selectedCountry]);

  // ── Claim trinket ───────────────────────────────────────────────────────────
  const handleClaimTrinket = useCallback((trinket: Trinket) => {
    claimTrinket(trinket.id);
    setClaimedPopup(trinket);
    setTrinketPopup(null);
    trinketMeshRef.current.forEach(m => {
      if (m.userData.trinket?.id === trinket.id) {
        const mat = m.material as THREE.MeshBasicMaterial;
        mat.color.setHex(0x555555);
        m.userData.found = true;
      }
    });
    setTimeout(() => setClaimedPopup(null), 3200);
  }, [claimTrinket]);

  // ── Render helpers ──────────────────────────────────────────────────────────
  const trinkets   = activeTrinketCountry ? getTrinketsForCountry(activeTrinketCountry) : [];
  const foundCount = trinkets.filter(t => isFound(t.id)).length;

  const LEGEND = [
    { type: 'wonder' as const, label: 'World Wonders', color: '#ffd700' },
    { type: 'nature' as const, label: 'Nature',         color: '#00ff88' },
    { type: 'city'   as const, label: 'Cities',         color: '#00d4ff' },
    { type: 'quirky' as const, label: 'Quirky',         color: '#ff44cc' },
    { type: 'space'  as const, label: 'Space',          color: '#8866ff' },
  ];

  const tooltipLeft = tooltip
    ? Math.min(Math.max(tooltip.x - 120, 8), (mountRef.current?.clientWidth ?? 400) - 260)
    : 0;
  const tooltipTop = tooltip
    ? Math.max(Math.min(tooltip.y - 130, (mountRef.current?.clientHeight ?? 400) - 220), 8)
    : 0;

  return (
    <div className="relative w-full h-full select-none" style={{ touchAction: 'none' }}>
      {/* Three.js canvas mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
        onMouseDown={onMD}
        onMouseMove={onMM}
        onMouseUp={onMU}
        onMouseLeave={onML}
        onClick={handleClick}
        onWheel={onWheel}
      />

      {/* Legend — bottom left */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1 pointer-events-none">
        {LEGEND.map(l => (
          <div key={l.type} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: l.color, boxShadow: `0 0 5px ${l.color}88` }} />
            <span className="text-white/50 text-xs">{l.label}</span>
          </div>
        ))}
        {trinkets.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1 border-t border-white/10 pt-1">
            <div className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: '#ffd700', boxShadow: '0 0 5px #ffd70088' }} />
            <span className="text-yellow-400/80 text-xs">Trinkets ({foundCount}/{trinkets.length})</span>
          </div>
        )}
      </div>

      {/* Hints — top right */}
      <div className="absolute top-3 right-3 text-white/22 text-xs pointer-events-none text-right leading-relaxed">
        <div>🖱 Drag · Scroll to zoom</div>
        <div>📍 Click to explore</div>
        {trinkets.length > 0 && <div className="text-yellow-400/55 mt-0.5">✨ Trinkets hidden!</div>}
      </div>

      {/* ── Landmark tooltip ── */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            key={tooltip.landmark.id}
            initial={{ opacity: 0, scale: 0.88, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 6 }}
            transition={{ duration: 0.18 }}
            className="absolute z-30"
            style={{ left: tooltipLeft, top: tooltipTop, pointerEvents: 'auto' }}
          >
            <div
              className="rounded-2xl border bg-[#0a0a1e]/96 backdrop-blur-2xl p-4 w-60 shadow-2xl"
              style={{ borderColor: MARKER_GLOW[tooltip.landmark.type] + '55' }}
            >
              {/* Close button */}
              <button
                className="absolute top-2 right-2 text-white/30 hover:text-white/70 text-base leading-none p-1"
                onClick={() => setTooltip(null)}
              >×</button>

              {/* Header */}
              <div className="flex items-start gap-2.5 mb-2.5">
                <span className="text-2xl mt-0.5 flex-shrink-0">{tooltip.landmark.emoji}</span>
                <div className="min-w-0">
                  <div className="text-white font-bold text-sm leading-tight">{tooltip.landmark.name}</div>
                  <div className="text-white/40 text-xs mt-0.5">{tooltip.landmark.country}</div>
                </div>
              </div>

              {/* Fact */}
              <p className="text-white/75 text-xs leading-relaxed mb-2.5">
                {tooltip.landmark.fact}
              </p>

              {/* Type badge */}
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: MARKER_GLOW[tooltip.landmark.type], boxShadow: `0 0 4px ${MARKER_GLOW[tooltip.landmark.type]}` }} />
                <span className="text-xs font-medium"
                  style={{ color: MARKER_GLOW[tooltip.landmark.type] }}>
                  {MARKER_LABEL[tooltip.landmark.type]}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trinket popup ── */}
      <AnimatePresence>
        {trinketPopup && (
          <motion.div
            key={trinketPopup.trinket.id}
            initial={{ opacity: 0, scale: 0.88, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 6 }}
            transition={{ duration: 0.18 }}
            className="absolute z-30"
            style={{
              left: Math.min(Math.max(trinketPopup.x - 112, 8), (mountRef.current?.clientWidth ?? 400) - 240),
              top:  Math.max(Math.min(trinketPopup.y - 130, (mountRef.current?.clientHeight ?? 400) - 240), 8),
            }}
          >
            <div className="rounded-2xl border border-yellow-400/40 bg-[#0a0a1e]/96 backdrop-blur-2xl p-4 w-56 shadow-2xl">
              <div className="flex items-start gap-2.5 mb-2.5">
                <span className="text-2xl mt-0.5">{trinketPopup.trinket.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-yellow-300 font-bold text-sm leading-tight">{trinketPopup.trinket.name}</div>
                  <div className="text-white/40 text-xs mt-0.5">
                    {isFound(trinketPopup.trinket.id) ? '✅ Already found!' : '🔍 Hidden trinket'}
                  </div>
                </div>
                <button onClick={() => setTrinketPopup(null)}
                  className="text-white/30 hover:text-white/70 text-base leading-none p-1 flex-shrink-0">×</button>
              </div>

              {isFound(trinketPopup.trinket.id) ? (
                <p className="text-white/65 text-xs leading-relaxed italic">"{trinketPopup.trinket.fact}"</p>
              ) : (
                <>
                  <p className="text-white/55 text-xs mb-3 leading-relaxed italic">
                    Hint: "{trinketPopup.trinket.hint}"
                  </p>
                  <button
                    onClick={() => handleClaimTrinket(trinketPopup.trinket)}
                    className="w-full py-2 rounded-xl bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 text-xs font-bold hover:bg-yellow-500/30 transition-colors"
                  >
                    ✨ Claim Trinket!
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Claimed celebration ── */}
      <AnimatePresence>
        {claimedPopup && (
          <motion.div
            key="claimed"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className="absolute inset-x-0 top-8 flex justify-center z-40 pointer-events-none"
          >
            <div className="px-5 py-3.5 rounded-2xl bg-yellow-500/20 border border-yellow-400/50 backdrop-blur-2xl shadow-2xl text-center">
              <div className="text-3xl mb-1">{claimedPopup.emoji}</div>
              <div className="text-yellow-300 font-bold text-sm">Trinket Found!</div>
              <div className="text-white/55 text-xs mt-0.5">{claimedPopup.name}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
