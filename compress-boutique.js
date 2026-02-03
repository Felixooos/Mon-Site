import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import { existsSync } from 'fs';

// Configuration
const INPUT_DIR = 'C:\\Users\\felix\\OneDrive\\Documente\\liste\\Boutique\\Mardi 3';
const OUTPUT_DIR = 'C:\\Users\\felix\\OneDrive\\Documente\\liste\\Boutique\\Mardi 3\\compresse';
const MAX_WIDTH = 800;
const QUALITY = 80;

async function compressImages() {
  try {
    // Créer le dossier de sortie s'il n'existe pas
    if (!existsSync(OUTPUT_DIR)) {
      await mkdir(OUTPUT_DIR, { recursive: true });
    }

    // Lire tous les fichiers du dossier
    const files = await readdir(INPUT_DIR);
    const imageFiles = files.filter(file => {
      const ext = extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });

    console.log(`🖼️  ${imageFiles.length} images trouvées`);

    for (const file of imageFiles) {
      const inputPath = join(INPUT_DIR, file);
      const ext = extname(file).toLowerCase();
      
      try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();
        
        // Si l'image a un canal alpha (transparence), garder PNG, sinon JPG
        const hasAlpha = metadata.hasAlpha;
        const outputName = basename(file, extname(file)) + (hasAlpha ? '.png' : '.jpg');
        const outputPath = join(OUTPUT_DIR, outputName);
        
        if (hasAlpha) {
          // Garder PNG avec transparence
          await image
            .resize(MAX_WIDTH, null, {
              withoutEnlargement: true,
              fit: 'inside'
            })
            .png({ quality: QUALITY })
            .toFile(outputPath);
        } else {
          // Convertir en JPG
          await image
            .resize(MAX_WIDTH, null, {
              withoutEnlargement: true,
              fit: 'inside'
            })
            .jpeg({ quality: QUALITY })
            .toFile(outputPath);
        }

        console.log(`✅ ${file} → ${outputName}${hasAlpha ? ' (transparence préservée)' : ''}`);
      } catch (err) {
        console.error(`❌ Erreur avec ${file}:`, err.message);
      }
    }

    console.log(`\n🎉 Compression terminée! Les images sont dans: ${OUTPUT_DIR}`);

  } catch (err) {
    console.error('❌ Erreur générale:', err);
  }
}

compressImages();
