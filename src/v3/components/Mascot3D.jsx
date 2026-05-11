import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Environment, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// Real 3D Model from .glb
const PikachuModel = () => {
  const { scene } = useGLTF('/pikachu.glb');
  const group = useRef();

  const modelTransform = useMemo(() => {
    if (!scene) return;

    // Auto-scale and center the unknown .glb model to fit the sidebar perfectly
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim <= 0) return { scale: 1, position: [0, -0.5, 0] };

    const scale = 2.5 / maxDim;
    const center = new THREE.Vector3();
    box.getCenter(center);

    return {
      scale,
      position: [-center.x * scale, -center.y * scale - 0.5, -center.z * scale],
    };
  }, [scene]);

  useFrame((state) => {
    if (!group.current) return;
    // Look around based on mouse movements
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, (state.pointer.x * Math.PI) / 3, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -(state.pointer.y * Math.PI) / 6, 0.05);
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={modelTransform?.scale || 1} position={modelTransform?.position || [0, -0.5, 0]} />
      
      {/* Lightning FX removed as per request */}
    </group>
  );
};

// Preload the model so it doesn't pop in late
useGLTF.preload('/pikachu.glb');

export const Mascot3D = () => {
  return (
    <div className="w-[120px] h-[120px] mx-auto mb-2 relative group cursor-pointer">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        {/* Soft directional light to highlight the model */}
        <directionalLight position={[-5, 5, 5]} intensity={1} color="#ffffff" />
        
        <Environment preset="city" />
        
        {/* Suspense handles the loading state of the GLB */}
        <Suspense fallback={null}>
          <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.6}>
            <PikachuModel />
          </Float>
        </Suspense>
        
        <ContactShadows position={[0, -1.8, 0]} opacity={0.4} scale={5} blur={2} far={4} />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
