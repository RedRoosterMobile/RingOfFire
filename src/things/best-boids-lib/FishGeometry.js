import * as THREE from 'three';
class FishGeometry extends THREE.BufferGeometry {
  constructor(size = 1) {
    super();
    const vertices = new Float32Array(
      [
        [0, 1, 0],
        [0, 0, 0.5],
        [1.5, 0, 0],
        [0, 0, 0.5],
        [0, -1, 0],
        [1.5, 0, 0],
        [0, -1, 0],
        [0, 0, -0.5],
        [1.5, 0, 0],
        [0, 0, -0.5],
        [0, 1, 0],
        [1.5, 0, 0],
        [0, 1, 0],
        [0, 0, -0.5],
        [-2.0, 0, 0],
        [0, 0, -0.5],
        [0, -1, 0],
        [-2.0, 0, 0],
        [0, -1, 0],
        [0, 0, 0.5],
        [-2.0, 0, 0],
        [0, 0, 0.5],
        [0, 1, 0],
        [-2.0, 0, 0],
      ]
        .flat()
        .map((position) => position * size)
    );
    this.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    this.computeVertexNormals();
  }
}
export default FishGeometry;
