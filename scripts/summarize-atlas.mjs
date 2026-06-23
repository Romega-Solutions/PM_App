import fs from 'fs';
import readline from 'readline';

const atlasPath = '.expo/atlas.jsonl';

async function analyze() {
  const fileStream = fs.createReadStream(atlasPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const pkgMap = new Map();
  let totalSize = 0;

  for await (const line of rl) {
    if (!line.startsWith('[')) continue;
    
    let data;
    try {
      data = JSON.parse(line);
    } catch(e) { continue; }
    
    if (!Array.isArray(data)) continue;
    
    const modules = data[6];
    if (!Array.isArray(modules)) continue;
    
    for (const m of modules) {
      let name = m.package || m.relativePath || m.absolutePath || String(m.id);
      if (m.package) {
        name = `[pkg] ${m.package}`;
      }
      const size = m.size || 0;
      totalSize += size;
      const countData = pkgMap.get(name) || { size: 0, count: 0 };
      countData.size += size;
      countData.count += 1;
      pkgMap.set(name, countData);
    }
  }

  const sorted = Array.from(pkgMap.entries())
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 50); // top 50
  
  console.log(`Total Unminified JS Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('\nTop dependencies/modules:');
  sorted.forEach(([name, data]) => {
    console.log(`${(data.size / 1024).toFixed(2).padStart(8)} KB (${data.count} files) - ${name}`);
  });
}

analyze().catch(console.error);
