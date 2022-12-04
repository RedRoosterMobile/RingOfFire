import * as THREE from 'three';
import { useRef, useMemo, useEffect } from 'react';
import { getRandomFloat } from '../helper';
// https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance#instancing
export default function ForestInstances({
  count = 10000,
  temp = new THREE.Object3D(),
  treeHeight = 10,
  radius = 80,
  position = [0, 0, 0],
}) {
  const tmpVector = new THREE.Vector3();
  const center = new THREE.Vector3(...position);
  const geometry = new THREE.CylinderGeometry(0.5, 0.5, treeHeight, 8);
  const treeMatrerial = new THREE.MeshStandardMaterial({
    color: 0x006666,
    roughness: 1.0,
    metalness: 0.0,
  });
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
