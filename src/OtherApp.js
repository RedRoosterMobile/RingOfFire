import { useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { WaveMaterial } from './WaveMaterial'
import { LavaMaterial } from './LavaMaterial'
import { useTexture, shaderMaterial, OrbitControls, Stats } from "@react-three/drei"

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

// https://onion2k.github.io/r3f-by-example/examples/materials/glowing-torus/
function Lava() {
  console.log('test');
  const shaderRef = useRef();
  const torusRef = useRef();
  const { width, height } = useThree((state) => state.viewport)
  const [texture1,texture2] = useTexture(["/textures/cloud.png","/textures/lavatile.jpg"])

  // repeat textures mirrored
  texture1.wrapS = texture1.wrapT = THREE.MirroredRepeatWrapping;
  texture2.wrapS = texture2.wrapT = THREE.MirroredRepeatWrapping;
 
  useFrame((state, delta) => (shaderRef.current.time += delta))
  /*
  uniforms = {

    'fogDensity': { value: 0.45 },
    'fogColor': { value: new THREE.Vector3( 0, 0, 0 ) },
    'time': { value: 1.0 },
    'uvScale': { value: new THREE.Vector2( 3.0, 1.0 ) },
    'texture1': { value: textureLoader.load( 'textures/lava/cloud.png' ) },
    'texture2': { value: textureLoader.load( 'textures/lava/lavatile.jpg' ) }
  };
  */
  return (
    <mesh scale={[width, height, 1]} ref={torusRef}>
      <planeGeometry />
      <lavaMaterial
        ref={shaderRef}
        fogColor={'black'}
        texture1={texture1}
        uvScale ={[3.0,1.0]}
        texture2={texture2}
        key={LavaMaterial.key}
        toneMapped={true}
        fogDensity={0.05 }
        />
    </mesh>
  )
}

/*
<meshPhongMaterial attach="material" color={"green"} />
 <torusGeometry args={[10, 6, 32, 256]} />
*/
export default function OtherApp() {
  return (
    <div style={{padding: '5px', backgroundColor: 'gray',     height: '100%'}}>
      <Canvas 
     >
        
        <Lava />
    
        <Stats />
      </Canvas>
    </div>
  )
}
// <ShaderPlane />

/*
<Canvas 
>
   
   <Lava />

   <Stats />
 </Canvas>


<mesh scale={[width, height, 1]} ref={torusRef}>
      <planeGeometry />
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
 */