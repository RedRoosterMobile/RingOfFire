import { useRef, Suspense } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree,extend } from '@react-three/fiber'
import { WaveMaterial } from './WaveMaterial'
import { LavaMaterial } from './LavaMaterial'
import { useTexture, shaderMaterial, OrbitControls,Torus, Stats,Stars, Sparkles,Sky, Cloud ,Stage,MeshWobbleMaterial} from "@react-three/drei"
// https://pmndrs.github.io/postprocessing/public/docs/class/src/effects/VignetteEffect.js~VignetteEffect.html
import { EffectComposer, Bloom, GodRays,Scanline,Vignette, ChromaticAberration, ColorDepth } from "@react-three/postprocessing";
import { BlurPass,BlendFunction } from "postprocessing";
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass'
extend({ FilmPass })
function ShaderPlane() {
  const ref = useRef()
  const { width, height } = useThree((state) => state.viewport)
  const [texture1] = useTexture(["/download.jpeg"])
  useFrame((state, delta) => (ref.current.time += delta))
  return (
    <mesh scale={[width, height, 1]}>
      <planeGeometry /> 
      <waveMaterial ref={ref} tex={texture1} key={WaveMaterial.key} toneMapped={true} colorStart={'orange'} colorEnd={'red'} />
    </mesh>
  )
}

function Effects() {
  return (
    <>
      <EffectComposer>
       
        
        <ChromaticAberration blendFunction={BlendFunction.ADD} offset={0.5} />
        
        <ColorDepth blendFunction={BlendFunction.ALPHA} bits={16}  />
        <Bloom attachArray="passes"
          intensity={5}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.5}
          blurPass={new BlurPass()}
        />
      </EffectComposer>
    </>
  );
}
// <ColorDepth blendFunction={BlendFunction.ALPHA} bits={5.5}  />
/*
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
  const { width, height } = useThree((state) => state.viewport)
  const [texture1,texture2] = useTexture(["/textures/cloud.png","/textures/lavatile.jpg"])

  // repeat textures mirrored
  texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
  texture2.wrapS = texture2.wrapT = THREE.MirroredRepeatWrapping;
 
  useFrame((state, delta) => (shaderRef.current.time += delta*4))
  useFrame(({ camera }) => {
    torusRef.current.rotation.x += 0.001;
    torusRef.current.rotation.y += 0.001;
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
          uvScale ={[3.0,2.0]}
          texture2={texture2}
          key={LavaMaterial.key}
          toneMapped={true}
          fogDensity={0.05 }
          />
      </mesh>
      <Sparkles noise={1}ref={sparkleRef} scale={25} size={20} color="orange" count={50} />
    </>
  )
}

function Torus2() {
  // https://github.com/mrdoob/three.js/blob/b398bc410bd161a88e8087898eb66639f03762be/src/renderers/shaders/ShaderLib/meshbasic.glsl.js
  const wobbleRef = useRef();
  window.wob = wobbleRef;
  return(<Torus args={[2, 0.25, 40, 100]}>
        <MeshWobbleMaterial
        ref={wobbleRef}
          color="#f25042"
          speed={ 1}
          factor={ 0.6}
        > </MeshWobbleMaterial>
        
      </Torus>)

}

export default function App() {
  return (
    <div style={{padding: '5px', backgroundColor: 'gray',     height: '100%'}}>
      <Canvas 
        camera={{ position: [-20, 20, 20] }}>
          <color attach={"background"} args={["black"]} />
          <fog attach="fog" args={["white", 1, 155]} />
          <pointLight position={[-5, 5, 5]} />
          <Lava />
        <Torus2/>
        <Stars />
        
        <Effects />
        <OrbitControls />
      </Canvas>
    </div>
  )
}
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