import { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { WaveMaterial } from './WaveMaterial';
import { LavaMaterial } from './LavaMaterial';
import {
  useTexture,
  shaderMaterial,
  OrbitControls,
  Stats,
} from '@react-three/drei';
import {
  Bloom,
  ChromaticAberration,
  ColorDepth,
  EffectComposer,
} from '@react-three/postprocessing';
import { BlendFunction, BlurPass,KernelSize } from 'postprocessing';
import WaterEffect from './WaterEffect';
function ShaderPlane() {
  const ref = useRef();
  const { viewport } = useThree((state) => state);
  const [texture1] = useTexture(['/download.jpeg']);
  useFrame((state, delta) => (ref.current.time += delta));
  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry />
      <waveMaterial
        ref={ref}
        tex={texture1}
        key={WaveMaterial.key}
        toneMapped={true}
        colorStart={'orange'}
        colorEnd={'red'}
      />
    </mesh>
  );
}

function R3fEffects() {
  return (
    <>
      <EffectComposer>
        <ChromaticAberration blendFunction={BlendFunction.ADD} offset={0.5} />
        <ColorDepth blendFunction={BlendFunction.ALPHA} bits={16} />
        <Bloom
          attachArray="passes"
          intensity={5}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.5}
          blurPass={new BlurPass(KernelSize.TINY)}
        />
      </EffectComposer>
    </>
  );
}

// https://onion2k.github.io/r3f-by-example/examples/materials/glowing-torus/
function Lava() {
  const shaderRef = useRef();
  const torusRef = useRef();
  const { width, height } = useThree((state) => state.viewport);
  const [texture1, texture2] = useTexture([
    '/textures/cloud.png',
    '/textures/lavatile.jpg',
  ]);

  // repeat textures mirrored
  texture1.wrapS = texture1.wrapT = THREE.MirroredRepeatWrapping;
  texture2.wrapS = texture2.wrapT = THREE.MirroredRepeatWrapping;

  useFrame((state, delta) => (shaderRef.current.time += delta));
  return (
    <mesh scale={[width, height, 1]} ref={torusRef}>
      <planeGeometry />
      <lavaMaterial
        ref={shaderRef}
        fogColor={'black'}
        texture1={texture1}
        uvScale={[1.0, 1.0]}
        texture2={texture2}
        key={LavaMaterial.key}
        toneMapped={true}
        fogDensity={0.05}
      />
    </mesh>
  );
}

export default function OtherApp() {
  return (
    <div style={{ padding: '5px', backgroundColor: 'gray', height: '100%' }}>
      <Canvas>
        <Lava />
       
        <Stats />
      </Canvas>
    </div>
  );
}
// <R3fEffects />