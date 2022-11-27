/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
author: Ben Lebreux (https://sketchfab.com/ben.lebreux)
license: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
source: https://sketchfab.com/3d-models/low-poly-mantaray-62ccfb67f0d9476d8857fce3599ace04
title: Low-Poly Mantaray
*/
import * as THREE from 'three';
import React, { useRef, useEffect, useMemo } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame,useLoader } from '@react-three/fiber';
import { MeshStandardMaterial, Vector3 } from 'three';
import { rgbTo01, getRandomFloat } from '../helper';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
const CHILL_FACTOR = 1.3;
const SPEED = 1000;
const MODEL = '/models/manta_ray_bubble.glb';
const PATH = '/paths/MantaBezier.obj';
export function MantaRay(props) {
  const group = useRef();
  const mantaMesh = useRef();
  const mantaPathGeometry = useMemo(
    () => useLoader(OBJLoader, PATH).children[0].geometry,
    []
  );
  
  const { nodes, materials, animations } = useGLTF(MODEL);
  /*
  animations[0].duration *= CHILL_FACTOR;
  for (let i = 0; i < animations[0].tracks.length; i++) {
    for (let j = 0; j < animations[0].tracks[i].times.length; j++) {
      animations[0].tracks[i].times[j] *= CHILL_FACTOR;
    }
  }*/
  const { actions } = useAnimations(animations, group);
  const pointsMaterial = new THREE.PointsMaterial({color: 0x00ff00, size: 10.125 });
  const v3Array = [];
  useEffect(() => {
    group.current.updateMatrix();
    const animationAction = actions['Swimming'];
    animationAction.setEffectiveTimeScale(CHILL_FACTOR).play();

    const posArray = mantaPathGeometry.attributes.position.array;
    
    for (let i=0; i<posArray.length;i=i+3) {
      v3Array.push(new THREE.Vector3(posArray[i+0],posArray[i+1],posArray[i+2]));
    }
    // to lookAt()
    console.log(v3Array);
   
  });
  const outlineMaterial = useMemo(() => {
    return materials.Rausku_outline;
  });
  const spline = useMemo(() => {
    console.log(v3Array);
    const curve = new THREE.CatmullRomCurve3(v3Array);
    curve.curveType = "centripetal";
    curve.closed = true;
    return curve;
  }, [v3Array]);

  //const tubeGeom = new THREE.TubeBufferGeometry(spline, 250, 0.02, 10, true);
  const posIdx = useRef(0);

  let mantaPosIndex = 0;

  let mantaPos = v3Array[mantaPosIndex] || new THREE.Vector3(0,0,0);
  
  useFrame((_, delta)=>{
    posIdx.current++;
    if (posIdx.current > SPEED) posIdx.current = 0;
    const pos = spline.getPoint(posIdx.current / SPEED);
    const posnext = spline.getPoint((posIdx.current + 1) / SPEED);

    group.current.position.x = pos.x;
    group.current.position.y = pos.y;
    group.current.position.z = pos.z;

    group.current.lookAt(posnext);
    // check it out man! https://codesandbox.io/s/animations-curve-path-forked-y5vyng
    
  });
// 
  const justFish = false;
  return (<group>
    <points material={pointsMaterial} geometry={mantaPathGeometry}/>
    <group ref={group} {...props} dispose={null}>
      
      <group name="Sketchfab_model" position={mantaPos} scale={2} rotation={[-Math.PI / 2, 0, 0]}>
        <group name="Root">
          <group name="Rausku_armature">
            <primitive object={nodes.Rausku_armature_rootJoint} />
            {!justFish && (
              <group name="Rausku_mesh">
                <skinnedMesh
                  name="Rausku_mesh_0"
                  geometry={nodes.Rausku_mesh_0.geometry}
                  material={materials.Rausku_texture}
                  skeleton={nodes.Rausku_mesh_0.skeleton}
                  castShadow
                  ref={mantaMesh}
                  metalness={1}
                />
                <skinnedMesh
                  name="Rausku_mesh_1"
                  geometry={nodes.Rausku_mesh_1.geometry}
                  material={outlineMaterial}
                  skeleton={nodes.Rausku_mesh_1.skeleton}
                  castShadow
                />
              </group>
            )}
          </group>

          <group name="Fish_Armature">
            <primitive object={nodes.Fish_Armature_rootJoint} />
            <group name="Fish_mesh" />
            <skinnedMesh
              name="Fish_mesh_0"
              geometry={nodes.Fish_mesh_0.geometry}
              material={outlineMaterial}
              skeleton={nodes.Fish_mesh_0.skeleton}
              castShadow
              emissive={[2, 1.75, 0]}
                  material-color={'navy'}
                  emissiveIntensity={100.1}
                  toneMapped={true}
                  metalness={0.5}
            />
          </group>
          <group name="Fish_Armature001">
            <primitive object={nodes.Fish_Armature001_rootJoint} />
            <group name="Fish_mesh001" />
            <skinnedMesh
              name="Fish_mesh001_0"
              geometry={nodes.Fish_mesh001_0.geometry}
              material={outlineMaterial}
              skeleton={nodes.Fish_mesh001_0.skeleton}
              castShadow
            />
          </group>
          <group name="Fish_Armature002">
            <primitive object={nodes.Fish_Armature002_rootJoint} />
            <group name="Fish_mesh002" />
            <skinnedMesh
              name="Fish_mesh002_0"
              geometry={nodes.Fish_mesh002_0.geometry}
              material={outlineMaterial}
              skeleton={nodes.Fish_mesh002_0.skeleton}
              castShadow
            />
          </group>
        </group>
      </group>
    </group>
    </group>
  );
}

useGLTF.preload(MODEL);
