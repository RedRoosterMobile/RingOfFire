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
import {
  useTexture,
  shaderMaterial,
  OrbitControls,
  Torus,
  Stats,
  Stars,
  Sparkles,
  Sky,
  Cloud,
  Stage,
  MeshWobbleMaterial,
  MeshDistortMaterial,
  Icosahedron,
  useAnimations,
} from '@react-three/drei';
import { WaterEffect } from './WaterEffect';
// https://pmndrs.github.io/postprocessing/public/docs/class/src/effects/VignetteEffect.js~VignetteEffect.html
/*import {
  EffectComposer,
  Bloom,
  GodRays,
  Scanline,
  Vignette,
  Outline,
  ChromaticAberration,
  ColorDepth,
} from '@react-three/postprocessing';*/
//import { BlurPass, BlendFunction } from 'postprocessing';
//import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
//import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
//extend({ FilmPass, UnrealBloomPass });

//import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
//import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
//import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
//extend({ OldEffectComposer, RenderPass, GlitchPass });
/*
function Ikke({
  x = 0,
  y = 0,
  z = 0,
  s = 1,
  radius = 1,
  detail = 4,
  dance = false,
}) {
ps://github.com/pmndrs/drei#meshwobblematerial
  //https://github.com/pmndrs/drei#meshdistortmaterial
  //https://github.com/pmndrs/drei#meshrefractionmaterial

  const ref = useRef();
  // make em wobble https://tympanus.net/codrops/2021/01/26/twisted-colorful-spheres-with-three-js/
  useFrame((state) => {
    // dance
    //const dance = true;
    if (dance) {
      ref.current.position.x =
        x + Math.sin((state.clock.getElapsedTime() * s) / 2);
      ref.current.position.y =
        y + Math.sin((state.clock.getElapsedTime() * s) / 2);
      ref.current.position.z =
        z + Math.sin((state.clock.getElapsedTime() * s) / 2);
    }
  });
  return (
    <Icosahedron
      args={[radius, 4]}
      position={[x, y, z]}
      scale={[s, s, s]}
      ref={ref}
    >
      <MeshDistortMaterial
        color="#f25042"
        speed={1}
        distort={0.6}
        radius={0.5}
      />
    </Icosahedron>
  );
}*/

function R3fEffects() {
  return (
    <EffectComposer>
      <ChromaticAberration blendFunction={BlendFunction.ADD} offset={0.5} />
      <WaterEffect />
      <Bloom
          blendFunction={BlendFunction.ADD}
          intensity={100}
          luminanceThreshold={0.1}
          luminanceSmoothing={1.3}
        />
    </EffectComposer>
  );
}

export default function Jellyfish() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 100, position: [0, 0, 30] }}
      onCreated={({ gl }) => {
        //gl.toneMapping = THREE.Uncharted2ToneMapping;
        gl.setClearColor(new THREE.Color('#020207'));
      }}
    >
      <fog attach="fog" args={['white', 50, 190]} />
      <pointLight distance={100} intensity={4} color="white" />
      <Jellyfish1 />
      <R3fEffects />
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
