//todo:
// https://ercangercek.medium.com/experiment-with-3d-boids-and-javascript-fe8fa51707b8
// implement webworker version in R3F

import React, { useRef, useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { rgbTo01 } from '../helper';
import { useFrame, useThree, extend } from '@react-three/fiber';

import BoidsController from './common/BoidsController.js';
import SimpleRenderer from './common/SimpleRenderer.js';
import ControlHelper from './common/ControlHelper.js';

export function BetterBoids(props) {
  const groupRef = useRef();
  const {
    gl, // WebGL renderer
    scene, // Default scene
    camera, // Default camera
    // raycaster, // Default raycaster
    size, // Bounds of the view (which stretches 100% and auto-adjusts)
    viewport, // Bounds of the viewport in 3d units + factor (size/viewport)
    aspect, // Aspect ratio (size.width / size.height)
    mouse, // Current, centered, normalized 2D mouse coordinates
    clock, // THREE.Clock (useful for useFrame deltas)
    invalidate, // Invalidates a single frame (for <Canvas invalidateFrameloop />)
    intersect, // Calls onMouseMove handlers for objects underneath the cursor
    setDefaultCamera, // Sets the default camera
  } = useThree();
  let flockEntityCount = 100;
  let obstacleEntityCount = 15;

  let simpleRenderer = undefined;
  let boidsController = undefined;
  let controlHelper;

  let isReady = false;
  useEffect(() => {

    // create a boids controller with the given boundary [2000, 600, 2000]
    // subdivide the world in to 10*10*10 cubes by passing subDivisionCount as 10
    // this will reduce the time spent for finding nearby entities
    boidsController = new BoidsController(200, 60, 200);
    boidsController.setMaxSpeed(1.5);



    // create renderer and pass boidsController to render entities
    simpleRenderer = new SimpleRenderer({
      boidsController: boidsController,
    });
    simpleRenderer.init(groupRef.current);
    // create control helper for example controls
    controlHelper = new ControlHelper(boidsController);
    // add initial entities for an interesting view
    controlHelper.addBoids(flockEntityCount);
    controlHelper.addObstacles(obstacleEntityCount);
    // request the first animation frame
    // window.requestAnimationFrame(render.bind(this));
    isReady = true;
  }, [groupRef]);
  const render = () => {
    if (isReady) {
      // update screen by rendering
      simpleRenderer.render();
    }
  };

  useFrame(({ gl, scene, camera }) => {
    if (groupRef && isReady) {
      
      // calculate boids entities
      boidsController.iterate();

      // update screen by rendering
      simpleRenderer.render();
    }
    //gl.render(scene, camera);
  });
  return <group ref={groupRef} {...props}></group>;
}
