import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader";
import { OrbitControls } from "OrbitControls";
import { RectAreaLightUniformsLib } from "RectAreaLightUniformsLib";

const init = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  const controls = new OrbitControls(camera, renderer.domElement);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const onPointerMove = (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  const onClick = (e) => {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects[0].object.userData === "cone") {
      document.location.href = "https://github.com/su8ject";
    }
  };

  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("click", onClick);

  scene.background = new THREE.Color(0x000000);

  camera.position.set(0, 0, 2.5);

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.enableRotate = true;

  const loader = new GLTFLoader();
  loader.load("./model/scene.gltf", (gltf) => {
    scene.add(gltf.scene);
  });

  let mousePos = { x: 0, y: 0 };

  const handleMouseMove = (event) => {
    let tx = -1 + (event.clientX / window.innerWidth) * 2;
    let ty = -1 + (event.clientY / window.innerHeight) * 2;
    mousePos = { x: tx, y: ty };
  };

  const updateScene = () => {
    scene.position.set(mousePos.x / 4, mousePos.y / 4, 0);
  };

  document.addEventListener("mousemove", handleMouseMove, false);

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  window.addEventListener("resize", onWindowResize, false);

  const lightColor = 0x6c706d;

  {
    const light = new THREE.DirectionalLight(lightColor, 1);
    light.position.set(-2, 0, 10);
    light.lookAt(0, -1, 0);
    scene.add(light);
  }

  {
    const light = new THREE.DirectionalLight(lightColor, 1);
    light.position.set(2, 0, 5);
    light.lookAt(0, 1, 0);
    scene.add(light);
  }

  RectAreaLightUniformsLib.init();
  {
    const rectLight = new THREE.RectAreaLight(lightColor, 1, 100, 100);
    rectLight.position.set(-10, 0, 0);
    rectLight.rotation.y = Math.PI + Math.PI / 4;
    scene.add(rectLight);
  }

  {
    const rectLight = new THREE.RectAreaLight(lightColor, 1, 100, 100);
    rectLight.position.set(10, 0, 0);
    rectLight.rotation.y = Math.PI - Math.PI / 4;
    scene.add(rectLight);
  }

  const gradient = () => {
    const num = Math.floor(Math.random() * 61439) + 4096;
    return "#ff" + num.toString(16);
  };

  const addCone = () => {
    const geometry = new THREE.ConeGeometry(0.1, 0.1, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const cone = new THREE.Mesh(geometry, material);
    cone.position.set(0, 1, 0);
    cone.userData = "cone";
    scene.add(cone);
  };

  addCone();

  const addStar = () => {
    const geometry = new THREE.IcosahedronGeometry(0.1, 1);
    const material = new THREE.MeshStandardMaterial({ color: gradient() });
    const star = new THREE.Mesh(geometry, material);
    const [x, y, z] = Array(3)
      .fill()
      .map(() => THREE.MathUtils.randFloatSpread(90));

    star.position.set(x, y, z);
    scene.add(star);
  };

  Array(400).fill().forEach(addStar);

  const resetMaterials = () => {
    for (let i = 0; i < scene.children.length; i++) {
      if (scene.children[i].material) {
        scene.children[i].material.opacity = 1.0;
      }
    }
  };

  const hoverCone = () => {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    for (let i = 0; i < intersects.length; i++) {
      if (intersects[i].object.userData === "cone") {
        intersects[i].object.material.transparent = true;
        intersects[i].object.material.opacity = 0.5;
      }
    }
  };

  const animate = () => {
    controls.update();
    resetMaterials();
    hoverCone();
    renderer.render(scene, camera);
    updateScene();
    requestAnimationFrame(animate);
  };
  animate();
};
init();
