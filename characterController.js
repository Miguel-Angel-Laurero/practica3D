// characterController.js
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

export class CharacterController {
    constructor(scene, camera, floorBox, wallBoxes) {
        this.scene = scene;
        this.camera = camera;
        this.floorBox = floorBox;
        this.wallBoxes = wallBoxes;

        this.player = null;
        this.mixer = null;
        this.playerBox = null;
        this.animations = {};
        this.loader = new FBXLoader();

        this.speed = 0.05;
        this.velocityY = 0;
        this.gravity = -0.015;
        this.jumpForce = 0.35;

        this.keys = {};
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);

        this.clock = new THREE.Clock();

        this.loadAnimation('Idle', './models/Idle.fbx');
        this.loadAnimation('Walk', './models/Walk.fbx');
        this.loadAnimation('Jump', './models/Jump.fbx');
    }

    loadAnimation(name, path) {
        this.loader.load(path, (fbx) => {
            if (!this.player) {
                this.player = fbx;
                this.player.scale.setScalar(0.01);
                this.player.position.set(10, 0, 10);
                this.player.traverse(c => {
                    if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
                });
                this.scene.add(this.player);
                this.mixer = new THREE.AnimationMixer(this.player);
                this.playerBox = new THREE.Box3().setFromObject(this.player);
            }

            if (fbx.animations.length > 0) {
                const action = this.mixer.clipAction(fbx.animations[0]);
                action.enabled = true;
                this.animations[name] = action;
                if (name === 'Idle') action.play();
            }
        });
    }
    

    setAnimation(name) {
        for (let key in this.animations) {
            if (key === name) this.animations[key].play();
            else this.animations[key].stop();
        }
    }

    update() {
        if (!this.player || !this.playerBox || !this.mixer) return;

        const delta = this.clock.getDelta();
        this.mixer.update(delta);

        // Movimiento
        let moveX = 0, moveZ = 0;
        if (this.keys.ArrowUp) moveZ -= 1;
        if (this.keys.ArrowDown) moveZ += 1;
        if (this.keys.ArrowLeft) moveX -= 1;
        if (this.keys.ArrowRight) moveX += 1;

        const moving = (moveX !== 0 || moveZ !== 0);
        const moveVector = new THREE.Vector3(moveX, 0, moveZ);
        if (moving) moveVector.normalize().multiplyScalar(this.speed);

        // --- Colisión XZ con paredes
        const tempBoxXZ = this.playerBox.clone();
        tempBoxXZ.min.x += moveVector.x;
        tempBoxXZ.max.x += moveVector.x;
        tempBoxXZ.min.z += moveVector.z;
        tempBoxXZ.max.z += moveVector.z;

        let canMove = true;
        for (let wallBox of this.wallBoxes) {
            if (tempBoxXZ.intersectsBox(wallBox)) {
                canMove = false;
                break;
            }
        }

        if (canMove) {
            this.player.position.x += moveVector.x;
            this.player.position.z += moveVector.z;
        }

        // Rotación hacia dirección
        if (moving) {
            const angle = Math.atan2(moveVector.x, moveVector.z);
            const targetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), angle);
            this.player.quaternion.slerp(targetQuat, 0.2);
        }

        // --- Gravedad y salto
        const deltaY = this.velocityY;
        let futureY = this.player.position.y + deltaY;

        const tempBoxY = this.playerBox.clone();
        tempBoxY.min.y += deltaY;
        tempBoxY.max.y += deltaY;

        this.playerBox.setFromObject(this.player);
        const onGround = this.playerBox.intersectsBox(this.floorBox) && this.velocityY <= 0;

        if (this.keys.Space && onGround) this.velocityY = this.jumpForce;

        this.velocityY += this.gravity;

        if (tempBoxY.intersectsBox(this.floorBox)) {
            this.player.position.y = this.floorBox.max.y - (this.playerBox.min.y - this.player.position.y);
            this.velocityY = 0;
        } else {
            this.player.position.y = futureY;
        }

        this.playerBox.setFromObject(this.player);

        // Animaciones
        if (!onGround) this.setAnimation('Jump');
        else if (moving) this.setAnimation('Walk');
        else this.setAnimation('Idle');

        // Cámara TPS
        const offset = new THREE.Vector3(0, 3, 4);
        const camPosition = this.player.position.clone().add(offset);
        this.camera.position.lerp(camPosition, 0.1);
        this.camera.lookAt(this.player.position);
    }
}
