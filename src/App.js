import { useRef, Suspense, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { WaveMaterial } from './failed_attempts_graveyard/WaveMaterial';
import { LavaMaterial } from './LavaMaterial';
import { FbmMaterial } from './FbmMaterial';
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
} from '@react-three/drei';
// https://pmndrs.github.io/postprocessing/public/docs/class/src/effects/VignetteEffect.js~VignetteEffect.html
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

import { MyCustomEffect } from './MyCustomEffect';
import { WaterEffect } from './WaterEffect';
import { BlurPass, BlendFunction } from 'postprocessing';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import {AdaptiveToneMappingPass } from 'three/examples/jsm/postprocessing/AdaptiveToneMappingPass';

extend({ FilmPass, UnrealBloomPass,AdaptiveToneMappingPass });

import { EffectComposer as OldEffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
extend({ OldEffectComposer, RenderPass, GlitchPass });

//https://codesandbox.io/s/r3f-selective-bloom-7mfqw?file=/src/index.js:1460-2052
function BloomOld({ children }) {
  const { gl, camera, size } = useThree();
  const [scene, setScene] = useState();
  const composer = useRef();
  useEffect(
    () => void scene && composer.current.setSize(size.width, size.height),
    [size]
  );
  useFrame(() => scene && composer.current.render(), 1);
  return (
    <>
      <scene ref={setScene}>{children}</scene>
      <oldEffectComposer ref={composer} args={[gl]}>
        <renderPass attachArray="passes" scene={scene} camera={camera} />
        <unrealBloomPass attachArray="passes" args={[undefined, 1.5, 1, 0]} />
      </oldEffectComposer>
    </>
  );
}
function Ikke({
  x = 0,
  y = 0,
  z = 0,
  s = 1,
  radius = 1,
  detail = 4,
  dance = false,
}) {
  /*
  speed={number('Speed', 1, { range: true, max: 10, step: 0.1 })}
  distort={number('Distort', 0.6, { range: true, min: 0, max: 1, step: 0.1 })}
  radius={number('Radius', 1, { range: true, min: 0, max: 1, step: 0.1 })}
  */
  // https://github.com/pmndrs/drei#meshwobblematerial
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
}
function Effects() {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef();
  useEffect(
    () => void composer.current.setSize(size.width, size.height),
    [size]
  );
  useFrame(() => composer.current.render(), 1);

  return (
    <oldEffectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" args={[scene, camera]} />
      <glitchPass attachArray="passes" renderToScreen />
    </oldEffectComposer>
  );
}

function R3fEffects() {
  let mceRef = useRef();
  let weights = [5.1, 0.1, 1.9];
  let blendFunction = BlendFunction.NORMAL;
  let param2 = 0.1;
  let time = 0;
  let sinner = 0;
  let [show, setShow] = useState(false);

  useFrame((state, delta) => {
    time += delta;
    //console.log(time);
    sinner = Math.sin(time) * 0.5 + 0.5;
    param2 = sinner;
    //if (show)
    //  mceRef.current.uniforms.set('param2',{value: param2});

    // hack to get the previous ones to work. weird, man!
    if (time > 1) setShow(true);
    // works
    //mceRef.current.blendMode=BlendFunction.ALPHA;
  });
  // TODO: somehow split them up.. to have the water effect sperate because of input buffer
  return (
    <>
      <EffectComposer>
        <MyCustomEffect param2={param2} weights={weights}></MyCustomEffect>
        <ChromaticAberration blendFunction={BlendFunction.ADD} offset={0.5} />
        <ColorDepth blendFunction={BlendFunction.NORMAL} bits={16} />
        <Bloom
          blendFunction={BlendFunction.ADD}
          intensity={6}
          luminanceThreshold={0.9}
          luminanceSmoothing={1.5}
        />
      </EffectComposer>
    </>
  );
}
// somehow it must be possible
// https://github.com/pmndrs/drei/issues/935
const RenderPipeline = ({
  bloom = true,
  toneMapping = true,
  vignette = false
}) => (
  <Effects>
    {toneMapping && <adaptiveToneMappingPass args={[true, 256]} />}
  </Effects>
)
function R3fPostEffects() {
  return (
    <>
      <EffectComposer>
        <WaterEffect />
      </EffectComposer>
    </>
  );
}
// <ColorDepth blendFunction={BlendFunction.ALPHA} bits={5.5}  />
/*

    <ChromaticAberration blendFunction={BlendFunction.ADD} offset={0.5} />
        <ColorDepth blendFunction={BlendFunction.ALPHA} bits={16} />
        <Bloom
          attachArray="passes"
          intensity={5}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.5}
          blurPass={new BlurPass()}
        />

<Scanline attachArray="passes"
          density={0.2}
          blendFunction={BlendFunction.COLOR_BURN}
        />
*/
// https://onion2k.github.io/r3f-by-example/examples/materials/glowing-torus/
function Lava() {
  console.log('test');
  const shaderRef = useRef();
  const torusRef = useRef();
  const sparkleRef = useRef();
  // https://gracious-keller-98ef35.netlify.app/docs/api/hooks/useThree/
  const { camera, viewport, gl } = useThree((state) => state);
  const [texture1, texture2] = useTexture([
    '/textures/cloud.png',
    '/textures/lavatile.jpg',
  ]);

  // repeat textures mirrored
  texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
  texture2.wrapS = texture2.wrapT = THREE.MirroredRepeatWrapping;

  useFrame((state, delta) => {
    shaderRef.current.time += delta * 4;
    torusRef.current.rotation.x += 0.001;
    torusRef.current.rotation.y += delta / 4;
    sparkleRef.current.rotation.x += 0.001;
    //sparkleRef.current.rotation.y += 0.001;
  });

  // wobble torus https://drei.pmnd.rs/?path=/story/shaders-meshwobblematerial--mesh-wobble-material-st&knob-Animation=Dance&knob-Azimuth=0.25&knob-Blend%20duration=0.5&knob-Color=#EC2D2D&knob-ContactShadow={}&knob-Environment=apartment&knob-Float%20Intensity=2&knob-Inclination=0.49&knob-Intensity=1&knob-Max%20Floating%20Range=1&knob-Opacity=1&knob-Pos%20X=0&knob-Pos%20Y=0&knob-Pos%20Z=0&knob-Preset=rembrandt&knob-Rayleigh=1.1&knob-Rotation%20Intensity=4&knob-Shadow=true&knob-Speed=5&knob-Turbidity=6.6&knob-mieCoefficient=0.002&knob-mieDirectionalG=0.8&knob-raycast%20bvh%20enabled=true&knob-size=256&knob-split%20strategy=AVERAGE&knob-texture%20index=111&knob-texture%20repeat=8&knob-texture%20scale=4&knob-vizualize%20bounds=true
  // https://pmndrs.github.io/postprocessing/public/docs/
  return (
    <>
      <mesh ref={torusRef}>
        <torusGeometry args={[10, 5, 32, 256]} />
        <lavaMaterial
          ref={shaderRef}
          fogColor={'black'}
          texture1={texture1}
          uvScale={[3.0, 2.0]}
          texture2={texture2}
          key={LavaMaterial.key}
          toneMapped={true}
          fogDensity={0.05}
        />
      </mesh>
      <Sparkles
        noise={1}
        ref={sparkleRef}
        scale={25}
        size={20}
        color="orange"
        count={50}
      />
    </>
  );
}

function Torus2() {
  // https://github.com/mrdoob/three.js/blob/b398bc410bd161a88e8087898eb66639f03762be/src/renderers/shaders/ShaderLib/meshbasic.glsl.js
  const wobbleRef = useRef();
  window.wob = wobbleRef;
  return (
    <Torus args={[2, 0.25, 40, 100]}>
      <MeshWobbleMaterial
        ref={wobbleRef}
        color="#f25042"
        speed={1}
        factor={0.6}
      >
        {' '}
      </MeshWobbleMaterial>
    </Torus>
  );
}

function FbmThing() {
  const matRef = useRef();
  useFrame((state, delta) => {
    matRef.current.time += delta * 4;
  });
  // fix uv mapping
  // https://en.wikibooks.org/wiki/GLSL_Programming/GLUT/Textured_Spheres
  const [geometry] = useState(() => new THREE.SphereGeometry(3.1, 32, 32), []);
  return (
    <mesh geometry={geometry}>
      <fbmMaterial ref={matRef} />
    </mesh>
  );
}
function Sphere({ geometry, x, y, z, s }) {
  const ref = useRef();
  // make em wobble https://tympanus.net/codrops/2021/01/26/twisted-colorful-spheres-with-three-js/
  useFrame((state) => {
    // dance
    const dance = false;
    if (dance) {
      ref.current.position.x =
        x + Math.sin((state.clock.getElapsedTime() * s) / 2);
      ref.current.position.y =
        y + Math.sin((state.clock.getElapsedTime() * s) / 2);
      ref.current.position.z =
        z + Math.sin((state.clock.getElapsedTime() * s) / 2);
    }
  });

  // speed: max 10
  // distort: min: 0 max: 1
  // radius: 0-1
  // <meshStandardMaterial color={'red'} metalness={0.5} roughness={0} />
  // JELLY:
  // <MeshDistortMaterial color="orange" speed={5} distort={0.5} radius={0.9} />
  // and dance= false
  // and const [geometry] = useState(() => new THREE.TorusKnotGeometry(.11, .341, 64,64,0.5,0.5), []);
  return (
    <mesh
      color="orange"
      ref={ref}
      position={[x, y, z]}
      scale={[s, s, s]}
      geometry={geometry}
    >
      <MeshDistortMaterial
        side={THREE.DoubleSide}
        color="orange"
        speed={5}
        distort={0.5}
        radius={0.9}
      />
    </mesh>
  );
}
function RandomSpheres() {
  const [geometry] = useState(() => new THREE.SphereGeometry(0.1, 32, 32), []);
  // kinda like a jellyfish. Somehow cut it off with bolean operation https://github.com/looeee/threejs-csg
  // https://github.com/pmndrs/react-three-csg
  /*const [geometry] = useState(
    () => new THREE.TorusKnotGeometry(.11, .341, 64,64,0.5,0.5),
    []
  );*/
  //const [geometry] = useState(() => new THREE.SphereGeometry(0.11,16,16, Math.PI/2,  Math.PI, 0, Math.PI), []);

  // turnn then into a compound body
  // https://codesandbox.io/s/r3f-ibl-envmap-simple-forked-hzlrej?file=/src/Scene.js:797-800
  const data = useMemo(() => {
    return new Array(15).fill().map((_, i) => ({
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      z: Math.random() * 100 - 50,
      s: Math.random() * 10,
      radius: Math.random() * 1,
      detail: Math.random() * 4,
      dance: true,
    }));
  }, []);
  // <Sphere key={i} {...props} geometry={geometry} />
  return data.map((props, i) => <Ikke key={i} {...props} />);
}
function Main({ children }) {
  const scene = useRef();
  const { gl, camera } = useThree();
  useFrame(() => {
    gl.autoClear = false;
    gl.clearDepth();
    gl.render(scene.current, camera);
  }, 2);
  return <scene ref={scene}>{children}</scene>;
}

export default function App() {
  return (
    <div style={{ padding: '5px', backgroundColor: 'gray', height: '100%' }}>
      <Canvas camera={{ position: [-20, 20, 20] }} dpr={1}>
        <color attach={'background'} args={['black']} />
        <fog attach="fog" args={['white', 1, 155]} />
        <pointLight position={[-5, 5, 5]} />
        <RandomSpheres />
        <Lava />
        <Torus2 />
        <FbmThing />
        <Stars />
        <Ikke x={0} y={0} z={0} s={1} radius={1} detail={4} dance={false} />
        <R3fEffects />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
// <RenderPipeline bloom={true} />
/*
    radius?: number;
    depth?: number;
    count?: number;
    factor?: number;
    saturation?: number;
    fade?: boolean;
    speed?: number;
*/
// <R3fEffects />
// <Lava />
//<Effects />
//<Stats />
//<Lava />
/*  <Sky
        distance={300000}
        turbidity={6.6}
        rayleigh={1.1}
        mieCoefficient={0.005}
        mieDirectionalG={ 0.8}
        inclination={0.49}
        azimuth={0.25}
      />
<Stage
        contactShadow={ {blur: 2, opacity: 0.5,position: [0, 0, 0]}}
        shadows={false}
        intensity={1}
        environment="night"
      >
      </Stage>
  <Cloud position={[-4, -2, 0]} args={[3, 2]} />

      <Cloud opacity={0.5} color='yellow' position={[-4, 2, 0]} args={[3, 2]} />
      <Cloud opacity={0.5} color='yellow' args={[3, 2]} />
      <Cloud opacity={0.5} color='yellow' position={[4, -2, 0]} args={[3, 2]} />
      <Cloud opacity={0.5} color='yellow' position={[4, 2, 0]} args={[3, 2]} />
*/
