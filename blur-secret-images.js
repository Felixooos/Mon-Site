import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Images à flouter pour sécurité
const imagesToBlur = [
  {
    input: 'public/goodies/LogoLegendairepng',
    output: 'public/goodies/LogoLegendaire-blur.png',
    blur: 120
  },
  {
    input: 'public/goodies/sac.png',
    output: 'public/goodies/sac-blur.png',
    blur: 60
  },
  {
    input: 'public/videos/capote-cover.jpg',
    output: 'public/videos/capote-cover-blur.jpg',
    blur: 60
  },
  {
    input: 'public/videos/ember-cover.jpg',
    output: 'public/videos/ember-cover-blur.jpg',
    blur: 60
  },
  {
    input: 'public/videos/alibaba-cover.jpg',
    output: 'public/videos/alibaba-cover-blur.jpg',
    blur: 60
  }
];

async function blurImages() {
  console.log('🔒 Création des versions floutées des images secrètes...\n');
  
  for (const img of imagesToBlur) {
    try {
      const inputPath = join(__dirname, img.input);
      const outputPath = join(__dirname, img.output);
      
      // Ajouter du padding pour éviter que les bords soient coupés
      const padding = Math.ceil(img.blur * 2);
      
      await sharp(inputPath)
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .blur(img.blur)
        .toFile(outputPath);
      
      console.log(`✅ ${img.input} → ${img.output} (padding: ${padding}px)`);
    } catch (error) {
      console.error(`❌ Erreur pour ${img.input}:`, error.message);
    }
  }
  
  console.log('\n✨ Floutage terminé !');
  console.log('⚠️  N\'oublie pas de mettre à jour les src des images dans index.html');
}

blurImages();
