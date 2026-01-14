 import * as THREE from 'three';
 // Escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // cielo azul

    // Cámara
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);

    // Renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Luz direccional (como el sol)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Suelo
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const floorY = 0;
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);


    // Cubo
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff6347 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.y = 1;
    cube.add(camera);
    camera.position.set(0, 4, 8);
    scene.add(cube);

    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        Space: false,
    };
    
    window.addEventListener('keydown', (e) => {
      if (keys[e.key] !== undefined) {
        keys[e.key] = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (keys[e.key] !== undefined) {
        keys[e.key] = false;
      }
    });

    // Movimiento
    const speed = 0.15;
    let velocityY = 0;
    const gravity = -0.01;
    const jumpForce = 0.25;
    let isOnGround = true;

    // Animación
    function animate() {
      requestAnimationFrame(animate);
      
      if (keys.ArrowUp) cube.position.z -= speed;
      if (keys.ArrowDown) cube.position.z += speed;
      if (keys.ArrowLeft) cube.position.x -= speed;
      if (keys.ArrowRight) cube.position.x += speed;

            // Salto
      if (keys.Space && isOnGround) {
        velocityY = jumpForce;
        isOnGround = false;
      }

      // Gravedad
      velocityY += gravity;
      cube.position.y += velocityY;

      // Colisión con el suelo
      if (cube.position.y <= 1) {
        cube.position.y = 1;
        velocityY = 0;
        isOnGround = true;
      }

      renderer.render(scene, camera);
    }

    animate();

    // Ajuste al redimensionar
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
