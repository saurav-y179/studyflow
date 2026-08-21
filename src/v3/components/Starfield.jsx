import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const COUNT = 600;
const SPREAD = 25;

const rng = () => {
  let s = 12345;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
};

const rand = rng();

const palette = [
  new THREE.Color('#4455da'),
  new THREE.Color('#2EE6D8'),
  new THREE.Color('#60a5fa'),
  new THREE.Color('#a78bfa'),
  new THREE.Color('#818cf8'),
];

const generatePositions = () => {
  const pos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT * 3; i++) {
    pos[i] = (rand() - 0.5) * SPREAD;
  }
  for (let i = 2; i < COUNT * 3; i += 3) {
    pos[i] -= 5;
  }
  return pos;
};

const generateColors = () => {
  const col = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    const c = palette[Math.floor(rand() * palette.length)];
    col[i3] = c.r;
    col[i3 + 1] = c.g;
    col[i3 + 2] = c.b;
  }
  return col;
};

const INITIAL_POSITIONS = generatePositions();
const INITIAL_COLORS = generateColors();

export const Starfield = ({ reducedMotion }) => {
  const ref = useRef();

  useFrame((_, delta) => {
    if (ref.current && !reducedMotion) {
      ref.current.rotation.y += delta * 0.015;
      ref.current.rotation.x += delta * 0.005;
    }
  });

  return (
    <Points ref={ref} positions={INITIAL_POSITIONS} colors={INITIAL_COLORS}>
      <PointMaterial
        size={reducedMotion ? 0.04 : 0.06}
        sizeAttenuation
        transparent
        opacity={reducedMotion ? 0.3 : 0.6}
        vertexColors
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};
