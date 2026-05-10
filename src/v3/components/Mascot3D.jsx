import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Environment, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// Procedural Lightning Sparks
const ElectricSparks = ({ origin }) => {
  const pointsCount = 7;
  const linesCount = 4;
  const linesRef = useRef([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Only update lightning every ~50ms to make it snappy/flashing
    if (Math.floor(t * 20) % 2 === 0) {
      linesRef.current.forEach((line) => {
        if (!line) return;
        const positions = new Float32Array(pointsCount * 3);
        let currentPos = new THREE.Vector3(...origin);
        
        for (let j = 0; j < pointsCount; j++) {
          positions[j * 3] = currentPos.x;
          positions[j * 3 + 1] = currentPos.y;
          positions[j * 3 + 2] = currentPos.z;
          
          // Random offset for next point
          currentPos.x += (Math.random() - 0.5) * 1.5;
          currentPos.y += (Math.random() - 0.5) * 1.5;
          currentPos.z += (Math.random() - 0.5) * 1.5;
        }
        line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        line.geometry.attributes.position.needsUpdate = true;
        
        // Randomly hide/show lines and alter colors
        line.visible = Math.random() > 0.3;
        line.material.color.setHex(Math.random() > 0.5 ? 0xffff00 : 0x00e0ff);
      });
    }
  });

  return (
    <group>
      {Array.from({ length: linesCount }).map((_, i) => (
        <line key={i} ref={(el) => (linesRef.current[i] = el)}>
          <bufferGeometry />
          <lineBasicMaterial color="#ffff00" linewidth={2} transparent opacity={0.9} />
        </line>
      ))}
    </group>
  );
};

// Real 3D Model from .glb
const PikachuModel = () => {
  const { scene } = useGLTF('/pikachu.glb');
  const group = useRef();
  
  React.useEffect(() => {
    if (!scene) return;
    
    // Auto-scale and center the unknown .glb model to fit the sidebar perfectly
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      // Scale to roughly 2.5 units
      const scale = 2.5 / maxDim;
      scene.scale.setScalar(scale);
      
      // Re-calculate box after scaling and center it on Y-axis and X/Z
      box.setFromObject(scene);
      box.getCenter(size);
      scene.position.sub(size);
      // Shift slightly down so it sits nicely in the ContactShadows
      scene.position.y -= 0.5;
    }
    
    // Optional: Boost emissive materials if the model has them
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        if (child.material.emissiveIntensity !== undefined) {
          child.material.emissiveIntensity *= 2; 
        }
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (!group.current) return;
    // Look around based on mouse movements
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, (state.pointer.x * Math.PI) / 3, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -(state.pointer.y * Math.PI) / 6, 0.05);
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
      
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
        
        {/* React.Suspense handles the loading state of the GLB */}
        <React.Suspense fallback={null}>
          <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.6}>
            <PikachuModel />
          </Float>
        </React.Suspense>
        
        <ContactShadows position={[0, -1.8, 0]} opacity={0.4} scale={5} blur={2} far={4} />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
