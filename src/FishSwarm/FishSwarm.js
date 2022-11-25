// Taken from:
// https://codesandbox.io/s/boids-mit-hack-forked-efk5zf?file=/src/App.tsx:0-234
// https://codesandbox.io/s/boids-mit-hack-xk4r2q?file=/package.json

import React, { useState } from 'react';
// import { SimpleSlider } from './SimpleSlider.js';
import { FishesComponent } from './Fishes';

const outerBoundsDistance = 50;
export function FishSwarm() {
  // for slider..
  const [boxSize, setBoxSize] = useState(5);
  const [outerBoundsForceScaling, setOuterBoundsForceScaling] = useState(0.5);
  const [alignmentForeScaling, setAlignmentForeScaling] = useState(6);
  const [cohesionForceScaling, setCohesionForceScaling] = useState(0.8);
  const [separationForceScaling, setSeparationForceScaling] = useState(0.1);
  return (
    <>
      <mesh>
        <sphereGeometry args={[outerBoundsDistance, 32, 32]} />
        <meshBasicMaterial color="green" transparent opacity={0.1} wireframe />
      </mesh>
      <FishesComponent
        boxSize={boxSize}
        outerBoundsForceScaling={outerBoundsForceScaling}
        alignmentForeScaling={alignmentForeScaling}
        cohesionForceScaling={cohesionForceScaling}
        separationForceScaling={separationForceScaling}
      />
    </>
  );
}

// TODO: add slider in debug mode
/**
 <div style={{ display: 'flex', flexGrow: 1 }}>
      <div style={{ width: 240, display: 'flex', flexDirection: 'column' }}>
        <SimpleSlider
          label="Box Size"
          id="box-size"
          min={0}
          max={20}
          step={1}
          value={boxSize}
          onChange={setBoxSize}
        />
        <SimpleSlider
          label="Outer Bounds Scaling"
          id="outer-bounds-scaling"
          min={0}
          max={10}
          step={0.1}
          value={outerBoundsForceScaling}
          onChange={setOuterBoundsForceScaling}
        />
        <SimpleSlider
          label="Alignment Force Scaling"
          id="alignment-force-scaling"
          min={0}
          max={10}
          step={0.1}
          value={alignmentForeScaling}
          onChange={setAlignmentForeScaling}
        />
        <SimpleSlider
          label="Cohesion Force Scaling"
          id="cohesion-force-scaling"
          min={0}
          max={1.5}
          step={0.1}
          value={cohesionForceScaling}
          onChange={setCohesionForceScaling}
        />
        <SimpleSlider
          label="Separation Force Scaling"
          id="separation-force-scaling"
          min={0.0}
          max={1.5}
          step={0.01}
          value={separationForceScaling}
          onChange={setSeparationForceScaling}
        />
      </div>
 */