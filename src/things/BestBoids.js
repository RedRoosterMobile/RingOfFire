import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';
import Boid from './best-boids-lib/Boid';
import FishGeometry from './best-boids-lib/FishGeometry';
import { Vector3 } from 'three';

const MODEL = '/models/good/seaweed.obj';

/**
 *
 * https://codesandbox.io/s/fish-school-boid-forked-5vjd7u?file=/src/components/Canvas.tsx
 */
export function BestBoids(props) {
  const groupRef = useRef();
  // 魚群を作成

  const fishNum = 200;
  const boids = [];
  const fishes = [];
  const filledFish = useMemo(() => {
    const geometry = new FishGeometry(2);

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.3,
    });

    const offset = new Vector3(...(props.position || [0, 0, 0]));

    for (let i = 0; i < fishNum; i++) {
      boids[i] = new Boid(0.38, 0.3);
      const boid = boids[i];
      boid.position.x = Math.random() * 400 - 200 + offset.x;
      boid.position.y = Math.random() * 400 - 200 + offset.y;
      boid.position.z = Math.random() * 400 - 200 + offset.z;
      boid.velocity.x = Math.random() * 2 - 1;
      boid.velocity.y = Math.random() * 2 - 1;
      boid.velocity.z = Math.random() * 2 - 1;
      boid.setAvoidWalls(true);
      // a bit wider on the plane to make them go away and come back
      boid.setWorldSize(256, 256, 256);

      fishes[i] = (
        <mesh
          material={material}
          geometry={geometry}
          key={i}
          position={[boid.position.x, boid.position.y, boid.position.z]}
        />
      );
    }
    return fishes;
  }, [fishes]);

  useFrame(() => {
    for (let i = 0; i < boids.length; i++) {
      const boid = boids[i];
      boid.run(boids);
      const fish = groupRef.current.children[i];
      fish.position.copy(boids[i].position);
      fish.rotation.y = Math.atan2(-boid.velocity.z, boid.velocity.x);
      fish.rotation.z = Math.asin(boid.velocity.y / boid.velocity.length());
    }
  });
  return <group ref={groupRef}>{filledFish}</group>;

}