import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { BallCollider, Physics, RigidBody } from '@react-three/rapier';

const TECH = [
  { name: 'React.js', slug: 'react', color: '61DAFB' },
  { name: 'Next.js', slug: 'nextdotjs', color: 'FFFFFF' },
  { name: 'JavaScript', slug: 'javascript', color: 'F7DF1E' },
  { name: 'HTML5', slug: 'html5', color: 'E34F26' },
  { name: 'CSS3', slug: 'css', color: '1572B6' },
  { name: 'Android', slug: 'android', color: '3DDC84' },
  { name: 'Directus', slug: 'directus', color: '6644FF' },
  { name: 'PostgreSQL', slug: 'postgresql', color: '4169E1' },
  { name: 'WordPress', slug: 'wordpress', color: '21759B' },
  { name: 'Shopify', slug: 'shopify', color: '7AB55C' },
  { name: 'Git', slug: 'git', color: 'F05032' },
  { name: 'Cursor', slug: 'cursor', color: 'FFFFFF' },
  { name: 'Claude AI', slug: 'claude', color: 'D97757' },
  { name: 'Linux', slug: 'linux', color: 'FCC624' },
];

const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
const impulseScale = new THREE.Vector3();

const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches;
const BALL_COUNT = isMobile ? 10 : 14;

const ballDefs = Array.from({ length: BALL_COUNT }, (_, i) => ({
  scale: [0.78, 0.9, 1, 1.08, 1.18][i % 5],
  techIndex: i % TECH.length,
  // Stable spawn positions (avoid Math.random during render)
  position: [
    ((i % 5) - 2) * 1.6,
    (Math.floor(i / 5) - 1) * 1.8,
    ((i % 3) - 1) * 1.4,
  ],
}));

function logoUrl(item) {
  if (item.src) return item.src;
  return `https://cdn.simpleicons.org/${item.slug}/${item.color}`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function createLogoTexture(item) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size * 0.65);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(1, '#e8e8e8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  try {
    const img = await loadImage(logoUrl(item));
    const logoSize = size * 0.4;
    ctx.drawImage(img, (size - logoSize) / 2, (size - logoSize) / 2, logoSize, logoSize);
  } catch {
    ctx.fillStyle = '#222';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.name.slice(0, 2).toUpperCase(), size / 2, size / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function SphereBall({ vec = new THREE.Vector3(), scale, material, isActive, position }) {
  const api = useRef(null);

  useFrame((_state, delta) => {
    if (!isActive || !api.current) return;
    const d = Math.min(0.1, delta);
    const t = api.current.translation();
    vec.set(t.x, t.y, t.z);
    if (vec.lengthSq() < 0.0001) return;
    vec.normalize();
    impulseScale.set(-50 * d * scale, -65 * d * scale, -50 * d * scale);
    vec.multiply(impulseScale);
    api.current.applyImpulse(vec, false);
  });

  return (
    <RigidBody
      ref={api}
      colliders={false}
      linearDamping={0.8}
      angularDamping={0.2}
      friction={0.2}
      restitution={0.5}
      scale={scale}
      position={position}
    >
      <BallCollider args={[1]} />
      <mesh geometry={sphereGeometry} material={material} />
    </RigidBody>
  );
}

function Pointer({ vec = new THREE.Vector3(), isActive }) {
  const ref = useRef(null);

  useFrame(({ pointer, viewport }) => {
    if (!isActive || !ref.current) return;
    ref.current.setNextKinematicTranslation(
      vec.lerp(
        new THREE.Vector3(
          (pointer.x * viewport.width) / 2,
          (pointer.y * viewport.height) / 2,
          0,
        ),
        0.2,
      ),
    );
  });

  return (
    <RigidBody type="kinematicPosition" colliders={false} ref={ref}>
      <BallCollider args={[1.15]} />
    </RigidBody>
  );
}

function BallScene({ isActive, materials }) {
  return (
    <Physics gravity={[0, 0, 0]} timeStep={1 / 60} paused={!isActive}>
      <Pointer isActive={isActive} />
      {ballDefs.map((ball, i) => (
        <SphereBall
          key={i}
          scale={ball.scale}
          material={materials[ball.techIndex]}
          isActive={isActive}
          position={ball.position}
        />
      ))}
    </Physics>
  );
}

let materialsCache = null;
let materialsPromise = null;

function loadMaterials() {
  if (materialsCache) return Promise.resolve(materialsCache);
  if (materialsPromise) return materialsPromise;
  materialsPromise = Promise.all(TECH.map((item) => createLogoTexture(item))).then((textures) => {
    materialsCache = textures.map(
      (map) =>
        new THREE.MeshStandardMaterial({
          map,
          emissiveMap: map,
          emissive: new THREE.Color('#ffffff'),
          emissiveIntensity: 0.18,
          roughness: 0.4,
          metalness: 0.12,
        }),
    );
    return materialsCache;
  });
  return materialsPromise;
}

export default function StackBalls({ active }) {
  const [materials, setMaterials] = useState(() => materialsCache || []);
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible',
  );

  useEffect(() => {
    const onVis = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    let alive = true;
    loadMaterials().then((mats) => {
      if (alive) setMaterials(mats);
    });
    return () => {
      alive = false;
    };
  }, []);

  const running = active && pageVisible;
  const dpr = useMemo(() => (isMobile ? [1, 1] : [1, 1.25]), []);

  return (
    <Canvas
      dpr={dpr}
      frameloop={running ? 'always' : 'never'}
      gl={{
        antialias: !isMobile,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      camera={{ position: [0, 0, 18], fov: 28, near: 1, far: 60 }}
      onCreated={(state) => {
        state.gl.toneMappingExposure = 1.25;
      }}
      className="tech-canvas"
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 10, 12]} intensity={1.1} />
      <pointLight position={[-8, -6, -4]} intensity={0.35} color="#e63232" />

      {materials.length > 0 ? (
        <BallScene isActive={running} materials={materials} />
      ) : null}
    </Canvas>
  );
}
