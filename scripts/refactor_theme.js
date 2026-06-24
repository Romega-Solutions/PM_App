const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, '..', 'src', 'features', 'matching');

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    const originalContent = content;

    if (!content.includes('StyleSheet.create') && !content.includes('const styles =') && !content.includes('const useStyles =')) {
        return;
    }

    // Add imports
    if (!content.includes('import { useAppTheme }')) {
        const importRegex = /^import .*?;/gm;
        let lastMatch = null;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            lastMatch = match;
        }
        
        if (lastMatch) {
            const insertPos = lastMatch.index + lastMatch[0].length;
            content = content.slice(0, insertPos) + '\nimport { useAppTheme } from "@/src/theme/ThemeContext";\nimport { makeStyles } from "@/src/theme/makeStyles";' + content.slice(insertPos);
        } else {
            content = 'import { useAppTheme } from "@/src/theme/ThemeContext";\nimport { makeStyles } from "@/src/theme/makeStyles";\n' + content;
        }
    }

    // Replace StyleSheet.create
    content = content.replace(/const styles = StyleSheet\.create\(\{/g, 'const useStyles = makeStyles((theme) => ({');

    // Inject hooks
    const componentRegex = /(export\s+const\s+[A-Za-z0-9_]+\s*(?::\s*React\.FC<[^>]+>\s*)?=\s*(?:React\.memo\()?\(.*?\)\s*=>\s*\{)/gs;
    
    content = content.replace(componentRegex, (match, p1, offset, string) => {
        const nextChars = string.slice(offset + p1.length, offset + p1.length + 200);
        if (nextChars.includes('const theme = useAppTheme();')) {
            return p1;
        }
        return p1 + '\n  const theme = useAppTheme();\n  const styles = useStyles();';
    });

    // Remove global color declarations
    content = content.replace(/^const\s+(ACCENT_PINK|ACCENT_PURPLE|SUPER_LIKE_GOLD|VERIFIED_GREEN|BRAND_BG|WHITE)\s*=\s*".*?";\s*$\n?/gm, '');

    // Variable replacements
    const varMap = {
        "ACCENT_PINK": "theme.semanticColors.primary",
        "ACCENT_PURPLE": "theme.semanticColors.secondary",
        "SUPER_LIKE_GOLD": "theme.semanticColors.warning",
        "VERIFIED_GREEN": "theme.semanticColors.success",
        "BRAND_BG": "theme.semanticColors.background",
        "WHITE": "theme.colors.neutral.white"
    };

    for (const [v, replacement] of Object.entries(varMap)) {
        const regex = new RegExp(`\\b${v}\\b`, 'g');
        content = content.replace(regex, replacement);
    }

    // Hex replacements
    const hexMap = {
        '"#0F0814"': 'theme.semanticColors.background',
        '"#1A0F1F"': 'theme.semanticColors.surface',
        '"#2D1B35"': 'theme.colors.dalisay[900]',
        '"#EF3E78"': 'theme.semanticColors.primary',
        '"#8D69F6"': 'theme.semanticColors.secondary',
        '"#F59E0B"': 'theme.semanticColors.warning',
        '"#10B981"': 'theme.semanticColors.success',
        '"#22c55e"': 'theme.semanticColors.success',
        '"#D52C4D"': 'theme.semanticColors.error',
        '"#FFFFFF"': 'theme.colors.neutral.white',
        '"#FFF"': 'theme.colors.neutral.white',
    };

    for (const [h, replacement] of Object.entries(hexMap)) {
        content = content.split(h).join(replacement);
    }

    // Remove StyleSheet from import
    content = content.replace(/StyleSheet,\s*/g, '');
    content = content.replace(/,\s*StyleSheet/g, '');
    content = content.replace(/import\s*\{\s*StyleSheet\s*\}\s*from\s*"react-native";\s*\n?/g, '');
    content = content.replace(/import\s*\{\s*\}\s*from\s*"react-native";\s*\n?/g, '');

    if (content !== originalContent) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Updated ${filepath}`);
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
