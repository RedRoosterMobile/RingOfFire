import { useRef, useState, forwardRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { BlendFunction } from 'postprocessing';
import { useControls } from 'leva';
import {
  EffectComposer,
  Bloom,
  GodRays,
  Vignette,
} from '@react-three/postprocessing';
import { Jellyfish1 } from './things/Jellyfish1';
import { Shark } from './things/Shark';
import {
  useTexture,
  OrbitControls,
  Sparkles,
  Plane,
  Stats,
  Stars,
  Edges,
  Instances,
  PerformanceMonitor,
} from '@react-three/drei';

import { Perf } from 'r3f-perf';
import Glitch from './post/Glitch';
import { WaterEffect } from './r3f-effects/WaterEffect';
import Tint from './failed_attempts_graveyard/Tint';
import WobbleMesh, { RandomCacti } from './things/Cactus';
import { MyCustomEffect } from './r3f-effects/MyCustomEffect';
import { Monument } from './things/Monument';
import { Seaweed } from './things/Seaweed';
import { Rocks } from './things/Rock';
import { SeaweedArmature } from './things/SeaweedArmature';
import { MantaRay } from './things/MantaRay';
import { FishSwarm } from './things/fish-swarm/FishSwarm';
import { BestBoids } from './things/BestBoids';

import { v4 as uuidv4 } from 'uuid';
const fragmentShader = `
varying float vZ;
varying vec2 vUv;
// varying float vPulse;

void main() {
  // vec3 strength = vec3(vPulse, .05, .1);
  gl_FragColor = vec4(vUv.yy, vUv.y * .5  + .5, 1.);
}
`;
import glsl from 'babel-plugin-glsl/macro';
import { PurpleSky } from './PurpleSky';
import { Forest } from './things/Forest';
import InstancesExample from './things/InstancesExample';
import ForestInstances from './things/ForestInstances';

const vertexShader = glsl`

  uniform float uTime;
  varying float vZ;

  varying vec2 vUv;
  varying float vPulse;

  #pragma glslify: snoise4 = require(glsl-noise/simplex/4d.glsl);

  void main() {
    float noise = snoise4(vec4(normal * .5, uTime));
    vec3 newPosition = position + noise * .14;
    newPosition.y += sin(newPosition.x * 5.0 + uTime * 22.0) * .25;
    
    vUv = uv;
    // vPulse = noise;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(newPosition, 1.);
  }
`;

const Sun = forwardRef(function Sun(props, forwardRef) {
  useFrame(({ clock }) => {
    forwardRef.current.position.x = Math.sin(clock.getElapsedTime()) * -8;
    forwardRef.current.position.y = Math.cos(clock.getElapsedTime()) * -8;
  });

  return (
    <mesh ref={forwardRef} position={[0, 0, -15]}>
      <sphereGeometry args={[1, 36, 36]} />
      <meshBasicMaterial color={'#00FF00'} />
    </mesh>
  );
});

function R3fEffects() {
  let weights = [5.1, 0.1, 1.9];
  // <MyCustomEffect param2={0.1} weights={weights}></MyCustomEffect>
  const waterProps = useControls('Water Effect', {
    frequency: { value: 6.0, min: 0.0, max: 12.0 },
    factor: { value: 1.0, min: 0.0, max: 2.0 },
  });
  // <WaterEffect {...waterProps} />
  // <MyCustomEffect param2={0.1} weights={weights}></MyCustomEffect>

  return (
    <>
      <EffectComposer multisampling={8}>
        <WaterEffect {...waterProps} />
        
        <Bloom
          mipmapBlur
          intensity={1}
          luminanceThreshold={1.0}
          luminanceSmoothing={1.3}
        />
        <Vignette darkness={0.5} />
      </EffectComposer>
    </>
  );
}
/*
<Bloom
              blendFunction={BlendFunction.ADD}
              intensity={20}
              luminanceThreshold={0.9}
              luminanceSmoothing={1.3}
            />
 <Bloom
          blendFunction={BlendFunction.ADD}
          intensity={20}
          luminanceThreshold={0.9}
          luminanceSmoothing={1.3}
        />
  <Bloom
          blendFunction={BlendFunction.ADD}
          intensity={20}
          luminanceThreshold={0.9}
          luminanceSmoothing={1.3}
        />
*/
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
      <planeBufferGeometry args={[256, 256, 1, 1]} />
      <meshStandardMaterial color={'#C2B280'} />
    </mesh>
  );
};
// https://github.com/martinRenou/threejs-caustics
const DancingSpotlights = () => {
  // TODO:
  //
  // frame:
  // iterate colors (hue rotate?)
  //
  // animate angles (spring?)
  // animate positions along paths (bezier?)
  // general:
  // texture projection (shader?)

  return (
    <spotLight
      position={[0, 50, 0]}
      castShadow
      color={0xffffff}
      angle={1.3}
      decay={2}
      penumbra={0.7}
    />
  );
};

export default function Jellyfish() {
  const canvasRef = useRef();
  const [isReady, setIsReady] = useState(false);

  const ambientRef = useRef();
  const pointLightRef = useRef();
  const treeGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 8);

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

        setTimeout(() => {
          //gl.shadowMap.type = THREE.PCFSoftShadowMap;
          console.log('pointLight: ', pointLightRef.current);
          console.log('shadowMap: ', gl.shadowMap.type);
          console.log('types:');
          console.log('BasicShadowMap', THREE.BasicShadowMap);
          console.log('PCFShadowMap', THREE.PCFShadowMap);
          console.log('PCFSoftShadowMap', THREE.PCFSoftShadowMap);
          console.log('VSMShadowMap', THREE.VSMShadowMap);
          //gl.shadowMap.autoUpdate = false;
          //gl.shadowMap.needsUpdate = true;
          setTimeout(() => {
            console.log('waited another 4 sec..');
            //setIsReady(true);
          }, 4000);
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
        //  <color attach="background" args={[0x191970]} />
      }}
    >
      <Perf position="top-left" />
      <color attach="background" args={[0x191970]} />
      <fogExp2 attach="fog" args={['#000080', 0.01]} />
      <group>
        <pointLight
          ref={pointLightRef}
          intensity={1.8}
          //intensity={0}
          position={[0, 40, 0]}
          castShadow
          shadowMapWidth={2048 * 2}
          shadowMapHeight={2048 * 2}
          decay={200}
        />
        <spotLight
          position={[0, 150, 0]}
          castShadow
          color={0xffffff}
          angle={0.3}
          decay={2}
          penumbra={0.7}
        />
        <directionalLight position={[0, 40, 0]} intensity={0.1} decay={30} />
        <ambientLight ref={ambientRef} intensity={0.2} />
        <Ground />
        <Jellyfish1 enabled={true} />
        <ForestInstances />
       
      </group>
      <OrbitControls />
    </Canvas>
  );
}
/*
 <Forest radius={20} amount={200} />
   <Shark position={[0, 0, 0]} />
        <MantaRay position={[10, 20, 0]} />
        <Terrain />
        <Jellyfish1 enabled={true} position={[-5, 15, -10]} />
        <BestBoids position={[0, 25, 0]} />
        
        <PurpleSky size={400} exponent={3} brightness={0.5}/>
*/
// <FishSwarm position={[0,30,0]}/>
// <MantaRay position={[10, 20, 0]} />
// spotlight config https://threejs.org/examples/#webgl_lights_spotlight
// really cool spotlights https://threejs.org/examples/?q=spotlight#webgl_lights_spotlights
// <directionalLight position={[0, 40, 0]} intensity={0.2} decay={30}/>
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



     <directionalLight
        position={[0, 1, 0]}
        castShadow
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
        shadow-radius={10}
        shadow-bias={-0.0001}
      />
*/
