import { useRef, Suspense } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree,extend } from '@react-three/fiber'
import { WaveMaterial } from './WaveMaterial'
import { LavaMaterial } from './LavaMaterial'
import { useTexture, shaderMaterial, OrbitControls, Stats,Stars, Sparkles,Sky, Cloud ,Stage} from "@react-three/drei"
import { EffectComposer, Bloom, GodRays,Scanline, ChromaticAberration, ColorDepth } from "@react-three/postprocessing";
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
        <Bloom attachArray="passes"
          intensity={5}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.5}
          blurPass={new BlurPass()}
        />
        
        <ChromaticAberration blendFunction={BlendFunction.ADD} offset={0.5} />
        <ColorDepth blendFunction={BlendFunction.ALPHA} bits={5.5}  />
        
       
      </EffectComposer>
    </>
  );
}
// <FilmPass attachArray="passes" args={[0.5, 0.4, 1500, false]} />
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
  
  return (
    <>
      <mesh ref={torusRef}>
        <torusGeometry args={[10, 5, 32, 256]} />
        <lavaMaterial
          ref={shaderRef}
          fogColor={'black'}
          texture1={texture1}
          uvScale ={new THREE.Vector2( 3.0, 1.0 )}
          texture2={texture2}
          key={LavaMaterial.key}
          toneMapped={true}
          fogDensity={0.05 }
          />
      </mesh>
      <Sparkles noise={1}ref={sparkleRef} scale={25} size={10} color="orange" count={50} />
    </>
  )
}

export default function App() {
  return (
    <div style={{padding: '5px', backgroundColor: 'gray',     height: '100%'}}>
      <Canvas 
        camera={{ position: [-20, 20, 20] }}>

      
          <color attach={"background"} args={["black"]} />
          <fog attach="fog" args={["white", 1, 15]} />
          <pointLight position={[-5, 5, 5]} />
        <Lava />
      
        <Stars />
   
        <Effects />
        <OrbitControls />
        
      </Canvas>
    </div>
  )
}
//
//<Stats />

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