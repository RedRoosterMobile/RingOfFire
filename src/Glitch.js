/*@drcmda, I'm happy to announce that I made it work!

I made the required changes to readme as well, with the new component

Quick preview:
Peek 2020-05-06 01-24

Everything works fine:

it doesn't take over the render loop
uses postprocessing library
CodeSandbox is here

code from Glitch:
*/
import * as THREE from 'three';
import glsl from 'babel-plugin-glsl/macro';
import React, { useRef, useMemo, useEffect } from 'react';
import { extend, useThree, useFrame, ShaderMaterial } from '@react-three/fiber';
// @ts-ignore
import {
  GlitchEffect,
  RenderPass,
  EffectComposer,
  EffectPass,
  NormalPass,
  ShaderPass,
  BloomEffect
  
} from 'postprocessing';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { HalfFloatType, Vector2 } from 'three';
// another way of doing passes!
// https://codesandbox.io/s/threejs-journey-level-1-forked-9slqpf?file=/src/Tint.js:2156-2165

const uniforms = {
  tex: { value: null },
  time: { value: 0.0 },
  factor: { value: 1.0 },
  resolution: { value: new Vector2() }, // 64,64
};

const Glitch = (glitchEffectProps) => {
  const { gl, scene, camera, size } = useThree();

  const composer = useMemo(() => {
    const effectComposer = new EffectComposer(gl, {
      frameBufferType: HalfFloatType,
    });
    
    effectComposer.addPass(new RenderPass(scene, camera));

    const normalPass = new NormalPass(scene, camera);

    effectComposer.addPass(normalPass);

    //const glitchEffect = new GlitchEffect(glitchEffectProps);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        ...uniforms,
      },
      vertexShader:
        'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
      fragmentShader: glsl`
      uniform float time;
      uniform float factor;
      uniform vec2 resolution;
      uniform sampler2D tex;
      varying vec2 vUv;
      void main() {
          vec2 uv1 = vUv;
          vec2 uv = gl_FragCoord.xy/resolution.xy;
          float frequency = 6.0;
          float amplitude = 0.015 * factor;
          float x = uv1.y * frequency + time * .7;
          float y = uv1.x * frequency + time * .3;
          uv1.x += cos(x+y) * amplitude * cos(y);
          uv1.y += sin(x-y) * amplitude * cos(y);
          vec4 rgba = texture2D(tex, uv1);
          gl_FragColor = rgba;
      }`,
    });
    //material.map = true;
    // custom bloom shader
    // https://www.shadertoy.com/view/lsXGWn
    const shaderPass = new ShaderPass(material, 'tex');
    // from simondev
    //const bloomPass = new BloomEffect({x:1024,y:1024},2.0,0.0,0.75);
    const bloomPass = new BloomEffect();
    effectComposer.addPass(bloomPass);
    const finalPass = shaderPass;

    //
    //const waterEffect = new WaterEffect();

    //const glitchPass = new EffectPass(camera, glitchEffect);

    //glitchPass.renderToScreen = true;
    finalPass.renderToScreen = true;

    effectComposer.addPass(finalPass);

    return effectComposer;
  }, [camera, gl, scene, glitchEffectProps]);

  useEffect(() => composer.setSize(size.width, size.height), [composer, size]);
  return useFrame((_, delta) => {
    //console.log(_); // WebGlRenderer
    uniforms['time'].value += delta;
    composer.render(delta);
  }, 1);
};

export default Glitch;
