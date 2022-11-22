import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
// make this a group and place them randomly on the terrain
/*
function Sphere({ geometry, x, y, z, s }) {
  const ref = useRef();
  // make em wobble https://tympanus.net/codrops/2021/01/26/twisted-colorful-spheres-with-three-js/


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

*/
function Sphere({ geometry, x, y, z, s }) {
  const ref = useRef();
  // make em wobble https://tympanus.net/codrops/2021/01/26/twisted-colorful-spheres-with-three-js/
  console.log('creating sphere at', x, y, z, s);

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
      <meshStandardMaterial color={'red'} metalness={0.1} roughness={1} />
    </mesh>
  );
}
function Sphere2({ geometry, x, y, z, s }) {
  console.log(geometry);
  return (
    <mesh
      position={[0, 0, 0]}
      scale={10}
      rotation={[0, 0, 0]}
      geometry={geometry}
      castShadow
    >
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


function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}
export function RandomCacti() {
  //const { nodes, materials } = useGLTF('/models/level.glb');
  //const [geometry] = useState(() => new THREE.SphereGeometry(20, 32, 32), []);
  const [geometry] = useState(
    () =>
      new THREE.SphereGeometry(0.11, 16, 16, Math.PI / 2, Math.PI, 0, Math.PI),
    []
  );
  // kinda like a jellyfish. Somehow cut it off with bolean operation https://github.com/looeee/threejs-csg
  // https://github.com/pmndrs/react-three-csg
  //const [geometry] = useState(() => new THREE.SphereGeometry(0.11,16,16, Math.PI/2,  Math.PI, 0, Math.PI), []);

  // turnn then into a compound body
  // https://codesandbox.io/s/r3f-ibl-envmap-simple-forked-hzlrej?file=/src/Scene.js:797-800
  const { nodes, materials } = useGLTF('/models/level.glb');
  const data = useMemo(() => {
    return new Array(15).fill().map((_, i) => ({
      x: randomIntFromInterval(-512,512),
      y: 7,
      z: randomIntFromInterval(-512,512),
      scale: Math.random() * 10 +10,
      geometry: nodes.Cactus.geometry,
      animationOffset: 5,
    }));
  }, []);
  
  return data.map((props, i) => (
    <CactusMesh key={i} {...props} position={[props.x, props.y, props.z]}  />
  ));
}

export function CactusMesh(props) {
  const {scale,geometry,animationOffset} = props;
  const uTime = useRef({ value: animationOffset*scale });
  
  // Update cactus time uniform
  useFrame(({ clock }) => (uTime.current.value = clock.elapsedTime * 1000));
  return (
    <group  {...props} dispose={null}>
      <mesh
        castShadow
        geometry={geometry}
        scale={scale}
        position={[0, -7/props.scale, 0]}
        
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          attach="material"
          onBeforeCompile={(shader) => {
            shader.uniforms.uTime = uTime.current;
            

            shader.vertexShader = shader.vertexShader.replace(
              '#include <common>',
              `
          #include <common>
          uniform float uTime;

          vec2 rotate(vec2 v, float a) {
            float s = sin(a);
            float c = cos(a);
            mat2 m = mat2(c, -s, s, c);
            return m * v;
          }
        `
            );

            shader.vertexShader = shader.vertexShader.replace(
              '#include <begin_vertex>',
              `
          #include <begin_vertex>
          float angleMultiplier = 0.25;
          float timeFrequency = 0.002;
          float elevationOffsetMultiplier = 3.0;

          vec2 transformedRotated = rotate(transformed.xz, sin(uTime * timeFrequency + transformed.z * elevationOffsetMultiplier) * log(abs(transformed.z) + 1.0) * angleMultiplier);
          transformed.xz = transformedRotated;
        `
            );
          }}
          color="green"
          transparent
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
}

export default CactusMesh;
