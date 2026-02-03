// ==================== ECOCUP 3D avec Three.js ====================
import * as THREE from 'three';

window.createEcocup3D = function(containerId, textureUrl) {
  console.log('Initialisation de l\'ecocup 3D pour:', containerId);
  const container = document.querySelector(containerId);
  if (!container) {
    console.error('Container ' + containerId + ' non trouvé');
    return;
  }
  
  console.log('Container trouvé:', container);
  console.log('Largeur du container:', container.offsetWidth);

  // 1. La Scène avec fond dégradé identique aux stickers
  const scene = new THREE.Scene();
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  // Même dégradé que les stickers
  const gradient = context.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, '#FFF5E6');
  gradient.addColorStop(1, '#FFE8D6');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 512);
  const backgroundTexture = new THREE.CanvasTexture(canvas);
  scene.background = backgroundTexture;

  // 2. La Caméra
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
  camera.position.z = 15;
  camera.position.y = 0;

  // 3. Le Rendu
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: false,
    powerPreference: 'high-performance'
  });
  // Forcer un rendu carré pour éviter l'écrasement
  const size = Math.max(container.offsetWidth, 300);
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.innerHTML = '';
  container.appendChild(renderer.domElement);
  
  // Assurer que le canvas reste carré
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.objectFit = 'contain';
  
  console.log('Canvas ajouté au container');

  // 4. Lumière - avec ombre à gauche et reflet à droite
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  // Lumière principale de droite pour créer le reflet
  const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
  mainLight.position.set(5, 5, 5);
  scene.add(mainLight);
  
  // Lumière de gauche plus faible pour l'ombre
  const leftLight = new THREE.DirectionalLight(0xffffff, 0.3);
  leftLight.position.set(-5, 3, 5);
  scene.add(leftLight);

  // 5. L'Objet (Ecocup)
  const geometry = new THREE.CylinderGeometry(3, 2, 10, 64);
  
  const material = new THREE.MeshPhongMaterial({ 
    color: 0xffffff,
    shininess: 30,
    specular: 0x444444
  });

  const cup = new THREE.Mesh(geometry, material);
  scene.add(cup);
  console.log('Ecocup ajoutée à la scène');

  // Charger la texture
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(textureUrl, 
    (texture) => {
      console.log('Texture chargée avec succès:', textureUrl);
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      material.map = texture;
      material.needsUpdate = true;
    },
    undefined,
    (err) => {
      console.error('Erreur de chargement de texture:', err);
      console.log('L\'ecocup restera en couleur unie');
    }
  );

  // 6. Animation
  function animate() {
    requestAnimationFrame(animate);
    cup.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  animate();
  console.log('Animation lancée');

  // Redimensionnement
  window.addEventListener('resize', () => {
    const newSize = Math.max(container.offsetWidth, 300);
    renderer.setSize(newSize, newSize);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = 1; // Toujours garder un ratio 1:1
    camera.updateProjectionMatrix();
  });
}

export function initEcocup3D() {
  // Initialiser l'ecocup collector
  createEcocup3D('#ecocup-3d-canvas', '/goodies/EcocupCollector.png');
  
  // Initialiser l'ecocup normale
  createEcocup3D('#ecocup-normal-3d-canvas', '/goodies/Ecocup.png');
}
