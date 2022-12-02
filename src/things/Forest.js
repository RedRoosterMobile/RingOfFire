import { useRef, useMemo } from 'react';
import { getRandomFloat, randomIntFromInterval } from '../helper';

import * as THREE from 'three';
import { BufferGeometry } from 'three';

// idea:
// have the lagest on in the center (max)
// have the smalles one on the outside

// so scale is dependent on the distance from center

// add more params
export function Forest({ amount = 15, radius = 5, position = [0, 0, 0] }) {
  const center = new THREE.Vector3(...position);
  const tmpVector = new THREE.Vector3();
  const treeGeometry = new THREE.CylinderGeometry( 0.5, 0.5, treeHeight, 4 )
  
  const treeHeight = 10;
  const data = useMemo(() => {
    return new Array(amount).fill().map((_, i) => ({
      position: [
        getRandomFloat(-radius, radius),
        0,
        getRandomFloat(-radius, radius),
      ],
      scale: getRandomFloat(1, 2),
      rotation: [0, Math.PI / getRandomFloat(Math.PI / 1, 2 * Math.PI), 0],
      geometry: new THREE.BoxGeometry(0.5, treeHeight, 0.5),
      //geometry: treeGeometry.clone(),
      center,
      radius,
      tmpVector,
      treeHeight,
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
  const { scale, geometry, position, center, radius, tmpVector, treeHeight } =
    props;

  geometry.translate(0, treeHeight / 2, 0);
  const currentPosition = tmpVector.set(...position);
  const distance = currentPosition.distanceTo(center);
  //Math.log(radius);
  // TODO: find different functions
  // with slower falloff

  // https://briansharpe.wordpress.com/2011/11/14/two-useful-interpolation-functions-for-noise-development/#
  // center big, strong falloff
  //const newScale = scale/distance*radius/5;
  const newScale = (scale / distance) *Math.sqrt(distance);
  //const newScale = scale/distance*Math.log(radius)/2;
  //console.log(geometry.boundingSphere);
  //const newScale = ((scale / distance) * Math.log(radius)) / Math.sqrt(radius);
  //position[1] += newScale / 2 ;
  return (
    <group {...props} scale={newScale} dispose={null}>
      <mesh castShadow geometry={geometry}>
        <meshStandardMaterial
          attach="material"
          color="green"
          roughness={1.0}
          metalness={0.0}
          position={[0, 0, 0]}
        />
      </mesh>
    </group>
  );
}

export default Forest;
