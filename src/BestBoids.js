import { useRef, useMemo,useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from "three";
import Boid from "./libs/Boid";
import FishGeometry from "./libs/FishGeometry";



const MODEL = '/models/good/seaweed.obj';
function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function getRandomFloat(min, max, decimals) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}
// add more params

/**
 * 
 * idea:
 * add a custom center and x,y range
 * so we can make things like tall in the middle and small on the outside
 * by calculating the distance from the center
 * 
 */
export function BestBoids({ fishNum = 100 }) {
  const groupRef= useRef();
  // 魚群を作成
  const fishes = [];
  const boids = [];
  //const fishNum = 100;
  const geometry = new FishGeometry(1);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  for (var i = 0; i < fishNum; i++) {
    boids[i] = new Boid(4, 0.05);
    const boid = boids[i];
    boid.position.x = Math.random() * 400 - 200;
    boid.position.y = Math.random() * 400 - 200;
    boid.position.z = Math.random() * 400 - 200;
    boid.velocity.x = Math.random() * 2 - 1;
    boid.velocity.y = Math.random() * 2 - 1;
    boid.velocity.z = Math.random() * 2 - 1;
    boid.setAvoidWalls(true);
    boid.setWorldSize(500, 500, 400);
    fishes[i]=(<mesh material={material} geometry={geometry} key={i} position={[boid.position.x,boid.position.y,boid.position.z]} />);
  }
  useFrame(()=>{
    
    for (let i = 0; i < boids.length; i++) {
      const boid = boids[i];
      boid.run(boids);
      console.log();
      
      
      const fish = groupRef.current.children[i];

      fish.position.copy(boids[i].position);

      fish.rotation.y = Math.atan2(-boid.velocity.z, boid.velocity.x);
      fish.rotation.z = Math.asin(boid.velocity.y / boid.velocity.length());
      
    }
  });
  return <group ref={groupRef}>{fishes}</group>;
  //return fishes;


    //fishes[i] = new THREE.Mesh(geometry, material);

    //scene.add(fishes[i]);
  

  const data = useMemo(() => {
    return new Array(amount).fill().map((_, i) => ({
      x: randomIntFromInterval(-128, 0),
      y: 0,
      z: randomIntFromInterval(-128, 0),
      scale: getRandomFloat(1.4, 2),
      rotation: [0, Math.PI / getRandomFloat(Math.PI / 1, 2 * Math.PI), 0],
      geometry: geom,
      elevationOffsetMultiplier: randomIntFromInterval(2, 5),
      timeFrequency: randomIntFromInterval(22, 44) / 10000,
    }));
  }, [geom]);

  return data.map((props, i) => (
    <WobbleSeaweed key={i} {...props} position={[props.x, props.y, props.z]} />
  ));
}
function aFish() {
function tick() {
      for (let i = 0; i < boids.length; i++) {
        const boid = boids[i];
        boid.run(boids);

        const fish = fishes[i];
        fish.position.copy(boids[i].position);

        fish.rotation.y = Math.atan2(-boid.velocity.z, boid.velocity.x);
        fish.rotation.z = Math.asin(boid.velocity.y / boid.velocity.length());
      }

      // カメラコントローラーを更新
      controls.update();

      // レンダリング
      renderer.render(scene, camera);

      requestAnimationFrame(tick);
    }
}

/**
 *
 * @param {number} scale
 * @param {BufferGeometry} geometry
 * @param {number} elevationOffsetMultiplier 3.0
 * @param {number} timeFrequency 0.0002
 * @param {Vector3} position [0,0,0]
 * @returns
 */
export function WobbleSeaweed(props) {
  const {
    scale,
    geometry,
    elevationOffsetMultiplier,
    timeFrequency,
    rotation,
  } = props;
  const uTime = useRef({ value: 0.0 });
  // Update cactus time uniform
  useFrame(
    ({ clock }) =>
      (uTime.current.value = clock.elapsedTime * 1000 + timeFrequency)
  );
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        geometry={geometry}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={1}
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
          //float timeFrequency = 0.002;
          float timeFrequency = ${parseFloat(timeFrequency).toFixed(5)};
          //float elevationOffsetMultiplier = 3.0;
          float elevationOffsetMultiplier = ${parseFloat(
            elevationOffsetMultiplier
          ).toFixed(1)};

          vec2 transformedRotated = rotate(transformed.xz, sin(uTime * timeFrequency + transformed.z * elevationOffsetMultiplier) * log(abs(transformed.z) + 1.0) * angleMultiplier);
          transformed.xz = transformedRotated;
        `
            );
          }}
          color="green"
          opacity={0.9}
          transparent={true}
          roughness={1.0}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
}
