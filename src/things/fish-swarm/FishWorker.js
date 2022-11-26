const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));

onmessage = (e) => {
  const { prms } = e.data;
  const startTime = new Date().getTime();

  // big calculation
  const fibNum = fib(num);

  postMessage({
    fibNum,
    time: new Date().getTime() - startTime,
  });
};

/**
 * 
 * 
 * const worker = new window.Worker("src/fib-worker.js");


 worker.postMessage({ num });
  worker.onerror = (err) => err;
  worker.onmessage = (e) => {
    const { time, fibNum } = e.data;
    const resultDiv = document.createElement("div");
    resultDiv.innerHTML = textCont(num, fibNum, time);
    resultDiv.className = "result-div";
    resultsContainer.appendChild(resultDiv);
  };
 */

function magicWorker(prms) {
  const {
    tempAppliedForces,
    fishes,
    separationForceScaling,
    outerBoundsForceScaling,
    cohesionForceScaling,
    alignmentForeScaling,
    cappedDelta,
  } = prms;
  const nearbyGraph = createNearbyGraph(fishes, 5);

  for (let fishIndex = 0; fishIndex < fishes.length; fishIndex++) {
    const fish = fishes[fishIndex];
    // Calculate force
    tempAppliedForces.set(0, 0, 0);
    const nearbyFish = nearbyGraph[fishIndex].map(
      (fishIndex) => fishes[fishIndex]
    );

    outerBoundsReturn(tempAppliedForces, fish, outerBoundsForceScaling);
    alignmentForces(tempAppliedForces, nearbyFish, alignmentForeScaling);
    cohesionForces(tempAppliedForces, fish, nearbyFish, cohesionForceScaling);
    applySeparationForces(
      tempAppliedForces,
      fish,
      nearbyFish,
      separationForceScaling
    );
    // apply force to the velocity
    tempAppliedForces.multiplyScalar(cappedDelta * 10);
    fish.velocity.add(tempAppliedForces);
    fish.velocity.clampLength(-maxSpeed, maxSpeed);
  }
}
