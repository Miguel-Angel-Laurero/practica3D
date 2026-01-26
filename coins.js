import * as THREE from 'three';

export class CoinManager {
    constructor(scene, player, count = 10, counterDivId = 'coinCounter') {
        this.scene = scene;
        this.player = player;
        this.coins = [];
        this.coinCount = 0;

        // Div de interfaz
        this.coinCounterDiv = document.getElementById(counterDivId);
        if (this.coinCounterDiv) this.updateCounter();

        // Generar monedas
        this.spawnCoins(count);
    }

    spawnCoins(count) {
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        const coinMarker = new THREE.Mesh(geometry, material);
        
        for (let i = 0; i < count; i++) {
            const coin = new THREE.Mesh(geometry, material);
            coin.position.set(
                (Math.random() - 0.5) * 40, // dentro del escenario (-20,20)
                0.3,
                (Math.random() - 0.5) * 40
            );
            coin.castShadow = true;
            coin.receiveShadow = true;
            coinMarker.position.copy(coin.position);
            this.scene.add(coin);
            this.scene.add(coinMarker);
            this.coins.push(coin);
            if (this.minimap) this.minimap.markers.coins.push(coinMarker);
        }
    }

    update() {
        this.checkCollision();
        this.animateCoins();
    }

    checkCollision() {
        const playerBox = new THREE.Box3().setFromObject(this.player);
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            const coinBox = new THREE.Box3().setFromObject(coin);
            if (playerBox.intersectsBox(coinBox)) {
                // Recolectada
                this.scene.remove(coin);
                this.coins.splice(i, 1);
                this.coinCount++;
                this.updateCounter();
            }
        }
    }

    updateCounter() {
        if (this.coinCounterDiv) {
            this.coinCounterDiv.textContent = `Monedas: ${this.coinCount}`;
        }
    }

    animateCoins() {
        // Giro sencillo para que se vea más dinámico
        this.coins.forEach(coin => {
            coin.rotation.y += 0.5;
        });
    }
}
