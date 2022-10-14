import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader";
import { OrbitControls } from "OrbitControls";
import { RectAreaLightUniformsLib } from "RectAreaLightUniformsLib";

function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  const controls = new OrbitControls(camera, renderer.domElement);

  scene.background = new THREE.Color(0x111426);

  camera.position.set(0, 0, 2.5);

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls.autoRotate = true;
  controls.autoRotateSpeed = 1;
  controls.enableDamping = true;

  const loader = new GLTFLoader();
  loader.load("./model/scene.gltf", (gltf) => {
    scene.add(gltf.scene);
  });

  function updateCamera() {
    scene.position.set(mousePos.x / 2.5, mousePos.y / 2.5, 0);
  }

  document.addEventListener("mousemove", handleMouseMove, false);

  let mousePos = { x: 0, y: 0 };

  function handleMouseMove(event) {
    let tx = -1 + (event.clientX / window.innerWidth) * 2;
    let ty = -1 + (event.clientY / window.innerHeight) * 2;
    mousePos = { x: tx, y: ty };
  }

  window.addEventListener("resize", onWindowResize, false);

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-2, 0, 10);
    light.lookAt(0, -1, 0);
    scene.add(light);
  }

  {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 0, 5);
    light.lookAt(0, 1, 0);
    scene.add(light);
  }

  RectAreaLightUniformsLib.init();
  {
    const rectLight = new THREE.RectAreaLight(0xffffff, 1, 100, 100);
    rectLight.position.set(-10, 0, 0);
    rectLight.rotation.y = Math.PI + Math.PI / 4;
    scene.add(rectLight);
  }

  {
    const rectLight = new THREE.RectAreaLight(0xffffff, 1, 100, 100);
    rectLight.position.set(10, 0, 0);
    rectLight.rotation.y = Math.PI - Math.PI / 4;
    scene.add(rectLight);
  }

  function addStar() {
    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);
    const [x, y, z] = Array(3)
      .fill()
      .map(() => THREE.MathUtils.randFloatSpread(90));

    star.position.set(x, y, z);
    scene.add(star);
  }

  Array(400).fill().forEach(addStar);

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    updateCamera();
    requestAnimationFrame(animate);
  }
  animate();
}
init();
