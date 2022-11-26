import * as THREE from 'three';
export default class Boid {
  constructor(maxSpeed, maxSteerForce) {
    this.setAvoidWalls = (value) => {
      this.avoidWalls = value;
    };
    this.setWorldSize = (width, height, depth) => {
      this.worldSize.width = width;
      this.worldSize.height = height;
      this.worldSize.depth = depth;
    };
    this.run = (boids) => {
      if (this.avoidWalls) {
        // 左の壁からの回避
        this.vector.set(
          -this.worldSize.width,
          this.position.y,
          this.position.z
        );
        this.vector = this.avoid(this.vector);
        this.vector.multiplyScalar(5);
        this.acceleration.add(this.vector);
        // 右の壁からの回避
        this.vector.set(this.worldSize.width, this.position.y, this.position.z);
        this.vector = this.avoid(this.vector);
        this.vector.multiplyScalar(5);
        this.acceleration.add(this.vector);
        // 下の壁からの回避
        this.vector.set(
          this.position.x,
          //-this.worldSize.height,
          // stop before hitting the ground..
          -this.worldSize.height/10,
          this.position.z
        );
        this.vector = this.avoid(this.vector);
        this.vector.multiplyScalar(5);
        this.acceleration.add(this.vector);
        // 上の壁からの回避
        this.vector.set(
          this.position.x,
          this.worldSize.height,
          this.position.z
        );
        this.vector = this.avoid(this.vector);
        this.vector.multiplyScalar(5);
        this.acceleration.add(this.vector);
        // 奥の壁からの回避
        this.vector.set(
          this.position.x,
          this.position.y,
          -this.worldSize.depth
        );
        this.vector = this.avoid(this.vector);
        this.vector.multiplyScalar(5);
        this.acceleration.add(this.vector);
        // 手前の壁からの回避
        this.vector.set(this.position.x, this.position.y, this.worldSize.depth);
        this.vector = this.avoid(this.vector);
        this.vector.multiplyScalar(5);
        this.acceleration.add(this.vector);
      }
      if (Math.random() > 0.5) {
        this.flock(boids);
      }
      this.move();
    };
    // 魚群の制御
    this.flock = (boids) => {
      this.acceleration.add(this.alignment(boids)); // 整列
      this.acceleration.add(this.cohesion(boids)); // 集合
      this.acceleration.add(this.separation(boids)); // 分離
    };
    // 実際の移動の処理
    this.move = () => {
      // 加速度ベクトルを速度ベクトルに加算する
      this.velocity.add(this.acceleration);
      // 速度ベクトルの大きさが一定以上にならないようにする
      const l = this.velocity.length();
      if (l > this.maxSpeed) {
        this.velocity.divideScalar(l / this.maxSpeed);
      }
      // 速度ベクトルを自分の位置に反映する
      this.position.add(this.velocity);
      // 加速度ベクトルをリセットする
      this.acceleration.set(0, 0, 0);
    };
    // 障害物を回避
    this.avoid = (target) => {
      const steer = new THREE.Vector3(); // 自分に働く加速度ベクトル
      // 自分の位置から障害物の位置を引き、回避方向を算出する
      steer.subVectors(this.position, target);
      // 自分の位置と障害物の距離が離れているほど、反比例的に加速度ベクトルを小さくする
      steer.multiplyScalar(1 / this.position.distanceToSquared(target));
      return steer;
    };
    // マウスカーソルを回避
    this.repulse = (target) => {
      // 自分とマウス位置からのベクトルとの距離を計算する
      const distance = this.position.distanceTo(target);
      // 距離が一定以内の場合
      if (distance < 150) {
        const steer = new THREE.Vector3();
        // 自分の位置からマウスカーソルの位置を引き、回避方向に働く加速度ベクトルを計算する
        steer.subVectors(this.position, target);
        // マウスカーソルから距離が離れているほど加速度ベクトルを小さくする
        steer.multiplyScalar(0.5 / distance);
        this.acceleration.add(steer);
      }
    };
    // 整列 仲間と同じ方向に進もうとする
    this.alignment = (boids) => {
      let count = 0;
      const velSum = new THREE.Vector3(); // 群れの個体の速度ベクトルの合計
      for (var i = 0; i < boids.length; i++) {
        if (Math.random() > 0.6) continue;
        const boid = boids[i];
        // 自分とそれ以外の個体との距離を計算する
        const distance = boid.position.distanceTo(this.position);
        // 一定の距離以内であれば同じ群れの個体とみなす
        if (distance > 0 && distance <= this.neighborhoodRadius) {
          velSum.add(boid.velocity);
          count++;
        }
      }
      if (count > 0) {
        // 速度ベクトルの合計を個体数で割り、群れの平均を算出する
        // 求めた速度ベクトルの平均が自分に働く加速度ベクトルとなる
        velSum.divideScalar(count);
        const l = velSum.length();
        // 加速度ベクトルの大きさが一定以上にならないようにする
        if (l > this.maxSteerForce) {
          velSum.divideScalar(l / this.maxSteerForce);
        }
      }
      return velSum;
    };
    // 集合 群れの中心へ向かおうとする
    this.cohesion = (boids) => {
      let count = 0; // 群れの個体数
      const posSum = new THREE.Vector3(); // 群れの個体の位置の合計
      const steer = new THREE.Vector3(); // 自分に働く加速度ベクトル
      for (var i = 0, il = boids.length; i < il; i++) {
        if (Math.random() > 0.6) continue;
        const boid = boids[i];
        // 自分とそれ以外の個体との距離を計算する
        const distance = boid.position.distanceTo(this.position);
        // 一定の距離以内であれば同じ群れの個体とみなす
        if (distance > 0 && distance <= this.neighborhoodRadius) {
          posSum.add(boid.position);
          count++;
        }
      }
      // 位置の合計を個体数で割り、群れの中央位置を算出する
      if (count > 0) {
        posSum.divideScalar(count);
      }
      // 群れの中央位置から自分の位置を引き、群れの中央へ向かう加速度ベクトルを算出する
      steer.subVectors(posSum, this.position);
      // 群れの中央へ向かう加速度ベクトルの大きさが一定以上にならないようにする
      const l = steer.length();
      if (l > this.maxSteerForce) {
        steer.divideScalar(l / this.maxSteerForce);
      }
      return steer;
    };
    // 分離 仲間と距離を保つ
    this.separation = (boids) => {
      const posSum = new THREE.Vector3(); // 他の個体を回避する方向に働く加速度ベクトルの合計
      const repulse = new THREE.Vector3(); // 他の個体を回避する方向に働く加速度ベクトル
      for (var i = 0, il = boids.length; i < il; i++) {
        if (Math.random() > 0.6) continue;
        const boid = boids[i];
        // 自分とそれ以外の個体との距離を計算する
        const distance = boid.position.distanceTo(this.position);
        // 一定の距離以内であれば同じ群れの個体とみなす
        if (distance > 0 && distance <= this.neighborhoodRadius) {
          // 自分の位置から他の個体の位置を引き、回避方向を算出する
          repulse.subVectors(this.position, boid.position);
          repulse.normalize();
          // 他の個体との距離が遠い分、回避方向に働く加速度ベクトルを小さくする
          repulse.divideScalar(distance);
          // 群れ内の全ての個体の影響を受けるため、回避方向に働く加速度ベクトルの合計を算出する
          posSum.add(repulse);
        }
      }
      return posSum;
    };
    this.vector = new THREE.Vector3();
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.maxSpeed = maxSpeed || 4;
    this.maxSteerForce = maxSteerForce || 0.1;
    this.neighborhoodRadius =  70;// 100
    this.worldSize = { width: 500, height: 500, depth: 500 };
    this.avoidWalls = false;
  }
}
