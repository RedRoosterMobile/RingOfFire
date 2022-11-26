// fix for webworker somehow import somehow
//import BoidsController from './BoidsController.js'

let idCounter = 0;

/**
 * @module Entity
 * Entity class defines an entitiy model which has a position and a velocity.
 * Also it has some utiliy methods.
 */
export class Entity {
  /**
   * Constructor for the Entity class
   * @param {Number} type entitiy type that defines it as flock or obstacle entitiy
   * @param {Number} x x position
   * @param {Number} y y position
   * @param {Number} z z position
   * @param {Number} vx x velocity
   * @param {Number} vy y velocity
   * @param {Number} vz z velocity
   */
  constructor(type, x = 0, y = 0, z = 0, vx = 0, vy = 0, vz = 0) {
    this.id = ++idCounter;
    this.type = type;
    this.x = x;
    this.y = y;
    this.z = z;
    this.vx = vx;
    this.vy = vy;
    this.vz = vz;
    this.grid = undefined;
    this.mesh = undefined;

    this.FLOCK_ENTITY = 1;
    this.OBSTACLE_ENTITY = 1;
  }

  /**
   * Sets the grid instance
   * @param {Grid} grid
   */
  setGrid(grid) {
    this.grid = grid;
  }

  /**
   * @returns {Number} type of the entity
   */
  getType() {
    return this.type;
  }

  /**
   * @returns {Number} the current scalar velocity of the entity.
   */
  getVelocity() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy + this.vz * this.vz);
  }

  /**
   * Checks the velocity of the entitiy and limits it to the given parameter
   * @param {Number} maxVelocity
   */
  checkVelocity(maxVelocity = 1) {
    const velocity = this.getVelocity();
    if (velocity > maxVelocity && velocity > 0) {
      this.vx = (maxVelocity * this.vx) / velocity;
      this.vy = (maxVelocity * this.vy) / velocity;
      this.vz = (maxVelocity * this.vz) / velocity;
    }
  }

  /**
   * This method adds the given velocity to the current velocity.
   * @param {Number} vx x velocity
   * @param {Number} vy y velocity
   * @param {Number} vz z velocity
   */
  addVelocity(vx, vy, vz) {
    this.vx += vx;
    this.vy += vy;
    this.vz += vz;
  }

  /**
   * This method moves the entity.
   * @param {Number} maxVelocity
   * @param {Number} bx
   * @param {Number} by
   * @param {Number} bz
   */
  move(maxVelocity, bx, by, bz) {
    this.checkVelocity(maxVelocity);

    let nx = this.x + this.vx;
    let ny = this.y + this.vy;
    let nz = this.z + this.vz;

    nx = Math.max(0, nx);
    nx = Math.min(bx, nx);
    ny = Math.max(0, ny);
    ny = Math.min(by, ny);
    nz = Math.max(0, nz);
    nz = Math.min(bz, nz);

    this.grid.moveEntity(this, nx, ny, nz);
  }

  /**
   * Calculate the distance between the entity and the given entity
   * @param {Entity} otherEntity
   * @returns {Number} the distance between two entities
   */
  getDistance(otherEntity) {
    const dx = this.x - otherEntity.x;
    const dy = this.y - otherEntity.y;
    const dz = this.z - otherEntity.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Serialized the entitiy
   * @returns {Object} serialized data
   */
  serialize() {
    const { id, type, x, y, z, vx, vy, vz } = this;
    return {
      id,
      type,
      x,
      y,
      z,
      vx,
      vy,
      vz,
    };
  }

  /**
   * Updates the internal data of the entity if the IDs match
   * @param {Object} data
   */
  updateData(data) {
    if (this.id == data.id) {
      this.vx = data.vx;
      this.vy = data.vy;
      this.vz = data.vz;
      this.grid.moveEntity(this, data.x, data.y, data.z);
    }
  }

  /**
   * This static method deserializes the given data and returns new Entity instance.
   * @param {Object} data
   * @returns {Entitiy} deserialized Entitiy instance
   */
  static deserialize(data) {
    const e = new Entity(
      data.type,
      data.x,
      data.y,
      data.z,
      data.vx,
      data.vy,
      data.vz
    );
    e.id = data.id;
    return e;
  }
}

/**
 * @module Grid
 * Grid class creates cubic grid for spatial partitioning.
 * This helps lookups to be performed faster for nearby entities.
 * More information can be found here:
 * http://gameprogrammingpatterns.com/spatial-partition.html
 */
export default class Grid {
  /**
   * Constructor for the Grid class. Grids can be only be a cube. It takes cellSize as a parameter
   * @param {Number} worldSize total world size in units. eg. 1000
   * @param {Number} cellSize cell size to divide the world into. eg. 20.
   */
  constructor(worldSize, cellSize) {
    this.worldSize = worldSize;
    this.cellSize = cellSize;
    this.cellRowCount = (this.worldSize / this.cellSize) | 0;

    this.cellCount = this.cellRowCount * this.cellRowCount * this.cellRowCount;
    this.entityList = [];
    for (let i = 0; i < this.cellCount; i++) {
      this.entityList[i] = [];
    }
  }

  /**
   * @returns {Number} world size
   */
  getWorldSize() {
    return this.worldSize;
  }

  /**
   * @returns {Number} grid count in a row
   */
  getGridRowCount() {
    return this.cellRowCount;
  }

  /**
   * Calculate the grid index for the given x,y,z position
   * @param {*} x x position of the entity
   * @param {*} y y position of the entity
   * @param {*} z z position of the entity
   * @returns {Number} index of the cell for the given point
   */
  getGridIndex(x, y, z) {
    let cellX = (x / this.cellSize) | 0;
    let cellY = (y / this.cellSize) | 0;
    let cellZ = (z / this.cellSize) | 0;

    if (cellX < 0) {
      cellX = 0;
    } else if (cellX > this.cellRowCount - 1) {
      cellX = this.cellRowCount - 1;
    }

    if (cellY < 0) {
      cellY = 0;
    } else if (cellY > this.cellRowCount - 1) {
      cellY = this.cellRowCount - 1;
    }

    if (cellZ < 0) {
      cellZ = 0;
    } else if (cellZ > this.cellRowCount - 1) {
      cellZ = this.cellRowCount - 1;
    }

    let index =
      cellX +
      cellY * this.cellRowCount +
      cellZ * this.cellRowCount * this.cellRowCount;
    return index | 0;
  }

  /**
   * Adds the entity to the correspoding grid
   * @param {Object} entity
   */
  addEntity(entity) {
    const index = this.getGridIndex(entity.x, entity.y, entity.z) | 0;
    entity.setGrid(this);
    this.entityList[index].push(entity);
  }

  /**
   * Removes the entity from the correspoding grid
   * @param {Object} entity
   */
  removeEntity(entity) {
    const index = this.getGridIndex(entity.x, entity.y, entity.z) | 0;
    const gridEntities = this.entityList[index];
    const entityIndex = gridEntities.indexOf(entity);
    if (entityIndex == -1) {
      // serious error!
      throw 'removeEntity() can not find the entity to be removed!';
      return;
    } else {
      gridEntities.splice(entityIndex, 1);
      entity.setGrid(undefined);
    }
  }

  /**
   * Moves the entity. Checks the new grid index, if the given position
   * requires entitiy move from cell to cell, it handles that transition.
   * @param {Object} entity entitiy object
   * @param {Number} newX new x position
   * @param {Number} newY new y position
   * @param {Number} newZ new z position
   */
  moveEntity(entity, newX, newY, newZ) {
    const oldIndex = this.getGridIndex(entity.x, entity.y, entity.z) | 0;
    const newIndex = this.getGridIndex(newX, newY, newZ) | 0;

    if (oldIndex == newIndex) {
      entity.x = newX;
      entity.y = newY;
      entity.z = newZ;
      // no need to update
      return;
    }

    // remove from the old grid list
    const gridEntities = this.entityList[oldIndex];
    const entityIndex = gridEntities.indexOf(entity);
    if (entityIndex == -1) {
      // serious error!
      throw 'moveEntity() can not find the entity to be removed!';
      return;
    } else {
      gridEntities.splice(entityIndex, 1);
    }

    // add to the new grid list
    entity.x = newX;
    entity.y = newY;
    entity.z = newZ;
    this.entityList[newIndex].push(entity);
  }

  /**
   * Finds the corresponding grid for the given x,y,z position and
   * returns the entities in that grid.
   * @param {Number} x x position to find a cell
   * @param {Number} y y position to find a cell
   * @param {Number} z z position to find a cell
   * @returns {Array} entity list for that grid
   */
  getEntitiesInGrid(x, y, z) {
    const index = this.getGridIndex(x, y, z) | 0;
    return this.entityList[index];
  }

  /**
   * Returns the entities in the grid with the given index
   * @param {Number} index
   * @returns {Array} entity list for that grid
   */
  getEntitiesInGridIndex(index) {
    if (index < 0 || index >= this.cellCount) {
      throw 'getEntitiesInGridIndex() out of bounds!';
    }

    return this.entityList[index | 0];
  }

  /**
   * This method finds the entities in the cube that is defined with an origin position and a size.
   * The callback is executed for every entity that is found in the cube.
   * @param {Number} originX x position for the cube
   * @param {Number} originY y position for the cube
   * @param {Number} originZ z position for the cube
   * @param {Number} size size of the cube
   * @param {Function} callback callback is executed for every entity that is found in the cube
   */
  getEntitiesInCube(originX, originY, originZ, size, callback) {
    const start = this.getGridIndex(
      originX - size,
      originY - size,
      originZ - size
    ); // top left
    const topEnd = this.getGridIndex(
      originX + size,
      originY - size,
      originZ - size
    ); // top right
    const bottomStart = this.getGridIndex(
      originX - size,
      originY + size,
      originZ - size
    ); // bottom left
    const backStart = this.getGridIndex(
      originX + size,
      originY + size,
      originZ + size
    ); // back left

    const index = start;
    const width = topEnd - start + 1;
    const height = ((bottomStart - start) / this.cellRowCount + 1) | 0;
    const depth =
      ((backStart - start) / (this.cellRowCount * this.cellRowCount) + 1) | 0;
    for (let d = 0; d < depth; d++) {
      for (let h = 0; h < height; h++) {
        for (let w = 0; w < width; w++) {
          const currentIndex =
            index +
            d * this.cellRowCount * this.cellRowCount +
            h * this.cellRowCount +
            w;
          if (currentIndex >= this.cellCount) {
            continue;
          }

          const currentItems = this.entityList[currentIndex];
          const curLen = currentItems.length;
          for (let i = 0; i < curLen; i++) {
            const item = currentItems[i];
            if (
              item !== undefined &&
              item.x >= originX - size &&
              item.x <= originX + size &&
              item.y >= originY - size &&
              item.y <= originY + size &&
              item.z >= originZ - size &&
              item.z <= originZ + size
            ) {
              callback(item);
            }
          }
        }
      }
    }
  }
}

/**
 * @module BoidsController
 * BoidsController class defines a container for boids entities.
 * All entities (flock or obstalces) are added to BoidsController.
 * BoidsController calculates and updates entity positions and velocities.
 */
class BoidsController {
  /**
   * Constructor for the BoidsController
   * @param {Number} boundaryX world size in x axis
   * @param {Number} boundaryY world size in y axis
   * @param {Number} boundaryZ world size in z axis
   * @param {Number} subDivisionCount subdivision count defines the grid size.
   * If it is given 10, world will be splitted into 10*10*10 cubes for spatial partitioning.
   */
  constructor(
    boundaryX = 500,
    boundaryY = 500,
    boundaryZ = 500,
    subDivisionCount = 1
  ) {
    const maxSize = Math.max(boundaryX, boundaryY, boundaryZ);
    this.grid = new Grid(maxSize, maxSize / subDivisionCount);
    this.subDivisionCount = subDivisionCount;

    this.flockEntities = [];
    this.obstacleEntities = [];

    this.boundaryX = boundaryX;
    this.boundaryY = boundaryY;
    this.boundaryZ = boundaryZ;

    this.aligmentWeight = 2.0;
    this.cohesionWeight = 4;
    this.separationWeight = 0.3;

    this.maxEntitySpeed = 5;

    this.aligmentRadius = 100;
    this.cohesionRadius = 100;
    this.separationRadius = 100;
    this.obstacleRadius = 100;
  }

  /**
   * Adds flock entity to boids container
   * @param {Entity} entity
   */
  addFlockEntity(entity) {
    this.grid.addEntity(entity);
    this.flockEntities.push(entity);
  }

  /**
   * Returns flock entities
   * @returns {Array} flock entities
   */
  getFlockEntities() {
    return this.flockEntities;
  }

  /**
   * Adds obstacle entity to boids controller
   * @param {Entity} entity
   */
  addObstacleEntity(entity) {
    this.grid.addEntity(entity);
    this.obstacleEntities.push(entity);
  }

  /**
   * Returns obstacle entities
   * @returns {Array} obstacle entities
   */
  getObstacleEntities() {
    return this.obstacleEntities;
  }

  /**
   * Returns world boundary
   * @returns {Array} boundary vector
   */
  getBoundary() {
    return [this.boundaryX, this.boundaryY, this.boundaryZ];
  }

  /**
   * Sets max speed for flock entities.
   * @param {Number} s
   */
  setMaxSpeed(s) {
    this.maxEntitySpeed = s;
  }

  /**
   * Sets aligment weight. This changes how much flock entities are effected by each others alignment
   * @param {Number} w
   */
  setAligmentWeight(w) {
    this.aligmentWeight = w;
  }

  /**
   * Sets cohesion weight. This changes how much flock entities are inclined to stick together
   * @param {Number} w
   */
  setCohesionWeight(w) {
    this.cohesionWeight = w;
  }

  /**
   * Sets separation weight. This changes how much flock entities are inclined to separate from each together
   * @param {Number} w
   */
  setSeparationWeight(w) {
    this.separationWeight = w;
  }

  /**
   * Sets world boundary
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   */
  setBoundary(x, y, z) {
    this.boundaryX = x;
    this.boundaryY = y;
    this.boundaryZ = z;
  }

  /**
   * iterate calculates the new position for flock entities.
   * start and end indices are used for parallelization of this calculation
   * @param {Number} start start index for calculation
   * @param {Number} end end index for calculation
   */
  iterate(start = 0, end = this.flockEntities.length) {
    for (let i = start; i < end; i++) {
      const entity = this.flockEntities[i];
      const aligmentVel = this.computeAlignment(entity);
      const cohVel = this.computeCohesion(entity);
      const sepVel = this.computeSeparation(entity);
      const obsVel = this.computeObstacles(entity);

      // add components
      const vx =
        this.aligmentWeight * aligmentVel[0] +
        this.cohesionWeight * cohVel[0] +
        50 * this.separationWeight * sepVel[0] +
        100 * obsVel[0];
      const vy =
        this.aligmentWeight * aligmentVel[1] +
        this.cohesionWeight * cohVel[1] +
        50 * this.separationWeight * sepVel[1] +
        100 * obsVel[1];
      const vz =
        this.aligmentWeight * aligmentVel[2] +
        this.cohesionWeight * cohVel[2] +
        50 * this.separationWeight * sepVel[2] +
        100 * obsVel[2];

      entity.addVelocity(vx, vy, vz);
      entity.move(
        this.maxEntitySpeed,
        this.boundaryX,
        this.boundaryY,
        this.boundaryZ
      );
    }
  }

  /**
   * Computes alignment vector for the given entity
   * @param {Entity} entity
   * @returns {Array} alignment vector
   */
  computeAlignment(entity) {
    let aligmentX = 0;
    let aligmentY = 0;
    let aligmentZ = 0;
    let neighborCount = 0;

    this.grid.getEntitiesInCube(
      entity.x,
      entity.y,
      entity.z,
      this.aligmentRadius,
      (currentEntity) => {
        if (
          currentEntity != entity &&
          currentEntity.getType() == Entity.FLOCK_ENTITY &&
          entity.getDistance(currentEntity) < this.aligmentRadius
        ) {
          neighborCount++;
          aligmentX += currentEntity.vx;
          aligmentY += currentEntity.vy;
          aligmentZ += currentEntity.vz;
        }
      }
    );

    if (neighborCount > 0) {
      aligmentX /= neighborCount;
      aligmentY /= neighborCount;
      aligmentZ /= neighborCount;
      const aligmentMag = Math.sqrt(
        aligmentX * aligmentX + aligmentY * aligmentY + aligmentZ * aligmentZ
      );
      if (aligmentMag > 0) {
        aligmentX /= aligmentMag;
        aligmentY /= aligmentMag;
        aligmentZ /= aligmentMag;
      }
    }

    return [aligmentX, aligmentY, aligmentZ];
  }

  /**
   * Computes cohesion vector for the given entity
   * @param {Entity} entity
   * @returns {Array} cohesion vector
   */
  computeCohesion(entity) {
    let cohX = 0;
    let cohY = 0;
    let cohZ = 0;
    let neighborCount = 0;

    this.grid.getEntitiesInCube(
      entity.x,
      entity.y,
      entity.z,
      this.cohesionRadius,
      (currentEntity) => {
        if (
          currentEntity != entity &&
          currentEntity.getType() == Entity.FLOCK_ENTITY &&
          entity.getDistance(currentEntity) < this.cohesionRadius
        ) {
          neighborCount++;
          cohX += currentEntity.x;
          cohY += currentEntity.y;
          cohZ += currentEntity.z;
        }
      }
    );

    if (neighborCount > 0) {
      cohX /= neighborCount;
      cohY /= neighborCount;
      cohZ /= neighborCount;

      cohX = cohX - entity.x;
      cohY = cohY - entity.y;
      cohZ = cohZ - entity.z;

      var cohMag = Math.sqrt(cohX * cohX + cohY * cohY + cohZ * cohZ);
      if (cohMag > 0) {
        cohX /= cohMag;
        cohY /= cohMag;
        cohZ /= cohMag;
      }
    }

    return [cohX, cohY, cohZ];
  }

  /**
   * Computes separation vector for the given entity
   * @param {Entity} entity
   * @returns {Array} separation vector
   */
  computeSeparation(entity) {
    let sepX = 0;
    let sepY = 0;
    let sepZ = 0;
    let neighborCount = 0;

    this.grid.getEntitiesInCube(
      entity.x,
      entity.y,
      entity.z,
      this.separationRadius,
      (currentEntity) => {
        let distance = entity.getDistance(currentEntity);
        if (distance <= 0) {
          distance = 0.01;
        }

        if (
          currentEntity != entity &&
          currentEntity.getType() == Entity.FLOCK_ENTITY &&
          distance < this.separationRadius
        ) {
          neighborCount++;
          const sx = entity.x - currentEntity.x;
          const sy = entity.y - currentEntity.y;
          const sz = entity.z - currentEntity.z;
          sepX += sx / distance / distance;
          sepY += sy / distance / distance;
          sepZ += sz / distance / distance;
        }
      }
    );

    return [sepX, sepY, sepZ];
  }

  /**
   * Computes obstacle avoidance vector for the given entity
   * @param {Entity} entity
   * @returns {Array} obstacle avoidance vector
   */
  computeObstacles(entity) {
    let avoidX = 0;
    let avoidY = 0;
    let avoidZ = 0;

    this.grid.getEntitiesInCube(
      entity.x,
      entity.y,
      entity.z,
      this.obstacleRadius,
      (currentObstacle) => {
        const distance = entity.getDistance(currentObstacle);
        if (
          distance > 0 &&
          currentObstacle.getType() == Entity.OBSTACLE_ENTITY &&
          distance < this.obstacleRadius
        ) {
          const ox = entity.x - currentObstacle.x;
          const oy = entity.y - currentObstacle.y;
          const oz = entity.z - currentObstacle.z;
          avoidX += ox / distance / distance;
          avoidY += oy / distance / distance;
          avoidZ += oz / distance / distance;
        }
      }
    );

    // avoid boundary limits
    const boundaryObstacleRadius = this.obstacleRadius / 4;
    const distX = this.boundaryX - entity.x;
    const distY = this.boundaryY - entity.y;
    const distZ = this.boundaryZ - entity.z;
    if (entity.x < boundaryObstacleRadius && Math.abs(entity.x) > 0) {
      avoidX += 1 / entity.x;
    } else if (distX < boundaryObstacleRadius && distX > 0) {
      avoidX -= 1 / distX;
    }
    if (entity.y < boundaryObstacleRadius && Math.abs(entity.y) > 0) {
      avoidY += 1 / entity.y;
    } else if (distY < boundaryObstacleRadius && distY > 0) {
      avoidY -= 1 / distY;
    }
    if (entity.z < boundaryObstacleRadius && Math.abs(entity.z) > 0) {
      avoidZ += 1 / entity.z;
    } else if (distZ < boundaryObstacleRadius && distZ > 0) {
      avoidZ -= 1 / distZ;
    }

    return [avoidX, avoidY, avoidZ];
  }

  /**
   * This methods serializes the whole boids controller with entities and
   * returns as a simple object.
   * @returns {Object} serialized BoidsController data
   */
  serialize() {
    const flockEntities = [];
    const obstacleEntities = [];
    this.flockEntities.forEach((entity) => {
      flockEntities.push(entity.serialize());
    });

    this.obstacleEntities.forEach((entity) => {
      obstacleEntities.push(entity.serialize());
    });

    return {
      subDivisionCount: this.subDivisionCount,
      boundaryX: this.boundaryX,
      boundaryY: this.boundaryY,
      boundaryZ: this.boundaryZ,
      flockEntities,
      obstacleEntities,
      aligmentWeight: this.aligmentWeight,
      cohesionWeight: this.cohesionWeight,
      separationWeight: this.separationWeight,
      maxEntitySpeed: this.maxEntitySpeed,
      aligmentRadius: this.aligmentRadius,
      cohesionRadius: this.cohesionRadius,
      separationRadius: this.separationRadius,
      obstacleRadius: this.obstacleRadius,
    };
  }

  /**
   * This methods serializes only the boids data for the given start and end indices.
   * @param {Number} start
   * @param {Number} end
   * @returns {Object} serialized partial boids data
   */
  serializeBoidsData(start = 0, end = this.flockEntities.length) {
    const flockEntities = [];
    for (let i = start; i < end; i++) {
      flockEntities.push(this.flockEntities[i].serialize());
    }
    return { start, flockEntities };
  }

  /**
   * Applies the serialized boids data.
   * @param {Object} data
   */
  applyBoidsData(data) {
    const start = data.start;
    const flockEntities = data.flockEntities;
    for (let i = 0; i < flockEntities.length; i++) {
      const entity = this.flockEntities[start + i];
      const updatedData = flockEntities[i];
      if (entity.id == updatedData.id) {
        entity.updateData(updatedData);
      } else {
        console.log('ids do not match!');
      }
    }
  }

  /**
   * This static method deserializes a boids controller data
   * and creates a new BoidsController instance.
   * @param {Object} data
   * @returns {BoidsController} deserialized BoidsController instance
   */
  static deserialize(data) {
    const controller = new BoidsController(
      data.boundaryX,
      data.boundaryY,
      data.boundaryZ,
      data.subDivisionCount
    );
    controller.aligmentWeight = data.aligmentWeight;
    controller.cohesionWeight = data.cohesionWeight;
    controller.separationWeight = data.separationWeight;
    controller.maxEntitySpeed = data.maxEntitySpeed;
    controller.aligmentRadius = data.aligmentRadius;
    controller.cohesionRadius = data.cohesionRadius;
    controller.separationRadius = data.separationRadius;
    controller.obstacleRadius = data.obstacleRadius;

    data.flockEntities.forEach((entityData) => {
      const entity = Entity.deserialize(entityData);
      controller.addFlockEntity(entity);
    });

    data.obstacleEntities.forEach((entityData) => {
      const entity = Entity.deserialize(entityData);
      controller.addObstacleEntity(entity);
    });

    return controller;
  }
}
/**
 * @module BoidsWorker
 * BoidsWorker is the wrapper for BoidsController to make it work inside a WebWorker context
 * The responsibility of this class is to create a new BoidsController instance with
 * the received data and run the requested iterations in this isolated context.
 */
class BoidsWorker {
  constructor() {
    this.boidsController = undefined;
  }

  /**
   * Initializes the boids controller
   * @param {Object} data
   */
  initializeBoidsController(data) {
    this.boidsController = BoidsController.deserialize(data);
  }

  /**
   * Iterates the BoidsController with the provided parameters
   * @param {Number} start
   * @param {Number} end
   * @param {Object} config
   */
  iterateBoidsController(start, end, config) {
    this.boidsController.aligmentWeight = config.aligmentWeight;
    this.boidsController.cohesionWeight = config.cohesionWeight;
    this.boidsController.separationWeight = config.separationWeight;
    this.boidsController.maxEntitySpeed = config.maxEntitySpeed;

    this.boidsController.iterate(start, end);
    const data = this.boidsController.serializeBoidsData(start, end);
    postMessage({ action: 'iterateCompleted', data });
  }

  /**
   * Updates the internal data of the BoidsController. When other BoidsWorkers have
   * new data, it is send to other workers in order to keep all workers in sync.
   * @param {Object} data
   */
  updateBoidsData(data) {
    this.boidsController.applyBoidsData(data);
  }

  /**
   * Message handler for the worker
   */
  onMessage(e) {
    if (e.data.action == 'initialData') {
      this.initializeBoidsController(e.data.data);
    } else if (e.data.action == 'iterate') {
      this.iterateBoidsController(e.data.start, e.data.end, e.data.config);
    } else if ((e.data.action = 'updateBoidsData')) {
      this.updateBoidsData(e.data.data);
    }
  }
}

// create instance
const worker = new BoidsWorker();
onmessage = worker.onMessage.bind(worker);
