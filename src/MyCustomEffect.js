// https://github.com/graywolf2/xr3ngine/blob/ca9685e35bc13d47bf0985eaca9ec34e324b17c0/packages/engine/src/renderer/postprocessing/FXAAEffect.ts
import React, { forwardRef, useMemo } from 'react';
import {
  Uniform,
  Vector3,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { Effect, BlendFunction } from 'postprocessing';
import glsl from 'babel-plugin-glsl/macro';
// https://github.com/pmndrs/postprocessing/wiki/Custom-Effects

// some custom shader code
const fragmentShader = glsl`

uniform vec3 weights;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	outputColor = vec4(inputColor.rgb * weights, inputColor.a);
}
`;
const vertexShader = `
void mainSupport(const in vec2 uv);
// or 
void mainSupport();
`;

let _uWeights;
let _uBlendMode;
let _uParam2;

// Effect implementation
class MyCustomEffectImpl extends Effect {
  constructor({
  } = {}) {
    super('MyCustomEffect', fragmentShader, {
      _uBlendMode,
      uniforms: new Map([
        ['weights', new Uniform(new Vector3(_uWeights[0],_uWeights[1],_uWeights[2]))]
      ]),
    });

    //_uWeights = new Uniform(new Vector3(weights[0],weights[1],weights[3]));
    //_uParam2 = param2;
  }

  update(renderer, inputBuffer, deltaTime) {
    //console.log(this.uniforms.get('weights').value.x); //= new Uniform(new Vector3(_uWeights[0],_uWeights[1],_uWeights[3]));
    //this.uniforms.get('param2').value = _uParam2;
  }
}

// Effect component
export const MyCustomEffect = forwardRef(({ weights, param2, blendFunction=BlendFunction.NORMAL }, ref) => {
  console.log('dfdf', weights);
  //WTF is wrong here with this fucking scope bullshit<111
  // i can't pass params to constructor, why the fuck not!!!
  _uWeights = weights;//new Uniform(new Vector3(weights[0],weights[1],weights[2]));
  _uBlendMode = blendFunction;
    //_uParam2 = param2;
  const effect = useMemo(
    () => {
      console.log('memo');
      console.log(weights[0]);
      _uWeights = weights;//new Uniform(new Vector3(weights[0],weights[1],weights[2]));
      _uBlendMode = blendFunction;
      return new MyCustomEffectImpl();
    },
    [ weights, param2, blendFunction]
  );
  return <primitive ref={ref} object={effect} />;
});
