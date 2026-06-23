import fs from 'fs';
import readline from 'readline';

const atlasPath = '.expo/atlas.jsonl';

async function analyze() {
  const fileStream = fs.createReadStream(atlasPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let i = 0;
  for await (const line of rl) {
    i++;
    console.log(`Line ${i} length: ${line.length}`);
    try {
      const data = JSON.parse(line);
      if (Array.isArray(data)) {
        console.log(`Line ${i} is Array of length ${data.length}`);
        console.log(`Line ${i} Array elements type: ${data.map(d => typeof d).join(', ')}`);
        // if one of them is an array, log its length
        data.forEach((d, idx) => {
          if (Array.isArray(d)) {
             console.log(`  Index ${idx} is Array of length ${d.length}`);
             if (d.length > 0) {
               console.log(`  Index ${idx} first element keys: ${Object.keys(d[0]).join(', ')}`);
             }
          } else if (typeof d === 'string') {
             console.log(`  Index ${idx} is string: ${d.substring(0, 50)}`);
          } else if (typeof d === 'object' && d !== null) {
             console.log(`  Index ${idx} is object with keys: ${Object.keys(d).join(', ')}`);
          }
        });
      } else {
        console.log(`Line ${i} is Object with keys: ${Object.keys(data).join(', ')}`);
      }
    } catch(e) {
      console.log(`Line ${i} could not parse`);
    }
  }
}

analyze().catch(console.error);
