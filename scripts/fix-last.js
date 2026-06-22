const fs = require('fs');

// SignUpScreen
let signup = fs.readFileSync('src/features/auth/screens/SignUpScreen.tsx', 'utf-8');
signup = signup.replace('const styles = useMemo(() => StyleSheet.create({', 'const styles = useMemo(() => StyleSheet.create({'); // just to locate
signup = signup.replace(/\}\),\s*\[moderateScale,\s*width\]\);/g, '}), [moderateScale, width, theme]);');
if (!signup.includes('const theme = useAppTheme();')) {
  signup = signup.replace('function SignUpScreen() {\n', 'function SignUpScreen() {\n  const theme = useAppTheme();\n');
}
fs.writeFileSync('src/features/auth/screens/SignUpScreen.tsx', signup, 'utf-8');

// SecondaryButton
let btn = fs.readFileSync('src/components/ui/SecondaryButton.tsx', 'utf-8');
btn = btn.replace(/function getVariantStyles\(variant: "purple" \| "pink" \| "white"\) \{/g, 'function getVariantStyles(variant: "purple" | "pink" | "white", theme: any) {');
btn = btn.replace(/const variantStyles = getVariantStyles\(variant\);/g, 'const variantStyles = getVariantStyles(variant, theme);');
fs.writeFileSync('src/components/ui/SecondaryButton.tsx', btn, 'utf-8');

console.log("Fixed final 2 files.");
