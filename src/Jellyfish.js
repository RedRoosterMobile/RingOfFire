import { useRef, Suspense, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
//import { LavaMaterial } from './LavaMaterial';
import { BlurPass, BlendFunction } from 'postprocessing';
import {
  EffectComposer,
  Bloom,
  GodRays,
  Scanline,
  Vignette,
  Outline,
  ChromaticAberration,
  ColorDepth,
} from '@react-three/postprocessing';
import { Jellyfish1 } from './Jellyfish1';
import WaterEffects from './WaterEffects';
import { useTexture, OrbitControls, Sparkles, Plane } from '@react-three/drei';
import { WaterEffect } from './WaterEffect';

function R3fEffects() {
  return (
    <EffectComposer>
      <Bloom
        blendFunction={BlendFunction.ADD}
        intensity={100}
        luminanceThreshold={0.1}
        luminanceSmoothing={1.3}
      />
    </EffectComposer>
  );
}
const Terrain = () => {
  //const height = useLoader(THREE.TextureLoader, "/textures/sea_floor/DisplacementMap.png");
  //const normals = useLoader(THREE.TextureLoader, "/textures/sea_floor/NormalMap.png");
  const [height, normals,colors] = useTexture([
    '/textures/sea_floor/DisplacementMap.png',
    '/textures/sea_floor/NormalMap.png',
    '/textures/sea_floor/AmbientOcclusionMap.png',
  ]);
  // repeat textures mirrored
  height.wrapS = height.wrapT = THREE.RepeatWrapping;
  normals.wrapS = normals.wrapT = THREE.MirroredRepeatWrapping;


  return (
    <group>
      <Plane
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -30, 0]}
        args={[256, 256, 2096, 2096]}
      >
        <meshStandardMaterial
          attach="material"
          color="white"
          map={colors}
          metalness={0.2}
          normalMap={normals}
          displacementMap={height}
        />
      </Plane>
    </group>
  );
};

export default function Jellyfish() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 100, position: [0, 0, 30] }}
      onCreated={({ gl }) => {
        console.log('dunno');
        gl.toneMapping = THREE.ReinhardToneMapping;
        // navy 000080
        // midnigtblue 191970
        gl.setClearColor(new THREE.Color('#191970'));
      }}
    >
      <Terrain />
      <Sparkles
        luminanceThreshold={1.01}
        color={'#999'}
        size={20}
        count={60}
        opacity={0.1}
        noise={100}
        scale={[10, 10, 10]}
      />
      <fog attach="fog" args={['#000030', 50, 190]} />
      <pointLight distance={100} intensity={1} color="#87CEFA" />
      <ambientLight color={'#87CEFA'} intensity={0.01}/>
      <Jellyfish1 luminanceThreshold={0.1} />
<R3fEffects/>
      <OrbitControls />
    </Canvas>
  );
}

/*
    radius?: number;
    depth?: number;
    count?: number;
    factor?: number;
    saturation?: number;
    fade?: boolean;
    speed?: number;
*/
