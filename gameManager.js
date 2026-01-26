import * as THREE from 'three';
import { MiniMap } from './minimap.js';
import { initMundo3D, animateMundo3D, getSceneCameraRenderer } from './mundo3D.js';
import { CharacterController } from './characterController.js';
import { CoinManager } from './coins.js';

// --- Inicializar el mundo 3D
initMundo3D();
const { scene, camera, renderer, floorBox, wallBoxes } = getSceneCameraRenderer();

// --- Inicializar jugador
const playerController = new CharacterController(scene, camera, floorBox, wallBoxes);

// Crear minimapa
const minimap = new MiniMap(renderer, scene, null);




// --- Inicializar monedas
// Esperamos un poco hasta que el player se haya cargado
const waitForPlayer = setInterval(() => {
    if (playerController.player) {

        minimap.player = playerController.player;

        // Inicializar marcador del jugador
        const markerGeometry = new THREE.SphereGeometry(0.3, 4, 4);
        const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        minimap.markers.player = new THREE.Mesh(markerGeometry, playerMaterial);
        scene.add(minimap.markers.player);

        //inicializar monedas
        const coinManager = new CoinManager(scene, playerController.player, 15);
        clearInterval(waitForPlayer);

        // --- Loop de animación principal
        function animate() {
            requestAnimationFrame(animate);
            playerController.update();
            coinManager.update();
            animateMundo3D();

            minimap.update();
            minimap.render();
        }
        animate();
    }
}, 100);

// --- Resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});