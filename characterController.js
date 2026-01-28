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

        // ===== MOVIMIENTO =====
        this.walkSpeed = 0.05;
        this.runSpeed = 0.1;
        this.currentSpeed = this.walkSpeed;

        this.keys = {};

        // ===== CÁMARA TPS =====
        this.yaw = 0;
        this.pitch = 0;
        this.mouseSensitivity = 0.002;
        this.minPitch = -0.5;
        this.maxPitch = 0.8;
        this.cameraDistance = 4;
        this.cameraHeight = 2.5;

        // ===== INPUT TECLADO =====
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this.currentSpeed = this.runSpeed;
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this.currentSpeed = this.walkSpeed;
            }
        });

        // ===== POINTER LOCK / RATÓN =====
        document.body.addEventListener('click', () => {
            document.body.requestPointerLock();
        });

        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement !== document.body) return;

            this.yaw   -= e.movementX * this.mouseSensitivity;
            this.pitch -= e.movementY * this.mouseSensitivity;
            this.pitch = THREE.MathUtils.clamp(this.pitch, this.minPitch, this.maxPitch);
        });

        this.clock = new THREE.Clock();

        // ===== ANIMACIONES =====
        this.loadAnimation('Idle', './models/Idle.fbx');
        this.loadAnimation('Walk', './models/Walk.fbx');
        this.loadAnimation('Run', './models/Run.fbx');
    }

    loadAnimation(name, path) {
        this.loader.load(path, (fbx) => {
            if (!this.player) {
                this.player = fbx;
                this.player.scale.setScalar(0.01);
                this.player.position.set(10, this.floorBox.max.y, 10);

                this.player.traverse(c => {
                    if (c.isMesh) {
                        c.castShadow = true;
                        c.receiveShadow = true;
                    }
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
        for (const key in this.animations) {
            if (key === name) this.animations[key].play();
            else this.animations[key].stop();
        }
    }

    update() {
        if (!this.player || !this.playerBox || !this.mixer) return;

        const delta = this.clock.getDelta();
        this.mixer.update(delta);

        // ===== MOVIMIENTO RELATIVO A CÁMARA =====
        const forward = new THREE.Vector3(
            Math.sin(this.yaw),
            0,
            Math.cos(this.yaw)
        ).normalize();

        const right = new THREE.Vector3(
            Math.cos(this.yaw),
            0,
           -Math.sin(this.yaw)
        ).normalize();

        let moveDir = new THREE.Vector3();
        if (this.keys.ArrowUp)    moveDir.sub(forward);
        if (this.keys.ArrowDown)  moveDir.add(forward);
        if (this.keys.ArrowLeft)  moveDir.sub(right);
        if (this.keys.ArrowRight) moveDir.add(right);

        // WASD
        if (this.keys.KeyW) moveDir.sub(forward);
        if (this.keys.KeyS) moveDir.add(forward);
        if (this.keys.KeyA) moveDir.sub(right);
        if (this.keys.KeyD) moveDir.add(right);

        const moving = moveDir.length() > 0;
        if (moving) moveDir.normalize().multiplyScalar(this.currentSpeed);

        // ===== COLISIÓN XZ =====
        const tempBox = this.playerBox.clone();
        tempBox.min.x += moveDir.x;
        tempBox.max.x += moveDir.x;
        tempBox.min.z += moveDir.z;
        tempBox.max.z += moveDir.z;

        let canMove = true;
        for (const wallBox of this.wallBoxes) {
            if (tempBox.intersectsBox(wallBox)) {
                canMove = false;
                break;
            }
        }

        if (canMove) {
            this.player.position.add(moveDir);
        }

        this.playerBox.setFromObject(this.player);

        // ===== ROTAR PERSONAJE =====
        if (moving) {
            const angle = Math.atan2(moveDir.x, moveDir.z);
            const targetQuat = new THREE.Quaternion()
                .setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
            this.player.quaternion.slerp(targetQuat, 0.2);
        }

        // ===== ANIMACIONES =====
        if (moving && this.currentSpeed === this.runSpeed) {
            this.setAnimation('Run');
        } else if (moving) {
            this.setAnimation('Walk');
        } else {
            this.setAnimation('Idle');
        }

        // ===== CÁMARA TPS =====
        const camOffset = new THREE.Vector3(
            Math.sin(this.yaw) * this.cameraDistance,
            this.cameraHeight + this.pitch * 2,
            Math.cos(this.yaw) * this.cameraDistance
        );

        const camPos = this.player.position.clone().add(camOffset);
        this.camera.position.lerp(camPos, 0.15);
        this.camera.lookAt(
            this.player.position.x,
            this.player.position.y + 1.5,
            this.player.position.z
        );
    }
}
