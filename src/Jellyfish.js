import { useRef, Suspense, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
//import { LavaMaterial } from './LavaMaterial';
import { BlurPass, BlendFunction, Selection } from 'postprocessing';
extend({ Selection });
import {
  EffectComposer,
  Bloom,
  GodRays,
  Scanline,
  Vignette,
  Outline,
  ChromaticAberration,
  ColorDepth,
  DepthOfField,
} from '@react-three/postprocessing';
import { Jellyfish1 } from './Jellyfish1';
import { Shark } from './Shark';
import {
  useTexture,
  OrbitControls,
  Sparkles,
  Plane,
  Select,
} from '@react-three/drei';
import Glitch from './Glitch';

function R3fEffects() {
  return (
    <>
      <EffectComposer>
      
        <ChromaticAberration blendFunction={BlendFunction.ADD} offset={1.5} />
        <Bloom
          blendFunction={BlendFunction.ADD}
          intensity={100}
          luminanceThreshold={0.1}
          luminanceSmoothing={1.3}
        />
      </EffectComposer>
    </>
  );
}
/*

<MyCustomEffect param2={param2} weights={weights}></MyCustomEffect>
        <ChromaticAberration blendFunction={BlendFunction.ADD} offset={0.5} />
        <ColorDepth blendFunction={BlendFunction.NORMAL} bits={16} />
disableRenderPass={false}
        disableRender={false}
        multisampling={0}
        disableNormalPass={false}

         <WaterEffect />
        <Bloom
          blendFunction={BlendFunction.ADD}
          intensity={100}
          luminanceThreshold={0.1}
          luminanceSmoothing={1.3}
        />
*/
function Sphere() {
  return (
    <mesh position={[-10, +10, 0]} scale={10} rotation={[0, 0, 0]} castShadow>
      <sphereGeometry attach="geometry" args={[1, 16, 16]} />
      <meshStandardMaterial
        attach="material"
        color="white"
        transparent
        roughness={0.1}
        metalness={0.1}
      />
    </mesh>
  );
}
const Terrain = () => {
  //const height = useLoader(THREE.TextureLoader, "/textures/sea_floor/DisplacementMap.png");
  //const normals = useLoader(THREE.TextureLoader, "/textures/sea_floor/NormalMap.png");
  const [height, normals, colors] = useTexture([
    '/textures/sea_floor/DisplacementMap.png',
    '/textures/sea_floor/NormalMap.png',
    '/textures/sea_floor/AmbientOcclusionMap.png',
  ]);
  // repeat textures mirrored
  height.wrapS = height.wrapT = THREE.RepeatWrapping;
  normals.wrapS = normals.wrapT = THREE.MirroredRepeatWrapping;

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -19, 0]}
        receiveShadow
      >
        <planeBufferGeometry args={[256, 256, 2096, 2096]} />
        <meshStandardMaterial
          attach="material"
          color="white"
          map={colors}
          metalness={0.2}
          normalMap={normals}
          displacementMap={height}
          displacementScale={50}
          displacementBias={2}
        />
      </mesh>
    </group>
  );
};
const Ground = () => {
  const groundRef = useRef();

  return (
    <mesh
      ref={groundRef}
      rotation={[Math.PI * -0.5, 0, 0]}
      position={[0, -0, 0]}
      receiveShadow
    >
      <planeBufferGeometry args={[256, 256, 2096, 2096]} />
      <meshStandardMaterial color={'#eeeeee'} />
    </mesh>
  );
};
/**
 * 
 * @returns 
  <meshStandardMaterial
          emissive="#8FBC8F"
          emissiveIntensity={0.01}
          toneMapped={true}
          attach="material"
          color="white"
          map={colors}
          metalness={0.2}
          normalMap={normals}
          displacementMap={height}
          displacementScale={50}
          displacementBias={2}
          clipShadows={true}
          receiveShadow={true}
        />
 */
export default function Jellyfish() {
  const canvasRef = useRef();
  const [fxReady, setFxReady] = useState({});
  return (
    <Canvas
      ref={canvasRef}
      dpr={[1, 2]}
      camera={{ fov: 100, position: [0, 0, 15] }}
      shadows={THREE.VSMShadowMap}
      onCreated={({ gl, scene, camera, size }) => {
        console.log('dunno');
        gl.toneMapping = THREE.ReinhardToneMapping;
        // navy 000080
        // midnigtblue 191970
        gl.setClearColor(new THREE.Color('#191970'));
        console.log(scene);
        setFxReady({ scene, gl, camera, size });
        // do post fx here???
      }}
    >
     
      
      <pointLight position={[0, 0, 0]} />
      
      <Jellyfish1 />
      <Shark position={[0, 0, 1]} />
      <Sparkles
        color={'#999'}
        size={1.5}
        count={60}
        speed={0.5}
        opacity={0.1}
        noise={100}
        scale={[10, 10, 10]}
      />
      <Terrain />

      <OrbitControls />
<R3fEffects/>
     
      {fxReady && null}
    </Canvas>
  );
}
//<pointLight position={[-5, 5, 5]} />
//<fog attach="fog" args={['blue', 1, 155]} />
//<Ground />
//<Sphere position={[0, 0, 1]} />
// <WaterEffects {...fxReady} />
// <OldEffects scene={fxReady} />
//   {canvasRef && canvasRef.current && <OldEffects2 scene={canvasRef} />}

/*       <R3fEffects /><fog attach="fog" args={['#000030', 50, 190]} />
      <Jellyfish1 /> <Shark position={[0, 0, 1]} />
       <Sparkles
        color={'#999'}
        size={1.5}
        count={60}
        speed={0.5}
        opacity={0.1}
        noise={100}
        scale={[10, 10, 10]}
      />
    radius?: number;
    depth?: number;
    count?: number;
    factor?: number;
    saturation?: number;
    fade?: boolean;
    speed?: number;


     <directionalLight
        position={[0, 1, 0]}
        castShadow
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
        shadow-radius={10}
        shadow-bias={-0.0001}
      />
*/
