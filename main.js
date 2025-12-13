// main.js

const MODEL_URL = "./f_16_c.glb"; // same folder as index.html

let scene, camera, renderer;
let plane;

function init() {
  const container = document.getElementById("canvas-container");

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 30000);
  camera.position.set(0, 5, 25);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const amb = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(amb);

  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(300, 600, 200);
  scene.add(sun);

  // Plane root group (so physics can move/rotate this)
  plane = new THREE.Group();
  scene.add(plane);

  loadJetModel(MODEL_URL);

  window.addEventListener("resize", onResize);
  animate();
}

function loadJetModel(url) {
  const loader = new THREE.GLTFLoader();
  loader.load(url, (gltf) => {
    const model = gltf.scene;

    // cast shadows + keep materials
    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });

    // orient model (common fix)
    model.rotation.y = Math.PI;

    // center + scale
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    model.position.sub(center);

    const longest = Math.max(size.x, size.y, size.z) || 1;
    const desired = 12;
    const s = desired / longest;
    model.scale.setScalar(s);

    plane.add(model);
  }, undefined, (err) => {
    console.error("Failed to load GLB:", err);
  });
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  // you’ll replace this with your actual sim/physics camera logic
  camera.lookAt(plane.position);

  renderer.render(scene, camera);
}

window.addEventListener("load", init);
