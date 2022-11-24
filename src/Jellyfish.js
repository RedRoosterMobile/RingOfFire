import { useRef, Suspense, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
//import { LavaMaterial } from './LavaMaterial';
import { BlurPass, BlendFunction, Resizer, KernelSize } from 'postprocessing';
import { useSpring, animated, config } from '@react-spring/three';

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
  SelectiveBloom,
  Select,
  Selection,
} from '@react-three/postprocessing';
import { Jellyfish1 } from './Jellyfish1';
import { Shark } from './Shark';
import {
  useTexture,
  OrbitControls,
  Sparkles,
  Plane,
  Stats,
  Stars,
} from '@react-three/drei';
import Glitch from './Glitch';
import { WaterEffect } from './WaterEffect';
import Tint from './Tint';
//import Cactus from './Cactus';
import WobbleMesh, { RandomCacti } from './Cactus';
import { MyCustomEffect } from './MyCustomEffect';
import { Monument } from './Monument';
import { Seaweed } from './Seaweed';
import { Rocks } from './Rock';
import { SeaweedArmature } from './SeaweedArmature';
import { MantaRay } from './MantaRay';

function R3fEffects() {
  let weights = [5.1, 0.1, 1.9];
  return (
    <>
      <EffectComposer>
        <MyCustomEffect param2={0.1} weights={weights}></MyCustomEffect>
        <Bloom
          blendFunction={BlendFunction.ADD}
          intensity={20}
          luminanceThreshold={1}
          luminanceSmoothing={1.3}
        />
      </EffectComposer>
    </>
  );
}
/*<WaterEffect />
<ChromaticAberration
          blendFunction={BlendFunction.ADD}
          offset={[.005,0.005]}
        />
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
function Sphere(props) {
  return (
    <Select enabled={props.enabled}>
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
    </Select>
  );
}
const Terrain = () => {
  const [height, normals, colors, specular] = useTexture([
    '/textures/sea_floor/DisplacementMap.png',
    '/textures/sea_floor/NormalMap.png',
    '/textures/sea_floor/AmbientOcclusionMap.png',
    '/textures/sea_floor/SpecularMap.png',
  ]);
  // repeat textures mirrored
  height.wrapS = height.wrapT = THREE.RepeatWrapping;
  normals.wrapS = normals.wrapT = THREE.MirroredRepeatWrapping;
  colors.wrapS = colors.wrapT = THREE.MirroredRepeatWrapping;

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -12, 0]}
        receiveShadow
      >
        <planeBufferGeometry args={[256, 256, 512, 512]} />
        <meshStandardMaterial
          attach="material"
          color="gray"
          map={specular}
          aoMap={colors}
          metalness={0.2}
          normalMap={normals}
          displacementMap={height}
          displacementScale={50}
          displacementBias={2}
        />
      </mesh>
      <Monument amount={50} />
      <Seaweed amount={20} />
      <SeaweedArmature position={[1, 1, 1]} />
      <Rocks amount={2} />
    </group>
  );
};
// lighting tutorial https://www.youtube.com/watch?v=T6PhV4Hz0u4
// <RandomCacti amount={15} />

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
      <meshStandardMaterial color={'#C2B280'} />
    </mesh>
  );
};

export default function Jellyfish() {
  const canvasRef = useRef();
  const [fxReady, setFxReady] = useState({});

  const ambientRef = useRef();
  const pointLightRef = useRef();

  // https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance
  return (
    <Canvas
      // Only render on changes and movement
      //frameloop="demand"
      ref={canvasRef}
      dpr={[1, 2]}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      camera={{ fov: 88, position: [0, 15, 0] }}
      onCreated={({ gl, scene, camera, size }) => {
        console.log('Canvas:onCreated');
        //gl.toneMapping = THREE.ReinhardToneMapping;
        // navy 000080
        // midnigtblue 191970
        //gl.setClearColor(new THREE.Color('#191970'));
        //console.log(scene);
        setFxReady({ scene, gl, camera, size });
        setTimeout(() => {
          console.log('shadowStuff');
          //gl.shadowMap.type = THREE.PCFSoftShadowMap;
          console.log('pointLight: ',pointLightRef.current);
          console.log('shadowMap: ',gl.shadowMap.type);
          console.log('types:')
          console.log('BasicShadowMap',THREE.BasicShadowMap);
          console.log('PCFShadowMap',THREE.PCFShadowMap);
          console.log('PCFSoftShadowMap',THREE.PCFSoftShadowMap);
          console.log('VSMShadowMap',THREE.VSMShadowMap);
          //gl.shadowMap.autoUpdate = false;
          //gl.shadowMap.needsUpdate = true;
        }, 2000);
        //camera.lookAt(new THREE.Vector3(0, 0, 100));
        
        //https://threejs.org/docs/#api/en/renderers/WebGLRenderer.shadowMap
        //gl.shadowMap.enabled=true;
        //gl.shadowMap.type=THREE.VSMShadowMap;

        // do post fx here???
        // fog explained: https://www.youtube.com/watch?v=k1zGz55EqfU
        // color start end
        //<fog attach="fog" args={['blue', 1, 155]} />
        // color exponential
        // <fogExp2 attach="fog" args={['#000080', 0.025]} />
        //scene.add( new THREE.GridHelper(10, 10) );
        //<fogExp2 attach="fog" args={['#000080', 0.01]} />
        //<gridHelper args={[128*2,128*2]}/>
      }}
    >
      <color attach="background" args={[0x191970]} />

      <group>
        <pointLight
          ref={pointLightRef}
          intensity={1.8}
          position={[-10, 40, -5]}
          castShadow
          shadowMapWidth={2048*2}
          shadowMapHeight={2048*2}
        />

        <ambientLight ref={ambientRef} intensity={0.02} />
        <Shark position={[0, 0, 0]} />
        <Terrain/>
        <Ground />
        <MantaRay position={[10, 20, 0]} />

        <OrbitControls />
      </group>

      <Stats />
    </Canvas>
  );
}
// <Terrain />
/*
<Jellyfish1 enabled={true} position={[-5, 15, -10]} />
<Jellyfish1 enabled={true} />

<Shark position={[0, 0, -10]} />

<Sparkles
  color={'#999'}
  size={1.5}
  count={60}
  speed={0.5}
  opacity={0.1}
  noise={100}
  scale={[10, 10, 10]}
/>*/
/** <Sphere/>
 * // <Tint />
 *   {fxReady && <Glitch {...fxReady} />}
 * <Sphere enabled={true} position={[0, 0, 1]} />
 * <R3fEffects/>
     <Glitch />


       <EffectComposer>
        <SelectiveBloom
          lights={[ambientRef]}
          intensity={100}
          width={Resizer.LARGE}
          height={Resizer.LARGE}
          kernelSize={KernelSize.LARGE}
          luminanceThreshold={0}
          luminanceSmoothing={0}
        />
      </EffectComposer>
 */
//<R3fEffects/>
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
