import * as THREE from 'three';
import { useRef, useMemo, useEffect } from 'react';
import { getRandomFloat } from '../helper';
// https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance#instancing
export default function ForestInstances({
  count = 10000,
  temp = new THREE.Object3D(),
  treeHeight = 100,
  radius = 150,
  position = [0, 0, 0],
}) {
  const tmpVector = new THREE.Vector3();
  const center = new THREE.Vector3(...position);
  const geometry = new THREE.CylinderGeometry(0.5, 0.5, treeHeight, 4);
  const treeMatrerial = new THREE.MeshStandardMaterial({
    color: 0x006666,
    roughness: 1.0,
    metalness: 0.0,
  });

  const data = useMemo(() => {
    return new Array(count).fill().map((_, i) => ({
      position: [
        getRandomFloat(-radius, radius),
        0,
        getRandomFloat(-radius, radius),
      ],
      scale: getRandomFloat(1, 2,2),
      rotation: getRandomFloat(-0.01,0.01,2),
      center,
      radius,
      tmpVector,
      treeHeight,
      count,
      index: i,
    }));
  }, []);

  //return null;
  const ref = useRef();
  useEffect(() => {
    let position,scale,rotation;
    // Set positions
    for (let i = 0; i < count; i++) {
      position = data[i].position;
      scale = data[i].scale;
      rotation = data[i].rotation;
      

      const currentPosition = tmpVector.set(...position);
      const distance = currentPosition.distanceTo(center);


      const newScale = (scale / distance) * Math.sqrt(distance);


      temp.position.set(position[0], treeHeight / 2*newScale, position[2]);
      
      temp.scale.set(newScale, newScale, newScale);
      //temp.rotation.z = temp.rotation.z + rotation;
      //ref.current.translate(0, treeHeight/2 , 0);

      temp.updateMatrix();
      ref.current.setMatrixAt(i, temp.matrix);
    }
    // Update the instance
    ref.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[geometry, null, count]}>
      <meshStandardMaterial color={'green'} />
    </instancedMesh>
  );
}
