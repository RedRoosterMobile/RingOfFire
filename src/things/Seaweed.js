import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { getRandomFloat, randomIntFromInterval } from '../helper';

const MODEL = '/models/good/seaweed.obj';

/**
 * 
 * idea:
 * add a custom center and x,y range
 * so we can make things like tall in the middle and small on the outside
 * by calculating the distance from the center
 * 
 */
export function Seaweed({ amount = 30 }) {
  const geom = useMemo(() => useLoader(OBJLoader, MODEL).children[0].geometry, [])
  
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
