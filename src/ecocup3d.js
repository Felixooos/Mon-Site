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

  // 1. La Scène sans fond (transparent)
  const scene = new THREE.Scene();

  // 2. La Caméra
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
  camera.position.z = 15;
  camera.position.y = 0;

  // 3. Le Rendu
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
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

  // 4. Pas de lumière - les couleurs de la texture seront naturelles

  // 5. L'Objet (Ecocup)
  const geometry = new THREE.CylinderGeometry(3, 2, 10, 64);
  
  const material = new THREE.MeshBasicMaterial({ 
    color: 0xffffff,
    transparent: false,
    opacity: 1.0
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
