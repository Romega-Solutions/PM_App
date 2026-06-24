import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const imagesDir = path.join(process.cwd(), 'assets', 'images');

async function getFiles(dir) {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

async function optimize() {
  const allFiles = await getFiles(imagesDir);
  const imageFiles = allFiles.filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
  
  let totalSaved = 0;
  
  for (const file of imageFiles) {
    const originalSize = fs.statSync(file).size;
    const tmpFile = file + '.tmp';
    try {
      if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        await sharp(file)
          .jpeg({ quality: 60, mozjpeg: true })
          .toFile(tmpFile);
      } else if (file.endsWith('.png')) {
        await sharp(file)
          .png({ compressionLevel: 9, quality: 70 })
          .toFile(tmpFile);
      }
      
      const newSize = fs.statSync(tmpFile).size;
      // Only replace if it's actually smaller
      if (newSize < originalSize) {
        fs.renameSync(tmpFile, file);
        const saved = originalSize - newSize;
        totalSaved += saved;
        console.log(`Optimized ${path.basename(file)}: Saved ${(saved / 1024).toFixed(2)} KB (${(newSize / 1024).toFixed(2)} KB now)`);
      } else {
        fs.unlinkSync(tmpFile);
        console.log(`Skipped ${path.basename(file)}: Optimization did not reduce size`);
      }
    } catch (e) {
      console.error(`Failed to optimize ${file}: ${e.message}`);
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    }
  }
  
  console.log(`\nTotal space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
}

optimize().catch(console.error);
