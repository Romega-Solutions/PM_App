const fs = require('fs');

// PhotoPicker
let photo = fs.readFileSync('src/components/account/PhotoPicker.tsx', 'utf-8');
photo = photo.replace(/import { colors, theme } from "@\/src\/theme";/, 'import { useAppTheme, makeStyles } from "@/src/theme";');
photo = photo.replace('const ITEM_SIZE = Math.min(120, Math.floor((width - theme.spacing.lg * 2 - 12) / 3));', '');
photo = photo.replace('export default function PhotoPicker({ photos, onAdd, onRemove, canAdd = true }: Props) {', 
`export default function PhotoPicker({ photos, onAdd, onRemove, canAdd = true }: Props) {
  const theme = useAppTheme();
  const styles = useStyles();`);
photo = photo.replace('const styles = StyleSheet.create({', 
`const useStyles = makeStyles((theme) => {
  const ITEM_SIZE = Math.min(120, Math.floor((width - theme.spacing.lg * 2 - 12) / 3));
  return {`);
photo = photo.replace(/^}\);/m, '  };\n});');
photo = photo.replace(/(?<!theme\.)colors\./g, 'theme.colors.');
fs.writeFileSync('src/components/account/PhotoPicker.tsx', photo, 'utf-8');

// WelcomeCompleteScreen
let welcome = fs.readFileSync('src/features/account/screens/WelcomeCompleteScreen.tsx', 'utf-8');
welcome = welcome.replace(/import { theme } from "@\/src\/theme";/, 'import { useAppTheme, makeStyles } from "@/src/theme";');
welcome = welcome.replace(/const ACCENT_PURPLE.*\nconst ACCENT_PINK.*\n/, '');
welcome = welcome.replace('export default function WelcomeCompleteScreen() {',
`export default function WelcomeCompleteScreen() {
  const theme = useAppTheme();
  const styles = useStyles();`);
welcome = welcome.replace('const styles = StyleSheet.create({',
`const useStyles = makeStyles((theme) => {
  const ACCENT_PURPLE = theme.colors.dalisay?.[500] ?? "#8D69F6";
  const ACCENT_PINK = theme.colors.amihan?.[500] ?? "#EF3E78";
  return {`);
welcome = welcome.replace(/^}\);/m, '  };\n});');
welcome = welcome.replace(/(?<!theme\.)colors\./g, 'theme.colors.');
fs.writeFileSync('src/features/account/screens/WelcomeCompleteScreen.tsx', welcome, 'utf-8');

console.log("Fixed PhotoPicker and WelcomeCompleteScreen.");
