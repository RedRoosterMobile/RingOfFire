import * as THREE from 'three';
import React, { useRef, useMemo, useEffect } from 'react';
import { extend, useThree, useFrame } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { WaterPass } from '../post/Waterpass';

extend({
  EffectComposer,
  ShaderPass,
  RenderPass,
  WaterPass,
  UnrealBloomPass,
  FilmPass,
});
// turn this into a drei effect
// https://github.com/pmndrs/react-postprocessing/blob/master/api.md

export default function WaterEffects(/*scene, gl, camera, size*/) {
  
  const { gl, camera, size,scene } = useThree();
  console.log(gl, scene);
  //new EffectComposer(gl, scene);
  const ec = new EffectComposer(gl,{
    frameBufferType: HalfFloatType,
  });

  const renderPass = new RenderPass(scene, camera);
  renderPass.renderToScreen = true;
  ec.addPass(renderPass);
  console.log(composer.current.passes);
  const waterPass = new WaterPass(64);
  ec.addPass(waterPass);

  const filmPass = new FilmPass();
  filmPass.renderToScreen = true;
  ec.addPass(filmPass);

  const ubp = new UnrealBloomPass(aspect, 2, 1, 0);
  ubp.renderToScreen = true;
  ex.addPass(ubp);

  return null;
}
//<unrealBloomPass attachArray="passes" args={[aspect, 2, 1, 0]} />
// <waterPass attachArray="passes" factor={1.5} />
