// https://github.com/graywolf2/xr3ngine/blob/ca9685e35bc13d47bf0985eaca9ec34e324b17c0/packages/engine/src/renderer/postprocessing/FXAAEffect.ts
import React, { forwardRef, useMemo, useEffect } from 'react';
import { Uniform } from 'three';
import { Effect, BlendFunction } from 'postprocessing';
import glsl from 'babel-plugin-glsl/macro';
// no impl
// https://github.com/pmndrs/postprocessing/wiki/Custom-Effects
// with impl
// https://github.com/pmndrs/react-postprocessing/blob/master/api.md

// some custom shader code
const fragmentShader = glsl`
//uniform float time;
// defaults https://github.com/pmndrs/postprocessing/blob/75f7acb064f84c6d179817604180389193e981f9/src/materials/glsl/effect.frag
// postporocessing
// https://codesandbox.io/s/github/pmndrs/threejs-journey/tree/main/examples/extra/PostProcessing
// https://codesandbox.io/s/github/pmndrs/threejs-journey/tree/main/examples/extra/PostProcessing?file=/src/customEffects/Displacement.jsx:133-147
// uv normal magic
// https://codesandbox.io/s/react-three-custom-shader-lslhur?file=/src/App.js
// fireflies
// https://codesandbox.io/s/github/pmndrs/threejs-journey/tree/main/examples/extra/Portal?file=/src/App.jsx:425-449
// https://github.com/pmndrs/postprocessing/blob/5ef13d07264edccdb6ac7880fe1dc56ef64dffe6/src/effects/glsl/bokeh.frag
// https://codesandbox.io/s/post-processing-with-r3f-forked-zw8rwv?file=/src/App.tsx
uniform float frequency;
uniform float factor;
//uniform float offset;

void mainUv(inout vec2 uv) {
  //float factor = 1.0; // <-1.5
  vec2 uv1 = uv;
  //float frequency = 6.0;
  float amplitude = 0.015 * factor;
  float x = uv1.y * frequency + time * .7;
  float y = uv1.x * frequency + time * .3;
  uv1.x += cos(x+y) * amplitude * cos(y);
  uv1.y += sin(x-y) * amplitude * cos(y);

  uv = uv1;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
//void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
    // dunno..
    /*
    vec2 aspectCorrection = vec2(1.0, aspect);
    const float depth = 1.;
    float viewZ = perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
		float linearDepth = viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
    */

    // note: there is a difference between vUv and uv..

    /*
    float factor = 1.0; // <-1.5
    vec2 uv1 = vUv;
    float frequency = 6.0;
    float amplitude = 0.015 * factor;
    float x = uv1.y * frequency + time * .7;
    float y = uv1.x * frequency + time * .3;
    uv1.x += cos(x+y) * amplitude * cos(y);
    uv1.y += sin(x-y) * amplitude * cos(y);
    // https://github.com/aguilarmiqueas/car-game/blob/62872b759b9a28c75860347db311561b9a790bce/src/CustomPass.js
    // secrect sauce: inputBuffer.....man this took me hours to find
    vec4 rgba = texture2D(inputBuffer, uv1);
    outputColor = inputColor;rgba;
    */
    outputColor = inputColor;
}`;

const vertexShader = glsl`
varying vec3 vNormal;
/*
varying vec3 vPosition;
void mainSupport() {
  //vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.);
  //gl_Position = projectionMatrix * modelViewPosition;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  //vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
  //vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
}*/


void mainSupport(const in vec2 uv) {
		vUv = uv * vec2(aspect, 1.0) * scale;
}
`;

let _blendFunction;
let _frequency;
let _factor;
//let _time = 0;

// Effect implementation
class WaterEffectImpl extends Effect {
  constructor(frequency, factor) {
    super('WaterEffect', fragmentShader, {
      _blendFunction,
      uniforms: new Map([
        ['frequency', new Uniform(frequency)],
        ['factor', new Uniform(factor)],
        //['offset', new Uniform(0)],
      ]),
      //vertexShader: vertexShader
    });
  }
  // (renderer, writeBuffer, readBuffer, deltaTime, maskActive) {

  // called on each frame
  update(renderer, inputBuffer, deltaTime) {
    this.uniforms.get('frequency').value = _frequency;
    this.uniforms.get('factor').value = _factor;
    //this.uniforms.set('time', { value: _time });
  }
}

// Effect component
export const WaterEffect = forwardRef(
  ({ blendFunction = BlendFunction.NORMAL, frequency = 6.0, factor = 1.0 }, ref) => {
    _blendFunction = blendFunction;
    _frequency = frequency;
    _factor = factor;
    const effect = useMemo(() => {
      return new WaterEffectImpl(frequency,factor);
    }, []);
    return <primitive ref={ref} object={effect} />;
  }
);
