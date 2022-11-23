import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const MODEL = '/models/good/rock.obj';
function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomFloat(min, max, decimals = 2) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}
// add more params
export function Rocks({ amount = 25 }) {
  const geom = useMemo(
    () => useLoader(OBJLoader, MODEL).children[0].geometry,
    []
  );
  const data = useMemo(() => {
    return new Array(amount).fill().map((_, i) => ({
      x: randomIntFromInterval(-128, 128),
      y: 0-3,
      z: randomIntFromInterval(-128, 128),
      scale: getRandomFloat(2,3),
      rotation: [0,  getRandomFloat(Math.PI / 1, 2 * Math.PI), 0],
      geometry: geom,
      elevationOffsetMultiplier: randomIntFromInterval(2, 5),
      timeFrequency: randomIntFromInterval(22, 44) / 10000,
    }));
  }, [geom]);

  return data.map((props, i) => (
    <ARock key={i} {...props} position={[props.x, props.y, props.z]} />
  ));
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
export function ARock(props) {
  const { scale, geometry, rotation } = props;
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        geometry={geometry}
        scale={scale}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="darkgrey"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}
