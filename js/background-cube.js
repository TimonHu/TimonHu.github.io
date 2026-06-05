const canvas = document.getElementById('glCanvas');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

function resizeCanvas() {
    const width = canvas.clientWidth || canvas.parentElement.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || Math.round(width * 9 / 16);

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

resizeCanvas();

const geometry = new THREE.BoxGeometry();

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('images/brick.jpg');

const material = new THREE.MeshStandardMaterial({
    map: texture
});

const cube = new THREE.Mesh(geometry, material);cube.scale.set(2, 2, 2);
scene.add(cube);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

camera.position.z = 3;

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', resizeCanvas);