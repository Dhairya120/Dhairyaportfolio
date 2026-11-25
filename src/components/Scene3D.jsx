import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ─── Fade helper ──────────────────────────────────────────────────────────────
// Returns { groupRef, tick }
// tick(delta) → lerps opacity, returns current fade value
function useFade(active) {
  const groupRef = useRef();
  const fade     = useRef(active ? 1 : 0);
  const actRef   = useRef(active);
  const objsRef  = useRef([]); // Object3D list with userData.baseOp

  useEffect(() => { actRef.current = active; }, [active]);

  // Run once after mount: snapshot all base opacities and apply initial fade
  useEffect(() => {
    if (!groupRef.current) return;
    const list = [];
    groupRef.current.traverse((o) => {
      if (o.material) {
        const base = typeof o.material.opacity === 'number' ? o.material.opacity : 1;
        o.userData.baseOp = base;
        o.material.transparent = true;
        o.material.opacity = base * fade.current;
        list.push(o);
      }
    });
    objsRef.current = list;
    groupRef.current.visible = fade.current > 0.005;
  }, []); // eslint-disable-line

  const tick = (delta) => {
    const target = actRef.current ? 1 : 0;
    fade.current += (target - fade.current) * Math.min(delta * 2.5, 1);
    if (groupRef.current) {
      groupRef.current.visible = fade.current > 0.005;
      objsRef.current.forEach((o) => {
        o.material.opacity = o.userData.baseOp * fade.current;
      });
    }
    return fade.current;
  };

  return { groupRef, tick };
}

// ─── Always-on particle cloud ─────────────────────────────────────────────────
const PARTICLE_COUNT = typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches
  ? 500
  : 900;

function ParticleCloud() {
  const ref = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 32;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 5;
    }
    return pos;
  }, []);
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.00015; });
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial transparent color="#e63232" size={0.010}
        sizeAttenuation depthWrite={false} opacity={0.22} />
    </Points>
  );
}

// ─── Section 0: Holographic Globe ─────────────────────────────────────────────
function latLon(lat, lon, r) {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}
function buildArc(a, b, segs = 70) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(mid.length() * 1.3);
  return new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(segs);
}

const CITY_PAIRS = [
  [{ lat: 51.5, lon: -0.1 },  { lat: 40.7, lon: -74.0 }],
  [{ lat: 35.7, lon: 139.7 }, { lat: 1.3,  lon: 103.8 }],
  [{ lat: 48.9, lon: 2.3 },   { lat: 22.3, lon: 114.2 }],
  [{ lat: 37.8, lon: -122.4 },{ lat: 35.7, lon: 139.7 }],
  [{ lat: 19.1, lon: 72.9 },  { lat: 51.5, lon: -0.1  }],
  [{ lat: -23.5, lon: -46.6 },{ lat: 40.7, lon: -74.0 }],
  [{ lat: 55.8, lon: 37.6 },  { lat: 48.9, lon: 2.3   }],
];

function GlobeScene({ active }) {
  const { groupRef, tick } = useFade(active);
  const rotRef = useRef();
  const R = 2.4;

  const gridGeos = useMemo(() => {
    const out = [];
    for (let lat = -75; lat <= 75; lat += 15) {
      const pts = [];
      for (let lon = 0; lon <= 360; lon += 3) pts.push(latLon(lat, lon, R));
      out.push({ geo: new THREE.BufferGeometry().setFromPoints(pts), lat: true });
    }
    for (let lon = 0; lon < 360; lon += 20) {
      const pts = [];
      for (let lat = -90; lat <= 90; lat += 3) pts.push(latLon(lat, lon, R));
      out.push({ geo: new THREE.BufferGeometry().setFromPoints(pts), lat: false });
    }
    return out;
  }, []);

  const arcs = useMemo(() =>
    CITY_PAIRS.map(([a, b]) => {
      const pts = buildArc(latLon(a.lat, a.lon, R), latLon(b.lat, b.lon, R));
      return { geo: new THREE.BufferGeometry().setFromPoints(pts), pts };
    }), []);

  const pulses   = useRef(CITY_PAIRS.map((_, i) => i / CITY_PAIRS.length));
  const dotRefs  = useRef([]);

  useFrame((state, delta) => {
    const f = tick(delta);
    if (f < 0.005) return;
    if (rotRef.current) rotRef.current.rotation.y = state.clock.elapsedTime * 0.09;
    pulses.current.forEach((p, i) => {
      pulses.current[i] = (p + delta * 0.38) % 1;
      const dot = dotRefs.current[i];
      if (!dot) return;
      const idx = Math.floor(pulses.current[i] * (arcs[i].pts.length - 1));
      const pt  = arcs[i].pts[idx];
      dot.position.set(pt.x, pt.y, pt.z);
    });
  });

  return (
    <group ref={groupRef}>
      <group ref={rotRef}>
        <mesh>
          <sphereGeometry args={[2.36, 32, 32]} />
          <meshStandardMaterial color="#080000"
            emissive={new THREE.Color('#e63232')} emissiveIntensity={0.08}
            opacity={0.55} transparent />
        </mesh>
        {gridGeos.map(({ geo, lat: isLat }, i) => (
          <line key={i} geometry={geo}>
            <lineBasicMaterial color="#e63232" transparent opacity={isLat ? 0.18 : 0.11} />
          </line>
        ))}
        {arcs.map(({ geo }, i) => (
          <line key={i} geometry={geo}>
            <lineBasicMaterial color="#e63232" transparent opacity={0.45} />
          </line>
        ))}
        {arcs.map((_, i) => (
          <mesh key={i} ref={(el) => (dotRefs.current[i] = el)}>
            <sphereGeometry args={[0.042, 8, 8]} />
            <meshStandardMaterial color="#ff4444"
              emissive={new THREE.Color('#ff2200')} emissiveIntensity={2.5} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[2.52, 32, 32]} />
          <meshStandardMaterial color="#e63232" transparent opacity={0.04} side={THREE.BackSide} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Section 1: DNA Double Helix ──────────────────────────────────────────────
function DNAScene({ active }) {
  const { groupRef, tick } = useFade(active);
  const rotRef = useRef();
  const N = 40, R = 1.4, H = 7.0;

  const { s1, s2, rungGeos, strand1Geo, strand2Geo } = useMemo(() => {
    const s1 = [], s2 = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const a = t * Math.PI * 4.5;
      const y = (t - 0.5) * H;
      s1.push(new THREE.Vector3(R * Math.cos(a), y, R * Math.sin(a)));
      s2.push(new THREE.Vector3(R * Math.cos(a + Math.PI), y, R * Math.sin(a + Math.PI)));
    }
    const rungGeos = [];
    for (let i = 0; i < N; i += 3) {
      rungGeos.push(new THREE.BufferGeometry().setFromPoints([s1[i], s2[i]]));
    }
    return {
      s1, s2, rungGeos,
      strand1Geo: new THREE.BufferGeometry().setFromPoints(s1),
      strand2Geo: new THREE.BufferGeometry().setFromPoints(s2),
    };
  }, []);

  useFrame((state, delta) => {
    const f = tick(delta);
    if (f < 0.005 || !rotRef.current) return;
    rotRef.current.rotation.y  = state.clock.elapsedTime * 0.25;
    rotRef.current.position.y  = Math.sin(state.clock.elapsedTime * 0.35) * 0.25;
  });

  return (
    <group ref={groupRef}>
      <group ref={rotRef}>
        {/* Strand A — red */}
        <line geometry={strand1Geo}>
          <lineBasicMaterial color="#e63232" transparent opacity={0.85} />
        </line>
        {/* Strand B — dim white */}
        <line geometry={strand2Geo}>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.22} />
        </line>
        {/* Rungs */}
        {rungGeos.map((geo, i) => (
          <line key={i} geometry={geo}>
            <lineBasicMaterial color="#e63232" transparent opacity={0.38} />
          </line>
        ))}
        {/* Nucleotide spheres – strand A */}
        {s1.filter((_, i) => i % 2 === 0).map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.075, 8, 8]} />
            <meshStandardMaterial color="#e63232"
              emissive={new THREE.Color('#e63232')} emissiveIntensity={0.9}
              transparent opacity={0.92} />
          </mesh>
        ))}
        {/* Nucleotide spheres – strand B */}
        {s2.filter((_, i) => i % 2 === 0).map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.28} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ─── Section 2: Neural Network ────────────────────────────────────────────────
function NeuralScene({ active }) {
  const { groupRef, tick } = useFade(active);
  const rotRef = useRef();

  const { nodes, edgeGeos, pulseEdges } = useMemo(() => {
    const nodes = [];
    for (let i = 0; i < 20; i++) {
      const u = Math.random(), v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi   = Math.acos(2 * v - 1);
      const r     = 2.2 + Math.random() * 1.2;
      nodes.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      ));
    }
    const edges = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 2.8) edges.push([i, j]);
      }
    }
    const edgeGeos = edges.map(([i, j]) =>
      new THREE.BufferGeometry().setFromPoints([nodes[i], nodes[j]])
    );
    const pulseEdges = edges.slice(0, Math.min(10, edges.length));
    return { nodes, edgeGeos, pulseEdges };
  }, []);

  const dotRefs      = useRef([]);
  const pulseProgress = useRef(pulseEdges.map((_, i) => i / pulseEdges.length));

  useFrame((state, delta) => {
    const f = tick(delta);
    if (f < 0.005 || !rotRef.current) return;
    rotRef.current.rotation.y = state.clock.elapsedTime * 0.11;
    rotRef.current.rotation.x = state.clock.elapsedTime * 0.055;

    pulseProgress.current.forEach((p, i) => {
      pulseProgress.current[i] = (p + delta * 0.55) % 1;
      const dot = dotRefs.current[i];
      if (!dot) return;
      const [a, b] = pulseEdges[i];
      const aPos = nodes[a];
      const bPos = nodes[b];
      const t = pulseProgress.current[i];
      dot.position.set(
        aPos.x + (bPos.x - aPos.x) * t,
        aPos.y + (bPos.y - aPos.y) * t,
        aPos.z + (bPos.z - aPos.z) * t,
      );
    });
  });

  return (
    <group ref={groupRef}>
      <group ref={rotRef}>
        {/* Edges */}
        {edgeGeos.map((geo, i) => (
          <line key={i} geometry={geo}>
            <lineBasicMaterial color="#e63232" transparent opacity={0.18} />
          </line>
        ))}
        {/* Nodes */}
        {nodes.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial color="#e63232"
              emissive={new THREE.Color('#e63232')} emissiveIntensity={1.4}
              transparent opacity={0.88} />
          </mesh>
        ))}
        {/* Pulse dots */}
        {pulseEdges.map((_, i) => (
          <mesh key={i} ref={(el) => (dotRefs.current[i] = el)}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color="#ff8888"
              emissive={new THREE.Color('#ff2200')} emissiveIntensity={3.5}
              transparent opacity={0.95} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ─── Section 3: Orbital / Atom System ────────────────────────────────────────
const ORBITS = [
  { r: 2.2, speed: 0.70, tilt: [0.40, 0.00, 0.00], color: '#e63232' },
  { r: 3.0, speed: 0.45, tilt: [0.00, 0.00, 1.10], color: '#cc2222' },
  { r: 1.6, speed: 1.10, tilt: [1.20, 0.30, 0.00], color: '#ff4444' },
  { r: 3.7, speed: 0.30, tilt: [0.80, 0.00, 0.60], color: '#aa1111' },
];

function OrbitalScene({ active }) {
  const { groupRef, tick } = useFade(active);
  const dotRefs  = useRef([]);
  const coreRef  = useRef();

  useFrame((state, delta) => {
    const f = tick(delta);
    if (f < 0.005) return;

    // Slow overall drift
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.06;
    }
    // Core pulse
    if (coreRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.08;
      coreRef.current.scale.set(s, s, s);
    }
    // Orbiting dots
    ORBITS.forEach(({ r, speed }, i) => {
      const dot = dotRefs.current[i];
      if (!dot) return;
      const angle = state.clock.elapsedTime * speed;
      dot.position.set(r * Math.cos(angle), 0, r * Math.sin(angle));
    });
  });

  return (
    <group ref={groupRef}>
      {/* Central core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#e63232"
          emissive={new THREE.Color('#e63232')} emissiveIntensity={2.2}
          transparent opacity={0.95} />
      </mesh>
      {/* Core glow halo */}
      <mesh>
        <sphereGeometry args={[0.65, 32, 32]} />
        <meshStandardMaterial color="#e63232" transparent opacity={0.07} side={THREE.BackSide} />
      </mesh>

      {/* Rings + dots */}
      {ORBITS.map(({ r, tilt, color }, i) => (
        <group key={i} rotation={tilt}>
          <mesh>
            <torusGeometry args={[r, 0.007, 16, 200]} />
            <meshBasicMaterial color={color} transparent opacity={0.32} />
          </mesh>
          <mesh ref={(el) => (dotRefs.current[i] = el)}>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshStandardMaterial color={color}
              emissive={new THREE.Color(color)} emissiveIntensity={2.0}
              transparent opacity={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Section 4: Radar / Signal Waves ─────────────────────────────────────────
function RadarScene({ active }) {
  const { groupRef, tick } = useFade(active);
  const RING_COUNT = 6;
  const ringRefs   = useRef([]);
  const sweepRef   = useRef();
  const phases     = useRef(Array.from({ length: RING_COUNT }, (_, i) => i / RING_COUNT));

  const ringGeo = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  const sweepGeo = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(4.0, 0, 0),
    ]);
  }, []);

  useFrame((state, delta) => {
    const f = tick(delta);
    if (f < 0.005) return;

    phases.current.forEach((p, i) => {
      phases.current[i] = (p + delta * 0.25) % 1;
      const ring = ringRefs.current[i];
      if (!ring) return;
      const scale = 0.2 + phases.current[i] * 4.5;
      ring.scale.set(scale, scale, scale);
      if (ring.material) ring.material.opacity = f * (1 - phases.current[i]) * 0.55;
    });

    if (sweepRef.current) {
      sweepRef.current.rotation.z = -state.clock.elapsedTime * 1.0;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Center core */}
      <mesh>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color="#e63232"
          emissive={new THREE.Color('#e63232')} emissiveIntensity={3.5}
          transparent opacity={0.95} />
      </mesh>
      {/* Center glow */}
      <mesh>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#e63232" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>

      {/* Static grid rings */}
      {[1.0, 2.0, 3.0, 4.0].map((r, i) => (
        <line key={i} geometry={ringGeo} scale={[r, r, r]}>
          <lineBasicMaterial color="#e63232" transparent opacity={0.09} />
        </line>
      ))}

      {/* Expanding pulse rings */}
      {Array.from({ length: RING_COUNT }).map((_, i) => (
        <line
          key={i}
          ref={(el) => (ringRefs.current[i] = el)}
          geometry={ringGeo}
        >
          <lineBasicMaterial color="#e63232" transparent opacity={0.5} />
        </line>
      ))}

      {/* Rotating sweep line */}
      <line ref={sweepRef} geometry={sweepGeo}>
        <lineBasicMaterial color="#e63232" transparent opacity={0.55} />
      </line>

      {/* Sweep fan (triangle fill) */}
      <mesh ref={null} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.01, 4.0, 0.001, 32, 1, false, 0, Math.PI * 0.18]} />
        <meshBasicMaterial color="#e63232" transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Section 5: Contact — Signal Ripple ──────────────────────────────────────
function ContactScene({ active }) {
  const { groupRef, tick } = useFade(active);
  const innerRef  = useRef();
  const coreRef   = useRef();
  const haloRef   = useRef();

  const RINGS = 14;
  const PER_RING = 52;

  const { geo, lineGeos } = useMemo(() => {
    const total = RINGS * PER_RING;
    const pos   = new Float32Array(total * 3);
    let idx = 0;
    for (let r = 0; r < RINGS; r++) {
      const radius = (r + 1) * 0.36;
      for (let p = 0; p < PER_RING; p++) {
        const angle = (p / PER_RING) * Math.PI * 2;
        pos[idx++] = Math.cos(angle) * radius;
        pos[idx++] = 0;
        pos[idx++] = Math.sin(angle) * radius;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    // Static ring outlines for 3 of the rings
    const lineGeos = [2, 6, 11].map((r) => {
      const radius = (r + 1) * 0.36;
      const pts = [];
      for (let p = 0; p <= 128; p++) {
        const a = (p / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
      }
      return new THREE.BufferGeometry().setFromPoints(pts);
    });

    return { geo: g, lineGeos };
  }, []);

  useFrame((state, delta) => {
    const f = tick(delta);
    if (f < 0.005) return;

    const t   = state.clock.elapsedTime;
    const pos = geo.attributes.position.array;

    for (let r = 0; r < RINGS; r++) {
      const radius = (r + 1) * 0.36;
      const wave   = Math.sin(radius * 2.2 - t * 2.2) * 0.38 * Math.exp(-radius * 0.12);
      for (let p = 0; p < PER_RING; p++) {
        pos[(r * PER_RING + p) * 3 + 1] = wave;
      }
    }
    geo.attributes.position.needsUpdate = true;

    if (innerRef.current) innerRef.current.rotation.y = t * 0.07;

    // Core pulse
    if (coreRef.current) {
      const s = 1 + Math.sin(t * 2.8) * 0.12;
      coreRef.current.scale.set(s, s, s);
    }
    if (haloRef.current) {
      const s = 1 + Math.sin(t * 2.8 + 0.8) * 0.18;
      haloRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={groupRef} rotation={[-0.52, 0, 0]}>
      <group ref={innerRef}>
        {/* Ripple dot field */}
        <points geometry={geo}>
          <pointsMaterial transparent color="#e63232" size={0.038}
            sizeAttenuation depthWrite={false} opacity={0.72} />
        </points>

        {/* Static ring outlines */}
        {lineGeos.map((geo, i) => (
          <line key={i} geometry={geo}>
            <lineBasicMaterial color="#e63232" transparent opacity={0.12 - i * 0.03} />
          </line>
        ))}

        {/* Centre core */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial color="#e63232"
            emissive={new THREE.Color('#e63232')} emissiveIntensity={3.0}
            transparent opacity={0.95} />
        </mesh>
        {/* Halo */}
        <mesh ref={haloRef}>
          <sphereGeometry args={[0.44, 24, 24]} />
          <meshStandardMaterial color="#e63232" transparent opacity={0.06}
            side={THREE.BackSide} />
        </mesh>

        {/* Vertical signal beam */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 9, 8]} />
          <meshBasicMaterial color="#e63232" transparent opacity={0.18} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Camera rig ───────────────────────────────────────────────────────────────
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef([0, 0]);

  useEffect(() => {
    const h = (e) => {
      mouse.current = [
        (e.clientX / window.innerWidth  - 0.5) * 2,
        -(e.clientY / window.innerHeight - 0.5) * 2,
      ];
    };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current[0] * 0.5 - camera.position.x) * 0.04;
    camera.position.y += (mouse.current[1] * 0.3 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── Export ───────────────────────────────────────────────────────────────────
const IS_MOBILE = typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches;

export default function Scene3D({ currentSection = 0, paused = false }) {
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible',
  );

  useEffect(() => {
    const onVis = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const running = pageVisible && !paused;

  return (
    <div className="canvas-container" style={{ visibility: paused ? 'hidden' : 'visible' }}>
      <Canvas
        camera={{ position: [0, 0.8, 7.5], fov: 62 }}
        dpr={IS_MOBILE ? [1, 1] : [1, 1.25]}
        frameloop={running ? 'always' : 'never'}
        performance={{ min: 0.5 }}
        gl={{
          antialias: !IS_MOBILE,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.12} />
        <pointLight position={[8, 8, 6]}   color="#e63232" intensity={1.6} />
        <pointLight position={[-6, -6, 4]} color="#ffffff" intensity={0.28} />

        {running ? <CameraRig /> : null}
        <ParticleCloud />

        <GlobeScene    active={currentSection === 0} />
        <DNAScene      active={currentSection === 1} />
        <NeuralScene   active={currentSection === 2 || currentSection === 5} />
        <OrbitalScene  active={currentSection === 3} />
        <RadarScene    active={currentSection === 4} />
        <ContactScene  active={currentSection === 6} />
      </Canvas>
    </div>
  );
}
