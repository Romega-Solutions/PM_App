const fs = require('fs');

async function fix() {
  const path = 'src/features/profile/screens/EditProfileScreen.tsx';
  let content = fs.readFileSync(path, 'utf8');

  content = content.replace(/styles\.absoluteFill/g, 'StyleSheet.absoluteFill');
  fs.writeFileSync(path, content);
}

fix();
