const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, '..', 'src', 'features', 'matching');

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    const originalContent = content;

    // We already replaced `const useStyles = makeStyles((theme) => ({`
    // but we forgot to replace the closing `});` with `}));`
    
    // Simple approach: find where `makeStyles` starts and assume the last `});` in the file is for it
    if (content.includes('const useStyles = makeStyles((theme) => ({')) {
        // Find the last index of '});'
        const lastIndex = content.lastIndexOf('});');
        if (lastIndex !== -1 && !content.substring(lastIndex).includes('}));')) {
            content = content.substring(0, lastIndex) + '}));' + content.substring(lastIndex + 3);
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Fixed closing bracket in ${filepath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            walk(filepath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            processFile(filepath);
        }
    }
}

walk(directory);
