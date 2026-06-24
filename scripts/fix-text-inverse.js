const fs = require('fs');
const files = [
  'src/components/location/LocationItem.tsx',
  'src/components/location/LocationsList.tsx',
  'src/components/ui/LaunchStateNotice.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    const content = fs.readFileSync(f, 'utf8');
    const newContent = content.replace(/theme\.semanticColors\.textInverse/g, '"#FFFFFF"');
    fs.writeFileSync(f, newContent);
    console.log(`Fixed ${f}`);
  }
});
