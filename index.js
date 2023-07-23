import * as THREE from "three";
import {GLTFLoader} from "GLTFLoader";
import {OrbitControls} from "OrbitControls";
import {RectAreaLightUniformsLib} from "RectAreaLightUniformsLib";

const init = () => {
    const objArr = [];
    const objNameArr = [];
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    const controls = new OrbitControls(camera, renderer.domElement);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerMove = (event) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const onClick = () => {
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects[0] !== undefined) {
            if (intersects[0].object.userData === "GitHub") {
                window.open("https://github.com/su8ject");
            }
            if (intersects[0].object.userData === "ResponsiveLayout") {
                window.open("https://su8ject.github.io/lerning/3/");
            }
            if (intersects[0].object.userData === "HoneyStoreHTML") {
                window.open("https://su8ject.github.io/lerning/4/");
            }
            if (intersects[0].object.userData === "HoneyStoreReact") {
                window.open("https://su8ject.github.io/honey/dist/#/");
            }
            if (intersects[0].object.userData === "RickAndMorty") {
                window.open("https://su8ject.github.io/rick-and-morty/dist/#/");
            }
            if (intersects[0].object.userData === "ToDo") {
                window.open("https://su8ject.github.io/to-do/dist/#/");
            }
        }
    };

    controls.addEventListener("change", () => {
        onCameraChange();
    });

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
    controls.enableRotate = false;
    controls.enablePan = false;
    controls.maxPolarAngle = 3.141592653589793 / 2;
    controls.minPolarAngle = 3.141592653589793 / 2;

    const loader = new GLTFLoader();
    loader.load("./model/scene.gltf", (gltf) => {
        scene.add(gltf.scene);
        document.querySelector(".wrapper-loader").remove();
        addActive("ResponsiveLayout");
        addActive("ToDo");
        addActive("RickAndMorty");
    }, (error) => {
        console.log(error, "An error happened");
    },);

    let mousePos = {x: 0, y: 0};

    const updateScene = () => {
        scene.position.set(mousePos.x / 4, mousePos.y / 4, 0);
    };

    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", onWindowResize, false);

    const lightColor = 0x6c706d;

    const addLight = (x, y, z, lx, ly, lz) => {
        const light = new THREE.DirectionalLight(lightColor, 1);
        light.position.set(x, y, z);
        light.lookAt(lx, ly, lz);
        scene.add(light);
    };

    addLight(-2, 0, 10, 0, -1, 0);
    addLight(2, 0, 10, 0, 1, 0);

    RectAreaLightUniformsLib.init();

    const addReactLight = (x, y, z) => {
        const rectLight = new THREE.RectAreaLight(lightColor, 1, 100, 100);
        rectLight.position.set(x, y, z);
        if (x > 0) {
            rectLight.rotation.y = Math.PI - Math.PI / 4;
        } else {
            rectLight.rotation.y = Math.PI + Math.PI / 4;
        }
        scene.add(rectLight);
    };

    addReactLight(-10, 0, 0);
    addReactLight(10, 0, 0);

    const gradient = () => {
        const num = Math.floor(Math.random() * 61439) + 4096;
        return "#ff" + num.toString(16);
    };

    const addSphere = (x, y, z, name, id) => {
        const geometry = new THREE.SphereGeometry(0.04, 32, 16);
        const material = new THREE.MeshLambertMaterial({
            color: 0xf3ffe2, emissive: 0x820000,
        });
        const coneMesh = new THREE.Mesh(geometry, material);
        coneMesh.position.set(x, y, z);
        coneMesh.userData = `${name}`;

        scene.add(coneMesh);

        const divElem = document.createElement("span");
        divElem.style.position = "absolute";
        divElem.classList = "name";
        divElem.innerHTML = `${name}`;
        divElem.id = `${id}`;
        document.body.appendChild(divElem);
        const divObj = new THREE.Object3D();

        divObj.position.set(0, 0.15, 0);
        coneMesh.add(divObj);

        objNameArr.push(`${name}`);

        let objData = {
            name: `${name}`, mesh: coneMesh, divElem: divElem, divObj: divObj,
        };
        objArr.push(objData);
    };

    addSphere(-0.6, 0.4, -0.7, "GitHub", "GitHub");
    addSphere(0.4, -0.7, 0.6, "ResponsiveLayout", "ResponsiveLayout");
    addSphere(1, 0, 0, "HoneyStoreHTML", "HoneyStoreHTML");
    addSphere(0.7, 0.6, -0.4, "HoneyStoreReact", "HoneyStoreReact");
    addSphere(-0.6, -0.4, 0.7, "RickAndMorty", "RickAndMorty");
    addSphere(0.2, 0.3, 0.93, "ToDo", "ToDo");

    const onCameraChange = () => {
        objArr.forEach((objData) => {
            let proj = toScreenPosition(objData.divObj, camera);

            objData.divElem.style.left = proj.x + "px";
            objData.divElem.style.top = proj.y + "px";
        });
    };

    const toScreenPosition = (obj, camera) => {
        let vector = new THREE.Vector3();
        let widthHalf = 0.5 * window.innerWidth;
        let heightHalf = 0.5 * window.innerHeight;

        obj.updateMatrixWorld();
        vector.setFromMatrixPosition(obj.matrixWorld);
        vector.project(camera);

        vector.x = vector.x * widthHalf + widthHalf;
        vector.y = -(vector.y * heightHalf) + heightHalf;

        return {
            x: vector.x, y: vector.y,
        };
    };

    const addStar = () => {
        const geometry = new THREE.IcosahedronGeometry(0.06, 1);
        const material = new THREE.MeshStandardMaterial({color: gradient()});
        const star = new THREE.Mesh(geometry, material);
        const [x, y, z] = Array(3)
            .fill()
            .map(() => THREE.MathUtils.randFloatSpread(90));

        star.position.set(x, y, z);
        scene.add(star);
    };

    Array(200).fill().forEach(addStar);

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
            if (objNameArr.includes(intersects[i].object.userData)) {
                document.querySelector(`#${intersects[i].object.userData}`).classList.add("hover");
                intersects[i].object.material.transparent = true;
                intersects[i].object.material.opacity = 0.5;

                const removeHover = () => {
                    document.querySelector(`#${intersects[i].object.userData}`).classList.remove("hover");
                };

                setTimeout(removeHover, 500);
            }
        }
    };

    const removeActive = (id) => {
        document.querySelector(`#${id}`).classList.remove("active");
    };

    const addActive = (id) => {
        document.querySelector(`#${id}`).classList.add("active");
    };

    const visibilityOfNames = () => {
        if (camera.position.x >= 0 && camera.position.z >= 0) {
            if (camera.position.x > 2.4) {
                addActive("ToDo");
            }
            if (camera.position.x > 1.4 && camera.position.x < 1.5 && camera.position.z > 2) {
                addActive("RickAndMorty");
            }
            if (camera.position.x < 1.6) {
                removeActive("HoneyStoreReact");
            }
            if (camera.position.x < 0.4) {
                removeActive("HoneyStoreHTML");
            }
        } else if (camera.position.x >= 0 && camera.position.z < 0) {
            if (camera.position.x > 1.6) {
                removeActive("GitHub");
            }
            if (camera.position.x > 2.3) {
                addActive("ResponsiveLayout");
            }
            if (camera.position.x > 0.6) {
                addActive("HoneyStoreHTML");
            }
        } else if (camera.position.x < 0 && camera.position.z >= 0) {
            if (camera.position.x < -2.2) {
                addActive("GitHub");
            }
            if (camera.position.x < -1.7) {
                removeActive("ResponsiveLayout");
            }
            if (camera.position.x < -2.2) {
                removeActive("ToDo");
            }
        } else if (camera.position.x < 0 && camera.position.z < 0) {
            if (camera.position.x > -2.2) {
                removeActive("RickAndMorty");
            }
            if (camera.position.x > -0.7) {
                addActive("HoneyStoreReact");
            }
        }
    };

    const returnSpeed = () => {
        const normalRotateSpeed = () => {
            controls.autoRotateSpeed = 0.5;
        };

        setTimeout(normalRotateSpeed, 100);
    };

    const onWheel = (e) => {
        if (e.deltaY > 0) {
            controls.autoRotateSpeed = 60;
        }
        returnSpeed();

        lastActiveTime = new Date().getTime();
    };

    window.addEventListener("wheel", onWheel);

    const keyHandle = (e) => {
        if (e.key === "ArrowRight") {
            controls.autoRotateSpeed = 60;
        }
        returnSpeed();

        lastActiveTime = new Date().getTime();
    };

    window.addEventListener("keydown", keyHandle);

    const hint = document.querySelector(".hint");

    const showHint = () => {
        hint.classList.add("active");
    };

    const hideHint = () => {
        hint.classList.remove("active");
    };

    const addPulseToHint = () => {
        hint.classList.add("pulse");
    };

    const removePulseToHint = () => {
        hint.classList.remove("pulse");
    };

    let lastActiveTime = new Date().getTime();

    const animationHint = () => {
        const currentTime = new Date().getTime();

        if (currentTime - lastActiveTime > 5000) {
            showHint();
        } else {
            hideHint();
        }

        if (currentTime - lastActiveTime > 8000) {
            addPulseToHint();
        } else {
            removePulseToHint();
        }
    };

    const animate = () => {
        animationHint();
        visibilityOfNames();
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
