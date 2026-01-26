
import * as THREE from 'three';

export class MiniMap {
    constructor(renderer, scene, player) {
        this.renderer = renderer;
        this.scene = scene;
        this.player = player;
        this.markers = {
            player: null,
            coins: []
        };

        // Crear cámara cenital ortográfica
        const frustumSize = 40;
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.OrthographicCamera(
            -frustumSize * aspect / 2,
             frustumSize * aspect / 2,
             frustumSize / 2,
            -frustumSize / 2,
            0.1,
            100
        );
        this.camera.position.set(0, 50, 0); // alto para vista superior
        this.camera.up.set(0, 0, -1);      // orientar "arriba" en Z negativo
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        window.addEventListener('resize', () => this.onWindowResize());
        this.onWindowResize();
    }

    onWindowResize() {
        const frustumSize = 50;
        const aspect = window.innerWidth / window.innerHeight;
        this.camera.left = -frustumSize * aspect / 2;
        this.camera.right = frustumSize * aspect / 2;
        this.camera.top = frustumSize / 2;
        this.camera.bottom = -frustumSize / 2;
        this.camera.updateProjectionMatrix();
    }

    update() {
        if (!this.player) return;

        // // Seguir al jugador
        // this.camera.position.x = this.player.position.x;
        // this.camera.position.z = this.player.position.z;
        // this.camera.position.y = 12; // altura fija
        // this.camera.lookAt(
        //     this.player.position.x,
        //     0,
        //     this.player.position.z
        // );
            // Actualizar marcador del jugador
        if (this.markers.player) {
            this.markers.player.position.x = this.player.position.x;
            this.markers.player.position.z = this.player.position.z;
            this.markers.player.position.y = 5; // altura visible
        }
    }

    render() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const mapWidth = width / 5;   // tamaño del minimapa
        const mapHeight = height / 5;

        this.renderer.clearDepth();           // importante para no sobreescribir la cámara principal
        this.renderer.setScissorTest(true);
        this.renderer.setScissor(width - mapWidth - 10, 10, mapWidth, mapHeight);
        this.renderer.setViewport(width - mapWidth - 10, 10, mapWidth, mapHeight);

        this.renderer.render(this.scene, this.camera);

        this.renderer.setScissorTest(false);
        this.renderer.setViewport(0, 0, width, height); // restaurar viewport principal
    }
}
