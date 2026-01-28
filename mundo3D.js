// mundo3D.js
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

let scene, camera, renderer;
let floor, floorBox;
let wallBoxes = [];

export function initMundo3D() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // --- Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('game-container').appendChild(renderer.domElement);

    // --- Cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // --- Luces
    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // --- Suelo
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    floorBox = new THREE.Box3().setFromObject(floor);

    // --- Paredes
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const wallHeight = 6;
    const wallThickness = 1;

    function createWall(x, y, z, sx, sy, sz) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), wallMaterial);
        wall.position.set(x, y, z);
        wall.castShadow = false;
        wall.receiveShadow = false;
        scene.add(wall);

        wallBoxes.push(new THREE.Box3().setFromObject(wall));
    }

    createWall(0, wallHeight / 2, -25, 50, wallHeight, wallThickness);
    createWall(0, wallHeight / 2, 25, 50, wallHeight, wallThickness);
    createWall(-25, wallHeight / 2, 0, wallThickness, wallHeight, 50);
    createWall(25, wallHeight / 2, 0, wallThickness, wallHeight, 50);

    // --- Columnas y antorchas
    const columnMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });

    // Texturas para la antorcha
    const textureLoader = new THREE.TextureLoader();
    const diffuseMap = textureLoader.load('./models/assets/Torch/Torch1_lambert1_AlbedoTransparency.png');


    const torchMaterial = new THREE.MeshStandardMaterial({
        map: diffuseMap
    });

    const fbxLoader = new FBXLoader();

    for (let x = -15; x <= 15; x += 15) {
        for (let z = -15; z <= 15; z += 15) {
            // Columna
            const column = new THREE.Mesh(
                new THREE.CylinderGeometry(0.7, 0.7, wallHeight, 16),
                columnMaterial
            );
            column.position.set(x + 6, wallHeight / 2, z + 6);
            column.castShadow = true;
            column.receiveShadow = true;
            scene.add(column);
            wallBoxes.push(new THREE.Box3().setFromObject(column));

            // Antorcha (FBX)
            fbxLoader.load('./models/assets/Torch/Torch1.fbx', (torch) => {
                torch.traverse(c => {
                    if (c.isMesh) {
                        c.castShadow = true;
                        c.receiveShadow = true;
                        c.material = torchMaterial;
                    }
                });

                torch.scale.setScalar(0.15);
                torch.rotation.y = -Math.PI / 2;  // girar 90 grados en Y
                torch.position.set(-1, wallHeight / 30, 0);
                column.add(torch);

                // Luz puntual dentro del FBX
                const light = new THREE.PointLight(0xffa500, 5, 8, 2);
                light.position.set(0, 3, 0.5);
                torch.add(light);

                light.userData.baseIntensity = 1;
                light.userData.clock = 0;
            });
        }
    }
}

export function animateMundo3D() {
    // Animar luces de antorchas
    scene.traverse(obj => {
        if (obj.isPointLight && obj.parent) {
            obj.userData.clock += 0.05;
            obj.intensity = obj.userData.baseIntensity + Math.sin(obj.userData.clock * 10) * 0.3;
        }
    });

    renderer.render(scene, camera);
}

export function getSceneCameraRenderer() {
    return { scene, camera, renderer, floorBox, wallBoxes };
}
