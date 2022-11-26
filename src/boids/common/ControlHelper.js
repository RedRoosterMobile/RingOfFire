import Entity from './Entity.js';

let stats = undefined;

/**
 * @module ControlHelper
 * A helper class to make examples easier.
 */
export default class ControlHelper {
  constructor(boidsController) {
    this.boidsController = boidsController;
  }

  addBoids(count = 50) {
    const boundary = this.boidsController.getBoundary();
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * boundary[0]);
      const y = Math.floor(Math.random() * boundary[1]);
      const z = Math.floor(Math.random() * boundary[2]);
      const vx = Math.random() * 4 - 2;
      const vy = Math.random() * 4 - 2;
      const vz = Math.random() * 4 - 2;

      const entity = new Entity(Entity.FLOCK_ENTITY, x, y, z, vx, vy, vz);
      this.boidsController.addFlockEntity(entity);
    }

    //this.updateButtonLabels();
  }

  addObstacles(obstacleCount = 5) {
    const boundary = this.boidsController.getBoundary();
    for (let i = 0; i < obstacleCount; i++) {
      const x = Math.floor(Math.random() * boundary[0]);
      const y = Math.floor(Math.random() * boundary[1]);
      const z = Math.floor(Math.random() * boundary[2]);

      const entity = new Entity(Entity.OBSTACLE_ENTITY, x, y, z);
      this.boidsController.addObstacleEntity(entity);
    }
  }
}
