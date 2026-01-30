import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import { existsSync } from 'fs';

// Configuration
const INPUT_DIR = './public/photos';
const OUTPUT_DIR = './public/photos/compresse';
const MAX_WIDTH = 800;
const QUALITY = 80;

async function compressImages() {
  try {
    // Créer le dossier de sortie s'il n'existe pas
    if (!existsSync(OUTPUT_DIR)) {
      await mkdir(OUTPUT_DIR, { recursive: true });
    }

    // Lire tous les fichiers du dossier team
    const files = await readdir(INPUT_DIR);
    const imageFiles = files.filter(file => {
      const ext = extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });

    console.log(`🖼️  ${imageFiles.length} images trouvées`);

    for (const file of imageFiles) {
      const inputPath = join(INPUT_DIR, file);
      const outputName = basename(file, extname(file)) + '.jpg';
      const outputPath = join(OUTPUT_DIR, outputName);

      try {
        await sharp(inputPath)
          .resize(MAX_WIDTH, null, {
            withoutEnlargement: true,
            fit: 'inside'
          })
          .jpeg({ quality: QUALITY })
          .toFile(outputPath);

        console.log(`✅ ${file} → ${outputName}`);
      } catch (err) {
        console.error(`❌ Erreur avec ${file}:`, err.message);
      }
    }

    console.log(`\n🎉 Compression terminée! Les images sont dans: ${OUTPUT_DIR}`);
    console.log(`\n💡 Conseil: Remplacez les images dans /team par celles du dossier /team/compressed`);

  } catch (error) {
    console.error('Erreur:', error);
  }
}

compressImages();
