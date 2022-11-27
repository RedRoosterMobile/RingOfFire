import React, { useRef, useEffect, useMemo } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  Color,
  MeshStandardMaterial,
  SphereGeometry,
  ShaderMaterial,
  BackSide,
} from 'three';

export function PurpleSky({
  topColor = 0x11e8bb,
  bottomColor = 0x8200c9,
  offset = 0.5,
  exponent = 1.0,
  brightness = 1.0,
  position = [0, 0, 0],
  size= 4000
}) {
  const uniforms = {
    topColor: { value: new Color(topColor) },
    bottomColor: { value: new Color(bottomColor) },
    offset: { value: offset },
    exponent: { value: exponent },
    brightness: { value: brightness },
  };
  const skyGeo = new SphereGeometry(size, 32, 15);
  const skyMat = new ShaderMaterial({
    uniforms: uniforms,
    vertexShader: `
        varying vec3 vWorldPosition;
  
        void main() {
            vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
        `,
    fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        uniform float brightness;

        varying vec3 vWorldPosition;

        void main() {
            float h = normalize( vWorldPosition ).y + offset;
            gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h, 0.0 ), exponent ), 0.0 ) ), 1.0 );
            gl_FragColor=gl_FragColor*vec4(brightness,brightness,brightness,1.);
        }
        `,
    side: BackSide,
  });

  return <mesh position={position} material={skyMat} geometry={skyGeo} />;
}
