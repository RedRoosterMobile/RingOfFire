// https://github.com/graywolf2/xr3ngine/blob/ca9685e35bc13d47bf0985eaca9ec34e324b17c0/packages/engine/src/renderer/postprocessing/FXAAEffect.ts
import React, { forwardRef, useMemo, useEffect } from 'react';
import { Uniform, Texture } from 'three';
import { Effect, BlendFunction } from 'postprocessing';
import glsl from 'babel-plugin-glsl/macro';
// no impl
// https://github.com/pmndrs/postprocessing/wiki/Custom-Effects
// with impl
// https://github.com/pmndrs/react-postprocessing/blob/master/api.md

// some custom shader code
const fragmentShader = glsl`
uniform float time;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    //vec2 vUv = uv.xy;
    float factor=1.5;
    vec2 uv1 = uv;
    float frequency = 6.0;
    float amplitude = 0.015 * factor;
    float x = uv1.y * frequency + time * .7;
    float y = uv1.x * frequency + time * .3;
    uv1.x += cos(x+y) * amplitude * cos(y);
    uv1.y += sin(x-y) * amplitude * cos(y);
    // https://github.com/aguilarmiqueas/car-game/blob/62872b759b9a28c75860347db311561b9a790bce/src/CustomPass.js
    // secrect sauce: inputBuffer.....man this took me hours to find
    vec4 rgba = texture2D(inputBuffer, uv1);
    outputColor= rgba;
    //outputColor = inputColor;
}`;
const vertexShader = `
void mainSupport(const in vec2 uv);
// or 
void mainSupport();
`;

let _blendFunction;
let _time = 0;

// Effect implementation
class WaterEffectImpl extends Effect {
  constructor({} = {}) {
    super('WaterEffect', fragmentShader, {
      _blendFunction,
      uniforms: new Map([
        ['time', new Uniform(_time)]
      ]),
    });
  }
  // (renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
  update(renderer, inputBuffer, deltaTime) {
    _time += deltaTime;
    this.uniforms.set('time', { value: _time });
  }
}

// Effect component
export const WaterEffect = forwardRef(
  ({ blendFunction = BlendFunction.NORMAL }, ref) => {
    _blendFunction = blendFunction;
    const effect = useMemo(() => {
      return new WaterEffectImpl();
    }, []);
    return <primitive ref={ref} object={effect} />;
  }
);
