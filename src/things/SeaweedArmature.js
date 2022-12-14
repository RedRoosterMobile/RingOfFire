/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
author: n- (https://sketchfab.com/n-)
license: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
source: https://sketchfab.com/3d-models/crystal-jellyfish-leptomedusae-38ac0d91213d447eb3366f615298ce8f
title: Crystal Jellyfish (Leptomedusae)
//  npx gltfjsx crystal_jellyfish_leptomedusae.glb  
https://github.com/pmndrs/gltfjsx
*/

// somehow set it to height of floor
// https://stackoverflow.com/questions/28568608/getting-terrains-height-y-coordinate-three-js
import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { MeshStandardMaterial } from 'three';

// node_modules/@react-three/drei/core/MeshWobbleMaterial.js
class WobbleMaterialImpl extends MeshStandardMaterial {
  constructor(parameters = {}) {
    super(parameters);
    this.setValues(parameters);
    this._time = {
      value: 0,
    };
    this._factor = {
      value: 1,
    };
  }

  onBeforeCompile(shader) {
    shader.uniforms.time = this._time;
    shader.uniforms.factor = this._factor;
    shader.vertexShader = `
      uniform float time;
      uniform float factor;
      ${shader.vertexShader}
    `;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `float theta = sin( time + position.y ) / 2.0 * factor;
        float c = cos( theta );
        float s = sin( theta );
        mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );
        vec3 transformed = vec3( position ) * m;
        vNormal = vNormal * m;`
    );
  }

  get time() {
    return this._time.value;
  }

  set time(v) {
    this._time.value = v;
  }

  get factor() {
    return this._factor.value;
  }

  set factor(v) {
    this._factor.value = v;
  }
}

const MODEL = '/models/sea_weed.glb';
export function SeaweedArmature(props) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF(MODEL);
  const { actions } = useAnimations(animations, group);
  useEffect(() => {
    const animationAction = actions['Sway'];
    animationAction.play();
  });
  const material = useMemo(() => {
    const a = new WobbleMaterialImpl({
      color: '#f25042',
      transparent: true,
      opacity: 0.88,
    });
    a.factor = 0.6;
    return a;
  });
  const speed = 1;
  useFrame(
    (state) =>
      material && (material.time = state.clock.getElapsedTime() * speed)
  );

  const colorMaterial = materials.Seaweed;
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_model">
        <group name="Seaweed002_51" position={[-0.28, 0, 0.23]}>
          <group name="GLTF_created_0">
            <primitive object={nodes.GLTF_created_0_rootJoint} />
            <mesh
              name="Object_7"
              geometry={nodes.Object_7.geometry}
              skeleton={nodes.Object_7.skeleton}
              material={material}
            ></mesh>
          </group>
        </group>
        <group
          name="Seaweed_73"
          position={[-0.62, 0, 0.77]}
          rotation={[0, 0.38, 0]}
        >
          <group name="GLTF_created_1">
            <primitive object={nodes.GLTF_created_1_rootJoint} />
            <skinnedMesh
              name="Object_60"
              geometry={nodes.Object_60.geometry}
              material={material}
              skeleton={nodes.Object_60.skeleton}
            />
          </group>
        </group>
        <group
          name="Seaweed001_93"
          position={[-0.64, 0.04, -0.46]}
          rotation={[0, -0.84, 0]}
        >
          <group name="GLTF_created_2">
            <primitive object={nodes.GLTF_created_2_rootJoint} />
            <skinnedMesh
              name="Object_85"
              geometry={nodes.Object_85.geometry}
              material={material}
              skeleton={nodes.Object_85.skeleton}
            />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(MODEL);
/**
 * <MeshWobbleMaterial
                      color="#f25042"
                      speed={1}
                      factor={0.6}
                    />
 */
