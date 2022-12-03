import * as THREE from 'three';
import { useRef, useMemo, useEffect } from 'react';
// https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance#instancing
export default function InstancesExample({
  count = 10,
  geometry,
  temp = new THREE.Object3D(),
}) {
  //return null;
  const ref = useRef();
  useEffect(() => {
    // Set positions
    for (let i = 0; i < count; i++) {

      temp.position.set(Math.random()*10, Math.random()*10, Math.random()*10);
      temp.rotation.z = temp.rotation.z + 0.01;

      //temp.translate(0, treeHeight / 2, 0);

      temp.updateMatrix();
      ref.current.setMatrixAt(i, temp.matrix);
    }
    // Update the instance
    ref.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[geometry, null, count]}>
      <meshStandardMaterial />
    </instancedMesh>
  );
}
