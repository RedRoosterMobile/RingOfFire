import { useRef, useMemo } from 'react';
import { getRandomFloat } from '../helper';

import * as THREE from 'three';
import { BufferGeometry, Matrix4 } from 'three';
import { useFrame } from '@react-three/fiber';

// idea:
// have the lagest on in the center (max)
// have the smalles one on the outside
// so scale is dependent on the distance from center

export function Forest({ amount = 15, radius = 5, position = [0, 0, 0] }) {
  const center = new THREE.Vector3(...position);
  const tmpVector = new THREE.Vector3();
  const treeGeometry = new THREE.CylinderGeometry(0.5, 0.5, treeHeight, 4);
  const treeMatrerial = new THREE.MeshStandardMaterial({
    color: 0x006666,
    roughness: 1.0,
    metalness: 0.0,
  });

  const treeHeight = 10;
  const data = useMemo(() => {
    return new Array(amount).fill().map((_, i) => ({
      position: [
        getRandomFloat(-radius, radius),
        0,
        getRandomFloat(-radius, radius),
      ],
      scale: getRandomFloat(1, 2),
      //rotation: [0, Math.PI / getRandomFloat(Math.PI / 1, 2 * Math.PI), 0],
      //geometry: new THREE.BoxGeometry(0.5, treeHeight, 0.5),
      geometry: new THREE.CylinderGeometry(0.5, 0.5, treeHeight, 32),
      //geometry: treeGeometry,
      material: treeMatrerial,
      center,
      radius,
      tmpVector,
      treeHeight,
      amount,
      index: i,
    }));
  }, []);

  return data.map((props, i) => <Tree key={i} {...props} />);
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
export function Tree(props) {
  const {
    scale,
    geometry,
    material,
    position,
    center,
    radius,
    tmpVector,
    treeHeight,
    amount,
    index,
  } = props;
  const group = useRef(null);
  geometry.translate(0, treeHeight / 2, 0);

  const currentPosition = tmpVector.set(...position);
  const distance = currentPosition.distanceTo(center);
  //Math.log(radius);
  // TODO: find different functions
  // with slower falloff

  // https://briansharpe.wordpress.com/2011/11/14/two-useful-interpolation-functions-for-noise-development/#
  // center big, strong falloff
  //const newScale = scale/distance*radius/5;
  const newScale = (scale / distance) * Math.sqrt(distance);
  //const newScale = scale/distance*Math.log(radius)/2;
  //console.log(geometry.boundingSphere);
  //const newScale = ((scale / distance) * Math.log(radius)) / Math.sqrt(radius);
  //position[1] += newScale / 2 ;
  let roti = 0;
  useFrame((_, delta) => {
    roti += delta;
    //console.log(group.current.rotation.z);
    //group.current.rotation.z = group.current.rotation.z + 0.01;
    //group.current.rotation.x = group.current.rotation.x - 0.05;
  });
  const onUpdate = (iMesh) => {
    iMesh.updateMatrix();
    // make it visible
    iMesh.setMatrixAt(index, new Matrix4());
  };

  return (
    <group {...props} scale={newScale} ref={group} dispose={null}>
      <mesh
        castShadow
        geometry={geometry}
        material={material}
        //rotation={[0, 0, getRandomFloat(-5, +5)]}
      ></mesh>
    </group>
  );
}
/*
 <instancedMesh
        {...props}
        scale={newScale}
        ref={group}
        //rotation={[0, 0, getRandomFloat(-5, +5)]}
        castShadow
        args={[geometry, material, amount]}
        onUpdate={onUpdate}
      />
*/

export default Forest;
