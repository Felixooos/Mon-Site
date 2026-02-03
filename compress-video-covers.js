import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Configuration
const INPUT_DIR = './public/videos';
const QUALITY = 75;

const covers = [
  'film-cover.jpg',
  'capote-cover.jpg',
  'ember-cover.jpg',
  'alibaba-cover.jpg',
  'kainf-cover.jpg'
];

async function compressCovers() {
  try {
    console.log(`🎬 Compression des covers vidéo...`);

    for (const cover of covers) {
      const inputPath = join(INPUT_DIR, cover);
      const outputName = cover.replace('.jpg', '-compressed.jpg');
      const outputPath = join(INPUT_DIR, outputName);

      if (!existsSync(inputPath)) {
        console.log(`⚠️  ${cover} non trouvé, ignoré`);
        continue;
      }

      try {
        await sharp(inputPath)
          .jpeg({ quality: QUALITY, progressive: true })
          .toFile(outputPath);

        console.log(`✅ ${cover} → ${outputName}`);
      } catch (err) {
        console.error(`❌ Erreur avec ${cover}:`, err.message);
      }
    }

    console.log(`\n🎉 Compression terminée!`);

  } catch (error) {
    console.error('Erreur lors de la compression:', error);
    process.exit(1);
  }
}

compressCovers();
