/**
 * Hue and saturation adjustment
 * https://github.com/evanw/glfx.js
 * hue: -1 to 1 (-1 is 180 degrees in the negative direction, 0 is no change, etc.
 * saturation: -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */
/*

*/

import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import glsl from 'babel-plugin-glsl/macro';
/**
 * Hue and saturation adjustment
 * https://github.com/evanw/glfx.js
 * hue: -1 to 1 (-1 is 180 degrees in the negative direction, 0 is no change, etc.
 * saturation: -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */
// This shader is from Bruno Simons Threejs-Journey: https://threejs-journey.xyz
const HueSaturationShader = shaderMaterial(
  {
    'tDiffuse': undefined,
    'hue': 0, // -1 to 1
    'saturation': 0 // -1 to 1
  },
  glsl`
  varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
  glsl`
    uniform sampler2D tDiffuse;
    uniform float hue;
    uniform float saturation;
    varying vec2 vUv;
    void main() {
        gl_FragColor = texture2D( tDiffuse, vUv );
        // hue
        float angle = hue * 3.14159265;
        float s = sin(angle), c = cos(angle);
        vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;
        float len = length(gl_FragColor.rgb);
        gl_FragColor.rgb = vec3(
            dot(gl_FragColor.rgb, weights.xyz),
            dot(gl_FragColor.rgb, weights.zxy),
            dot(gl_FragColor.rgb, weights.yzx)
        );
        // saturation
        float average = (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0;
        if (saturation > 0.0) {
            gl_FragColor.rgb += (average - gl_FragColor.rgb) * (1.0 - 1.0 / (1.001 - saturation));
        } else {
            gl_FragColor.rgb += (average - gl_FragColor.rgb) * (-saturation);
        }
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }`
);

extend({ HueSaturationShader });

export { HueSaturationShader };
