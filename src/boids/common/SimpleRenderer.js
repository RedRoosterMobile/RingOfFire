import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
/**
 * @module SimpleRenderer
 * SimpleRenderer helps visualizing the entities in the BoidsController and controls the camera.
 */
export default class SimpleRenderer {
  constructor({ boidsController }) {
    this.boidsController = boidsController;
    const b = this.boidsController.getBoundary();
  }

  init(aGroup) {
    //this.camera.position.z = 0;

    this.scene = aGroup;
    // this.scene.background = new THREE.Color(0xffffff);

    this.entityGeometry = new THREE.BoxGeometry(1, 1, 2.5);
    this.obstacleGeometry = new THREE.SphereGeometry(5, 15, 15);
    this.entityMaterial = new THREE.MeshNormalMaterial();

    this.obstacleMaterial = new THREE.MeshNormalMaterial();

    this.createGridVisual(this.boidsController.subDivisionCount);

    // create boundary
    const b = this.boidsController.getBoundary();
    const geometry = new THREE.BoxGeometry(b[0], b[1], b[2]);
    const wireframe = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);
    line.material.color = new THREE.Color(0x000000);
    line.material.transparent = false;
    line.position.x = b[0] / 2;
    line.position.y = b[1] / 2;
    line.position.z = b[2] / 2;
    this.scene.add(line);

    //this.renderer.setSize(window.innerWidth, window.innerHeight);
    //document.body.appendChild(this.renderer.domElement);
    this.render();
  }

  createGridVisual(subdivisionCount) {
    this.gridVisual = new THREE.Group();
    const b = this.boidsController.getBoundary();
    const maxLen = Math.max(b[0], b[1], b[2]);
    const len = maxLen / subdivisionCount;
    for (let x = 0; x < subdivisionCount; x++) {
      for (let y = 0; y < subdivisionCount; y++) {
        for (let z = 0; z < subdivisionCount; z++) {
          if (
            (x + 0.5) * len > b[0] ||
            (y + 0.5) * len > b[1] ||
            (z + 0.5) * len > b[2]
          ) {
            continue;
          }

          // create boundary wireframe
          const geometry = new THREE.BoxGeometry(len, len, len);
          const wireframe = new THREE.EdgesGeometry(geometry);
          const line = new THREE.LineSegments(wireframe);
          //line.material.depthTest = false;
          line.material.color = new THREE.Color(0x999999);
          line.material.transparent = false;
          line.position.x = len / 2 + x * len;
          line.position.y = len / 2 + y * len;
          line.position.z = len / 2 + z * len;
          this.gridVisual.add(line);
        }
      }
    }

    this.scene.add(this.gridVisual);
    this.gridVisual.visible = true;
  }

  render() {
    const entities = this.boidsController.getFlockEntities();
    let count = 0;
    entities.forEach((entity) => {
      count++;
      const x = entity.x;
      const y = entity.y;
      const z = entity.z;
      const vx = entity.vx;
      const vy = entity.vy;
      const vz = entity.vz;
      let mesh = entity.mesh;
      if (!mesh) {
        console.log('adding mesh in render');
        mesh = new THREE.Mesh(this.entityGeometry, this.entityMaterial);
        mesh.localVelocity = { x: 0, y: 0, z: 0 };
        this.scene.add(mesh);
        entity.mesh = mesh;
      }

      // apply asymptotic smoothing
      mesh.position.x = 0.9 * mesh.position.x + 0.1 * x;
      mesh.position.y = 0.9 * mesh.position.y + 0.1 * y;
      mesh.position.z = 0.9 * mesh.position.z + 0.1 * z;
      mesh.localVelocity.x = 0.9 * mesh.localVelocity.x + 0.1 * vx;
      mesh.localVelocity.y = 0.9 * mesh.localVelocity.y + 0.1 * vy;
      mesh.localVelocity.z = 0.9 * mesh.localVelocity.z + 0.1 * vz;
      //console.log(mesh.localVelocity);
      if (count == 1) {
        count = 0;
        const vecc = [
          mesh.position.x + mesh.localVelocity.x,
          mesh.position.y + mesh.localVelocity.y,
          mesh.position.z + mesh.localVelocity.z,
        ];
      }
      mesh.lookAt(
        mesh.position.x + mesh.localVelocity.x,
        mesh.position.y + mesh.localVelocity.y,
        mesh.position.z + mesh.localVelocity.z
      );
      /*
      mesh.lookAt(
        0,0,0
      );*/
    });

    const obstacles = this.boidsController.getObstacleEntities();
    obstacles.forEach((entity) => {
      const x = entity.x;
      const y = entity.y;
      const z = entity.z;
      let mesh = entity.mesh;
      if (!mesh) {
        mesh = new THREE.Mesh(this.obstacleGeometry, this.obstacleMaterial);
        this.scene.add(mesh);
        entity.mesh = mesh;
      }

      mesh.position.x = x;
      mesh.position.y = y;
      mesh.position.z = z;
    });

    //this.renderer.render(this.scene, this.camera);
  }
}
