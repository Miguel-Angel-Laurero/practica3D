import * as THREE from 'three';

let scene, camera, renderer;
let floor, floorBox;
let wallBoxes = [];

export function initMundo3D() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Luces
    scene.add(new THREE.AmbientLight(0x666666));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);


    
    // Suelo
    // Cargar texturas
    const textureLoader = new THREE.TextureLoader();
    const colorMap = textureLoader.load('./textures/floor_color.jpg');
    const normalMap = textureLoader.load('./textures/floor_normal.jpg');
    const roughnessMap = textureLoader.load('./textures/floor_roughness.jpg');

    // Crear material con mapas
    const floorMaterial = new THREE.MeshStandardMaterial({
        map: colorMap,
        normalMap: 0,
        roughnessMap: 0,
        roughness: 0,
        metalness: 0
});
    floor = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),floorMaterial
    );
    floor.rotation.x = -Math.PI/2;
    floor.receiveShadow = true;
    scene.add(floor);
    floorBox = new THREE.Box3().setFromObject(floor);

    // Paredes
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const wallHeight = 6;
    const wallThickness = 1;

    function createWall(x, y, z, sx, sy, sz) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), wallMaterial);
        wall.position.set(x, y, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);

        const box = new THREE.Box3().setFromObject(wall);
        wallBoxes.push(box);
    }

    createWall(0, wallHeight/2, -25, 50, wallHeight, wallThickness);
    createWall(0, wallHeight/2, 25, 50, wallHeight, wallThickness);
    createWall(-25, wallHeight/2, 0, wallThickness, wallHeight, 50);
    createWall(25, wallHeight/2, 0, wallThickness, wallHeight, 50);

   // Columnas opcionales con antorchas
const columnMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
const torchMaterial = new THREE.MeshStandardMaterial({ color: 0xff8c00 }); // naranja fuego

for (let x = -15; x <= 15; x += 15) {
    for (let z = -15; z <= 15; z += 15) {
        // Crear columna
        const column = new THREE.Mesh(
            new THREE.CylinderGeometry(0.7, 0.7, wallHeight, 16),
            columnMaterial
        );
        column.position.set(x+6, wallHeight / 2, z+6);
        column.castShadow = true;
        column.receiveShadow = true;
        scene.add(column);
        wallBoxes.push(new THREE.Box3().setFromObject(column));

        // --- Antorcha
        const torch = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 8, 8), 
            torchMaterial
        );
        torch.position.set(0, wallHeight / 2 + 1, 0); // encima de la columna
        column.add(torch); // torch es hija de la columna

        // Luz puntual para simular fuego
        const light = new THREE.PointLight(0xffa500, 1, 8, 2); // color, intensidad, alcance, decay
        light.position.set(0, 0, 0); // en el centro de la esfera
        torch.add(light);

        // Opcional: animar luz para efecto parpadeo
        light.userData.baseIntensity = 1;
        light.userData.clock = 0;
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
