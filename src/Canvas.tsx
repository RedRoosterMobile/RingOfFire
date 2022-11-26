import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Boid from "../libs/Boid";
import FishGeometry from "../libs/FishGeometry";

export default function Canvas() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // キャンバスサイズを指定
    const width = 960;
    const hight = 540;

    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, hight);

    // レンダラー：シャドウを有効にする
    renderer.shadowMap.enabled = true;

    const elm = ref.current;
    elm?.appendChild(renderer.domElement);

    // シーンを作成
    const scene = new THREE.Scene();

    // カメラを作成 THREE.PerspectiveCamera(画角, アスペクト比, 描画開始距離, 描画終了距離)
    const camera = new THREE.PerspectiveCamera(75, width / hight, 1, 10000);
    // カメラコントローラーを作成
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 500);
    controls.update();

    // カメラ移動に慣性を持たせる
    controls.enableDamping = true;
    controls.dampingFactor = 0.5;

    // 平行光源を作成
    const lights = [];
    lights[0] = new THREE.DirectionalLight(0xffffff, 1);
    lights[0].position.set(1, 0, 0);
    lights[1] = new THREE.DirectionalLight(0x11e8bb, 1);
    lights[1].position.set(0.75, 1, 0.5);
    lights[2] = new THREE.DirectionalLight(0x8200c9, 1);
    lights[2].position.set(-0.75, -1, 0.5);
    scene.add(lights[0]);
    scene.add(lights[1]);
    scene.add(lights[2]);

    // 環境光源を作成
    const ambientLight = new THREE.AmbientLight(0x999999, 0.5);
    scene.add(ambientLight);

    // 魚群を作成
    const fishes: THREE.Mesh[] = [];
    const boids: Boid[] = [];
    const fishNum = 100;
    for (var i = 0; i < fishNum; i++) {
      boids[i] = new Boid(4, 0.05);
      const boid = boids[i];
      boid.position.x = Math.random() * 400 - 200;
      boid.position.y = Math.random() * 400 - 200;
      boid.position.z = Math.random() * 400 - 200;
      boid.velocity.x = Math.random() * 2 - 1;
      boid.velocity.y = Math.random() * 2 - 1;
      boid.velocity.z = Math.random() * 2 - 1;
      boid.setAvoidWalls(true);
      boid.setWorldSize(500, 500, 400);

      const geometry = new FishGeometry(10);
      const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
      fishes[i] = new THREE.Mesh(geometry, material);

      scene.add(fishes[i]);
    }

    // スカイドームを作成
    const uniforms = {
      topColor: { value: new THREE.Color(0x11e8bb) },
      bottomColor: { value: new THREE.Color(0x8200c9) },
      offset: { value: 0.5 },
      exponent: { value: 1.0 }
    };

    const skyGeo = new THREE.SphereGeometry(4000, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: `
      varying vec3 vWorldPosition;

			void main() {

				vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
				vWorldPosition = worldPosition.xyz;

				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			}
      `,
      fragmentShader: `
      uniform vec3 topColor;
			uniform vec3 bottomColor;
			uniform float offset;
			uniform float exponent;

			varying vec3 vWorldPosition;

			void main() {

				float h = normalize( vWorldPosition ).y + offset;
				gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h, 0.0 ), exponent ), 0.0 ) ), 1.0 );

			}
      `,
      side: THREE.BackSide
    });

    //const sky = new THREE.Mesh(skyGeo, skyMat);
    //scene.add(sky);

    // アニメーション
    function tick() {
      for (let i = 0; i < boids.length; i++) {
        const boid = boids[i];
        boid.run(boids);

        const fish = fishes[i];
        fish.position.copy(boids[i].position);

        fish.rotation.y = Math.atan2(-boid.velocity.z, boid.velocity.x);
        fish.rotation.z = Math.asin(boid.velocity.y / boid.velocity.length());
      }

      // カメラコントローラーを更新
      controls.update();

      // レンダリング
      renderer.render(scene, camera);

      requestAnimationFrame(tick);
    }

    // 初回実行
    tick();

    function onMouseMove(event: MouseEvent) {
      // 取得したスクリーン座標を-1〜1に正規化する（WebGLは-1〜1で座標が表現される）
      const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      // console.log(mouseX);
      // console.log(mouseY);

      // マウス位置
      const position = new THREE.Vector3(mouseX, mouseY, -1).unproject(camera);
      // マウス位置から画面奥方向への単位ベクトル
      const vector = position.clone();
      vector.sub(camera.position).normalize();

      for (let i = 0; i < boids.length; i++) {
        const boid = boids[i];
        // 画面奥方向へのベクトルに個体の位置から垂線を引いた時にできる交点との距離
        const length = vector.clone().dot(boid.position.clone().sub(position));

        const target = position
          .clone()
          .add(vector.clone().multiplyScalar(length));
        boid.repulse(target);
      }
    }

    window.addEventListener("mousemove", onMouseMove);

    function onResize() {
      // サイズを取得
      const width = window.innerWidth;
      const height = window.innerHeight;

      // レンダラーのサイズを変更
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);

      // カメラのアスペクト比を変更
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    // リサイズイベント発生時に実行
    window.addEventListener("resize", onResize);

    // キャンバスサイズを初期化
    onResize();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      elm?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={ref} />;
}
