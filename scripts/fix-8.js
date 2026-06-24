const fs = require('fs');

const files = [
  'src/components/auth/AuthHeader.tsx',
  'src/components/auth/SignUpPrompt.tsx',
  'src/components/forms/CustomTextInput.tsx',
  'src/components/ui/BackButton.tsx',
  'src/components/ui/PrimaryButton.tsx',
  'src/components/ui/SecondaryButton.tsx',
  'src/features/auth/screens/SignInScreen.tsx',
  'src/features/auth/screens/SignUpScreen.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');

  // Replace imports
  content = content.replace(/import\s+\{([^}]*)\}\s+from\s+["'](?:@\/src\/theme|\.\.?\/\.\.?\/theme)["'];?/g, (match, p1) => {
    let specs = p1.split(',').map(s => s.trim()).filter(Boolean);
    specs = specs.filter(s => s !== 'colors' && s !== 'semanticColors' && s !== 'theme');
    specs.push('useAppTheme');
    if (!content.includes('const styles = useMemo(() => StyleSheet.create({')) {
       specs.push('makeStyles');
    }
    return `import { ${Array.from(new Set(specs)).join(', ')} } from "@/src/theme";`;
  });

  // Inject theme
  const componentRegexes = [
    /(export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{)/g,
    /(export\s+function\s+\w+\s*\([^)]*\)\s*\{)/g,
    /(const\s+\w+\s*=\s*(?:<[^>]+>\s*)?\([^)]*\)\s*(?::\s*[^=]+)?\s*=>\s*\{)/g,
    /(const\s+\w+\s*:\s*React\.FC(?:<[^>]+>)?\s*=\s*\([^)]*\)\s*=>\s*\{)/g,
    /(function\s+[A-Z]\w+\s*\([^)]*\)\s*\{)/g
  ];

  for (const regex of componentRegexes) {
    if (regex.test(content) && !content.includes('const theme = useAppTheme();')) {
      if (content.includes('const styles = useMemo(() => StyleSheet.create({')) {
        content = content.replace(regex, `$1\n  const theme = useAppTheme();\n`);
      } else {
        content = content.replace(regex, `$1\n  const theme = useAppTheme();\n  const styles = useStyles();\n`);
      }
      break;
    }
  }

  if (content.includes('export const PrimaryButton = React.forwardRef<View, PrimaryButtonProps>((') || 
      content.includes('export const SecondaryButton = React.forwardRef<View, SecondaryButtonProps>((') ||
      content.includes('export const CustomTextInput = React.forwardRef<View, CustomTextInputProps>((') ||
      content.includes('export default function CustomTextInput')) {
      content = content.replace(/(export\s+(?:default\s+)?(?:const|function)\s+\w+(?:\s*=\s*React\.forwardRef<[^>]+>\(\(|\s*\([^)]*\)\s*\{))/g, (match) => {
        if (!content.includes('const theme = useAppTheme();')) {
          return `${match}\n  const theme = useAppTheme();`;
        }
        return match;
      });
  }

  // Handle styles
  if (content.includes('const styles = useMemo(() => StyleSheet.create({')) {
    // Add theme to dependency array!
    content = content.replace(/\}\),\s*\[([^\]]*)\]\);/g, '}), [$1, theme]);');
  } else if (content.includes('const styles = StyleSheet.create({')) {
    content = content.replace('const styles = StyleSheet.create({', 'const useStyles = makeStyles((theme) => ({');
    content = content.replace(/^}\);/gm, '}));');
  }

  // Replace colors usages
  content = content.replace(/(?<!theme\.)colors\./g, 'theme.colors.');
  content = content.replace(/(?<!theme\.)semanticColors\./g, 'theme.semanticColors.');

  fs.writeFileSync(file, content, 'utf-8');
}
console.log("Fixed 8 files");
