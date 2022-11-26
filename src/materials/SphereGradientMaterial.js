import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import glsl from 'babel-plugin-glsl/macro';

const SphereGradientMaterial = shaderMaterial(
  {
    topColor: new THREE.Color(0x11e8bb),
    bottomColor: new THREE.Color(0x8200c9),
    offset: 0.5,
    exponent: 1.0,
  },
  glsl`
    varying vec3 vWorldPosition;

    void main() {
        vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  glsl`
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    uniform float brightness;

    varying vec3 vWorldPosition;

    void main() {

      float h = normalize( vWorldPosition ).y + offset;
      vec4 beforeDark = vec4( mix( bottomColor, topColor, max( pow( max( h, 0.0 ), exponent ), 0.0 ) ), 1.0 );
      gl_FragColor = beforeDark * vec4(vec3(brightness,brightness,brightness),1.);

    }`
);

extend({ SphereGradientMaterial });

export { SphereGradientMaterial };
