import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
let scene, camera, renderer, controls;
let model;

init();
lighting();
environment();
// addCube();
addModel();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(2.05, -0.75, -1.55);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 3.25;
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0.35);



  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  const app = document.getElementById('app');
  app.appendChild(renderer.domElement);
}

function addCube() {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);

  scene.add(cube);
  cube.position.set(0, 0, 0);
}

function animate() {
  requestAnimationFrame(animate);

  if (model) model.rotation.y += 0.005;

  controls.update();
  renderer.render(scene, camera);
}

function environment() {
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load('/cyclorama_hard_light_1k.hdr', function (texture) {
    const envMap = new THREE.PMREMGenerator(renderer).fromEquirectangular(texture);
    scene.environment = envMap.texture;


    // Освобождение памяти
    texture.dispose();
    renderer.initTexture(envMap.texture);
  });
}

function addModel() {

  console.log('Loading model...');

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');
  dracoLoader.setDecoderConfig({ type: 'js' })

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  loader.load('./iphone.glb', function (gltf) {
    console.log('Model loaded successfully');

    console.log('Model loaded:', gltf);

    model = gltf.scene;

    model.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true; // Объект отбрасывает тень
        node.receiveShadow = true; // Объект получает тени
      }
    });

    model.scale.set(10, 10, 10);
    model.position.set(0, 0, 0);

    scene.add(model);
  });

  console.log('after loading');
}

function lighting() {
  const color = 0xffffff;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.castShadow = true;
  light.shadow.mapSize.width = 2048; // Размер текстуры тени
  light.shadow.mapSize.height = 2048;
  light.position.set(2.5, -2.5, 2.5);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(color, 1.5);
  ambientLight.position.set(0, 0, 0);
  scene.add(ambientLight);
}