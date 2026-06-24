import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const imagesDir = path.join(process.cwd(), 'assets', 'images');

const skipFiles = new Set([
  'icon.png',
  'favicon.png',
  'splash-icon.png',
  'android-icon-foreground.png',
  'android-icon-background.png',
  'android-icon-monochrome.png',
  'partial-react-logo.png', // expo default asset
  'react-logo.png',         // expo default asset
  'react-logo@2x.png',      // expo default asset
  'react-logo@3x.png',      // expo default asset
]);

async function getFiles(dir) {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

async function convertToWebP() {
  const allFiles = await getFiles(imagesDir);
  const imageFiles = allFiles.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return (ext === '.jpg' || ext === '.jpeg' || ext === '.png') && !skipFiles.has(path.basename(f));
  });
  
  let totalSaved = 0;
  
  for (const file of imageFiles) {
    const originalSize = fs.statSync(file).size;
    const ext = path.extname(file);
    const webpFile = file.slice(0, -ext.length) + '.webp';
    
    try {
      await sharp(file)
        .webp({ quality: 80 })
        .toFile(webpFile);
      
      const newSize = fs.statSync(webpFile).size;
      const saved = originalSize - newSize;
      totalSaved += saved;
      
      console.log(`Converted ${path.basename(file)} -> ${path.basename(webpFile)}: Saved ${(saved / 1024).toFixed(2)} KB`);
      
      // Delete original
      fs.unlinkSync(file);
    } catch (e) {
      console.error(`Failed to convert ${file}: ${e.message}`);
    }
  }
  
  console.log(`\nTotal space saved during conversion: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
}

convertToWebP().catch(console.error);
