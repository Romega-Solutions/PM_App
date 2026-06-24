import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'app/(auth)/user-type-selection.tsx',
  'app/(auth)/welcome.tsx',
  'app/index.tsx',
  'src/components/auth/AuthHeader.tsx',
  'src/components/auth/VerificationSuccessHeader.tsx',
  'src/components/auth/VerifyEmailHeader.tsx',
  'src/features/account/screens/WelcomeCompleteScreen.tsx',
  'src/features/auth/screens/SignUpScreen.tsx',
  'src/features/matching/data/seedProfiles.ts'
];

for (const fileRel of filesToUpdate) {
  const filePath = path.join(process.cwd(), fileRel);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Specifically replace the known imports we converted
    content = content.replace(/require\(['"]([^'"]+\.png)['"]\)/g, (match, p1) => {
      // Don't replace expo system assets if they somehow snuck in
      if (p1.includes('icon.png') || p1.includes('favicon.png') || p1.includes('splash-icon.png')) {
        return match;
      }
      return match.replace('.png', '.webp');
    });
    
    content = content.replace(/require\(['"]([^'"]+\.jpg)['"]\)/g, (match, p1) => {
      return match.replace('.jpg', '.webp');
    });

    content = content.replace(/require\(['"]([^'"]+\.jpeg)['"]\)/g, (match, p1) => {
      return match.replace('.jpeg', '.webp');
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${fileRel}`);
  } else {
    console.error(`File not found: ${filePath}`);
  }
}
