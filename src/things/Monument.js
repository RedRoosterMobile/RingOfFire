import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { rgbTo01, randomIntFromInterval, getRandomFloat } from '../helper';

const MODEL = '/models/good/Monument.obj';

// add more params
export function Monument({ amount = 25 }) {
  const geom = useMemo(
    () => useLoader(OBJLoader, MODEL).children[0].geometry,
    []
  );

  const data = useMemo(() => {
    return new Array(amount).fill().map((_, i) => ({
      x: randomIntFromInterval(-128, 128),
      y: -10,
      z: randomIntFromInterval(-128, 128),
      scale: 2,
      rotation: [0, Math.PI / getRandomFloat(Math.PI / 1, 2 * Math.PI), 0],
      geometry: geom,
      elevationOffsetMultiplier: randomIntFromInterval(2, 5),
      timeFrequency: randomIntFromInterval(22, 44) / 10000,
    }));
  }, [geom]);

  return data.map((props, i) => (
    <AMonument key={i} {...props} position={[props.x, props.y, props.z]} />
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
export function AMonument(props) {
  const { scale, geometry, rotation } = props;
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        geometry={geometry}
        scale={scale}
        position={[0, 10 / scale, 0]}
      >
        <meshStandardMaterial
          attach="material"
          toneMapped={false}
          emissive={true}
          color={rgbTo01(255 * 1, 215, 0)}
          roughness={0.3}
          metalness={1.0}
          // sth with spripes
          //roughnessMap=
        />
      </mesh>
    </group>
  );
}
