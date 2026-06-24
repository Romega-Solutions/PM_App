const fs = require('fs');

function fixClassNames(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Safe replacement logic:
  // Match ` className="..."` and ` className={...}` where the value has no nested braces.
  // Instead of risking regex breakage, let's just do an iterative string replace:
  
  let newContent = content;
  // Replace className="anything"
  newContent = newContent.replace(/className="[^"]*"/g, '');
  // Replace className={`anything`}
  newContent = newContent.replace(/className=\{`[^`]*`\}/g, '');
  // Replace className={someVar}
  newContent = newContent.replace(/className=\{[a-zA-Z0-9_$.]+\}/g, '');
  // Replace className={[...].join(' ')}
  newContent = newContent.replace(/className=\{\[[^\]]*\]\.join\(' '\)\}/g, '');
  
  if (content !== newContent) {
    fs.writeFileSync(filepath, newContent);
    console.log('Fixed', filepath);
  }
}

fixClassNames('app/(modals)/report-user.tsx');
fixClassNames('app/(modals)/filters.tsx');
