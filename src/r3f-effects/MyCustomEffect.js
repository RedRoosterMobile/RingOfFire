// https://github.com/graywolf2/xr3ngine/blob/ca9685e35bc13d47bf0985eaca9ec34e324b17c0/packages/engine/src/renderer/postprocessing/FXAAEffect.ts
import React, { forwardRef, useMemo, useEffect } from 'react';
import {
  Uniform,
  Vector3,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { Effect, BlendFunction } from 'postprocessing';
import glsl from 'babel-plugin-glsl/macro';
// no impl
// https://github.com/pmndrs/postprocessing/wiki/Custom-Effects
// with impl
// https://github.com/pmndrs/react-postprocessing/blob/master/api.md

// some custom shader code
const fragmentShader = glsl`
uniform float param2;
uniform float time;
uniform vec3 weights;
#define tau 6.2831853
float random (in vec2 _st) {
            return fract(sin(dot(_st.xy,
                                vec2(12.9898*sin(time),78.233)))*
                43758.5453123);
        }
float noise (in vec2 _st) {
            vec2 i = floor(_st);
            vec2 f = fract(_st);

            // Four corners in 2D of a tile
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));

            vec2 u = f * f * (3.0 - 2.0 * f);

            return mix(a, b, u.x) +
                    (c - a)* u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
        }
mat2 makem2(in float theta){float c = cos(theta);float s = sin(theta);return mat2(c,-s,s,c);}
float fbm(in vec2 p)
{	
	float z=2.;
	float rz = 0.;
	vec2 bp = p;
	for (float i= 1.;i < 6.;i++)
	{
		rz+= abs((noise(p)-0.5)*2.)/z;
		z = z*2.;
		p = p*2.;
	}
	return rz;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	outputColor = vec4(inputColor.rgb * weights, inputColor.a * fbm(uv));
}`;
const vertexShader = `
void mainSupport(const in vec2 uv);
// or 
void mainSupport();
`;

let _uWeights;
let _uBlendMode;
let _uParam2;
let _time = 0;

// Effect implementation
class MyCustomEffectImpl extends Effect {
  constructor({} = {}) {
    super('MyCustomEffect', fragmentShader, {
      _uBlendMode,
      uniforms: new Map([
        [
          'weights',
          new Uniform(new Vector3(_uWeights[0], _uWeights[1], _uWeights[2])),
        ],
        ['param2', new Uniform(_uParam2)],
        ['time', new Uniform(_time)],
      ]),
    });
  }

  update(renderer, inputBuffer, deltaTime) {
    
    _time += deltaTime;
    this.uniforms.set('time', { value: _time });
    let zeroToOne = Math.sin(_time) * 0.5 + 0.5;
    // red
    this.uniforms.get('weights').value.x = parseFloat(zeroToOne);
    // probably not needed
    //this.blendMode = _uBlendMode;
    // *needed?
    super.update(renderer, inputBuffer, deltaTime);
  }
}

// Effect component
export const MyCustomEffect = forwardRef(
  ({ weights, param2, blendFunction = BlendFunction.NORMAL }, ref) => {
    console.log('dfdf', weights);
    //WTF is wrong here with this fucking scope bullshit<111
    // i can't pass params to constructor, why the fuck not!!!
    _uWeights = weights; //new Uniform(new Vector3(weights[0],weights[1],weights[2]));
    _uBlendMode = blendFunction;
    _uParam2 = param2;
    //_uParam2 = param2;
    const effect = useMemo(() => {
      console.log('memo');
      console.log(weights[0]);
      _uWeights = weights; //new Uniform(new Vector3(weights[0],weights[1],weights[2]));
      _uBlendMode = blendFunction;
      return new MyCustomEffectImpl();
    }, [weights, param2, blendFunction]);
    useEffect(() => {
      console.log('sth changed');
    }, [weights, param2, blendFunction]);
    return <primitive ref={ref} object={effect} />;
  }
);
