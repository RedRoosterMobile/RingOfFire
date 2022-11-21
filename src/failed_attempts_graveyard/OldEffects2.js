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
export default function OldEffects2({ scene, children }) {
  const { gl, camera, size } = useThree();
  
  const composer = useRef();
  const aspect = useMemo(() => new THREE.Vector2(512, 512), [])
  useEffect(() => {
    scene && composer.current.setSize(size.width, size.height);
    console.log('effect', gl);
    console.log('effect', camera);
    console.log('effect', size);
    if (scene && composer && composer.current && gl) {
      console.log(composer.current);
      // BUG: no passes registered
      console.log(composer.current.passes);
      console.log(scene);
      composer.current = new EffectComposer(gl,scene);
      console.log(scene);
      
      const renderPass = new RenderPass(scene, camera);
      renderPass.renderToScreen = true;
      composer.current.addPass(renderPass);
      console.log(composer.current.passes);
      const waterPass = new WaterPass(64);
      composer.current.addPass( waterPass );
      
      const filmPass = new FilmPass();
      filmPass.renderToScreen = true;
      composer.current.addPass( filmPass );

      const ubp = new UnrealBloomPass(aspect, 2, 1, 0);
      ubp.renderToScreen = true;
      composer.current.addPass( ubp );
      
    }
  }, [size,scene]);
  useFrame(() => {
    // frame
    scene && composer && composer.current && composer.current.render();
  }, 1);

  // todo: code this manually??
  // https://threejs.org/docs/#manual/en/introduction/How-to-use-post-processing
  // const composer = new EffectComposer( renderer );
  return (
    <>
      <effectComposer ref={composer} args={[gl]}>
       
      </effectComposer>
    </>
  );
}
//  <renderPass attachArray="passes" scene={scene} camera={camera} />
//<unrealBloomPass attachArray="passes" args={[undefined, 1.5, 1, 0]} />
