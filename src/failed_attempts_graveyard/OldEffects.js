import * as THREE from 'three';
import React, { useRef, useMemo, useEffect, useState } from 'react';
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
// render pass https://codesandbox.io/s/github/onion2k/r3f-by-example/tree/develop/examples/effects/emissive-bloom?file=/src/index.js:2171-2296
export default function OldEffects({ scene, children }) {
  const { gl, camera, size } = useThree();

  const composer = useRef();

  useEffect(() => {
    console.log('gt here');
    scene && composer.current.setSize(size.width, size.height);
    console.log('effect', gl);
    console.log('effect', camera);
    console.log('effect', size);
    if (composer && composer.current) {
      console.log(composer.current);
      // BUG: no passes registered
      console.log(composer.current.passes);
      console.log(gl);
      console.log(scene);

      /*
      composer.current = new EffectComposer(gl);
      const renderPass = new RenderPass(scene, camera);
      composer.current.addPass(renderPass);
      console.log(composer.current.passes);
      const waterPass = new WaterPass();
      composer.current.addPass( waterPass );
      */
    }
  }, [size]);

  useEffect(() => {
    
    //const renderPass = new RenderPass(scene, camera);
    //composer.current.addPass(renderPass);
    const waterPass = new WaterPass();
    waterPass.renderToScreen = true;
    composer.current.addPass(waterPass);
    console.log('compoers', composer.current);
  }, [composer.current]);

  // todo: code this manually??
  // https://threejs.org/docs/#manual/en/introduction/How-to-use-post-processing
  // const composer = new EffectComposer( renderer );
  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      <waterPass attachArray="passes" />
    </effectComposer>
  );
}
//<renderPass attachArray="passes" scene={scene} camera={camera} />
//<unrealBloomPass attachArray="passes" args={[undefined, 1.5, 1, 0]} />
