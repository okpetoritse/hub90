'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

// 1. The rotating planet logic
function Planet() {
  const sphereRef = useRef<THREE.Mesh>(null);

  // Rotate the globe smoothly on every single frame
  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.001;
      sphereRef.current.rotation.z += 0.0005;
    }
  });

  return (
    <mesh ref={sphereRef}>
      {/* 64 segments makes it a perfectly smooth sphere */}
      <sphereGeometry args={[2, 64, 64]} />
      {/* Custom Material to give it that dark-mode, wireframe/digital look */}
      <meshStandardMaterial 
        color="#050505" 
        wireframe={true} 
        emissive="#00B140"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

// 2. The Core Canvas Wrapper
export default function InteractiveGlobe() {
  return (
    <div className="w-full h-[400px] sm:h-[500px] bg-transparent cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        {/* Ambient lighting */}
        <ambientLight intensity={0.1} />
        {/* Directional light to give the globe a 3D shadow */}
        <directionalLight position={[10, 10, 5]} intensity={1} color="#EEB624" />
        
        {/* Starry background */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* The Globe itself */}
        <Planet />
      </Canvas>
    </div>
  );
}