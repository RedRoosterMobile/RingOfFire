//todo:
// https://ercangercek.medium.com/experiment-with-3d-boids-and-javascript-fe8fa51707b8
// implement webworker version in R3F

import React, { useRef, useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { rgbTo01 } from '../helper';
import { useFrame, useThree, extend } from '@react-three/fiber';

import BoidsController from './BoidsController.js';
import SimpleRenderer from './SimpleRenderer.js';

import BoidsWorkerPlanner from './BoidsWorkerPlanner.js';

export function BetterBoids() {
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
  let flockEntityCount = 1000;
  let obstacleEntityCount = 100;
  let simpleRenderer = undefined;
  let boidsController = undefined;

  let workerPlanner = undefined;

  let iterateRequested = false;
  let isReady = false;
  useEffect(() => {
    // create a boids controller with the given boundary [2000, 600, 2000]
    // subdivide the world in to 10*10*10 cubes by passing subDivisionCount as 10
    // this will reduce the time spent for finding nearby entities
    boidsController = new BoidsController(2000, 600, 2000, 10);

    // create renderer and pass boidsController to render entities
    simpleRenderer = new SimpleRenderer({
      boidsController: boidsController,
    });
    simpleRenderer.init(camera, scene, gl);

    // create worker planner to run the simulation in WebWorker thread.
    // keep the default worker count as 4
    workerPlanner = new BoidsWorkerPlanner(boidsController, onWorkerUpdate);
    workerPlanner.init();
    // request the first animation frame
    // window.requestAnimationFrame(render.bind(this));
    isReady = true;
  }, []);
  const render = () => {
    if (isReady) {
      //window.requestAnimationFrame(this.render.bind(this));

      // if the iterate is not requested, make a new iteration reques
      if (!iterateRequested) {
        workerPlanner.requestIterate();
        iterateRequested = true;
      }

      // update screen by rendering
      simpleRenderer.render();
    }
  };

  const onWorkerUpdate = () => {
    iterateRequested = false;
  };
  useFrame(() => {
    render();
  });
  return null;
}
