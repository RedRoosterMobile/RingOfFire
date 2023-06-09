import * as THREE from 'three';
import { useRef, useMemo, useEffect } from 'react';
import { getRandomFloat, randomIntFromInterval } from '../helper';
import { useFrame } from '@react-three/fiber';
// https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance#instancing
export default function ForestInstances({
  count = 10000,
  temp = new THREE.Object3D(),
  treeHeight = 10,
  radius = 80,
  position = [0, 0, 0],
}) {
  const uTime = useRef({ value: 0.0 });
  const elevationOffsetMultiplier = getRandomFloat(2, 5, 5);
  const timeFrequency = randomIntFromInterval(22, 44) / 10000;
  // Update cactus time uniform
  useFrame(
    ({ clock }) =>
      (uTime.current.value = clock.elapsedTime * 1000 + timeFrequency)
  );
  const tmpVector = new THREE.Vector3();
  const center = new THREE.Vector3(...position);
  const geometry = new THREE.CylinderGeometry(0.5, 0.5, treeHeight, 8);
  const treeMatrerial = new THREE.MeshStandardMaterial({
    color: 0x006666,
    roughness: 1.0,
    metalness: 0.0,
    onBeforeCompile: (shader) => {
      console.log('compiling shader', shader);
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
        float angleMultiplier = 0.65;
        float timeFrequency = 0.02;
        float elevationOffsetMultiplier = 7.0;

        //vec2 transformedRotated = rotate(transformed.xz, sin(uTime * timeFrequency + transformed.z * elevationOffsetMultiplier) * log(abs(transformed.z) + 1.0) * angleMultiplier);
        //transformed.xz = transformedRotated;
        transformed.y =  transformed.y + sin(uTime/300.)*1.5;
      `
      );
    },
  });
  console.log(treeMatrerial);
  // https://www.youtube.com/watch?v=604lmtHhcQs

  const data = useMemo(() => {
    return new Array(count).fill().map((_, i) => ({
      position: [
        getRandomFloat(-radius, radius, 2),
        0,
        getRandomFloat(-radius, radius, 2),
      ],
      scale: getRandomFloat(1, 2, 2),
      rotation: getRandomFloat(-0.01, 0.01, 2),
    }));
  }, []);
  const ref = useRef();
  const Centrist = () => {
    let position, scale, rotation;
    // Set positions
    for (let i = 0; i < count; i++) {
      position = data[i].position;
      scale = data[i].scale;
      rotation = data[i].rotation;

      const currentPosition = tmpVector.set(...position);
      const distance = currentPosition.distanceTo(center);

      let maxDistancePoint = tmpVector.set(...[radius, 0, radius]);
      const maxDistance = maxDistancePoint.distanceTo(center);

      // falloff function
      //const newScale = (scale / distance) * Math.sqrt(distance);
      // slow falloff
      const newScale = scale - (scale * distance) / maxDistance;

      temp.position.set(position[0], 0, position[2]);
      temp.translateY((treeHeight / 2) * newScale);

      temp.scale.set(newScale, newScale, newScale);
      temp.rotation.z = temp.rotation.z + rotation;

      temp.updateMatrix();
      ref.current.setMatrixAt(i, temp.matrix);
    }
    // Update the instance
    ref.current.instanceMatrix.needsUpdate = true;
  };

  useEffect(Centrist, []);
  return (
    <instancedMesh
      castShadow
      ref={ref}
      args={[geometry, treeMatrerial, count]}
    />
  );
}
