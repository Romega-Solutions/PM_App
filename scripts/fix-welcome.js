const fs = require('fs');
let welcome = fs.readFileSync('src/features/account/screens/WelcomeCompleteScreen.tsx', 'utf-8');

welcome = welcome.replace('import { theme } from "@/src/theme";', 'import { useAppTheme, makeStyles } from "@/src/theme";');
welcome = welcome.replace(/const ACCENT_PURPLE = theme\.colors\.dalisay\?\.\[500\] \?\? "#8D69F6";\r?\n/, '');
welcome = welcome.replace(/const ACCENT_PINK = theme\.colors\.amihan\?\.\[500\] \?\? "#EF3E78";\r?\n/, '');

welcome = welcome.replace('export default function WelcomeCompleteScreen() {',
`export default function WelcomeCompleteScreen() {
  const theme = useAppTheme();
  const styles = useStyles();
  const ACCENT_PURPLE = theme.colors.dalisay?.[500] ?? "#8D69F6";
  const ACCENT_PINK = theme.colors.amihan?.[500] ?? "#EF3E78";`);

welcome = welcome.replace('const styles = StyleSheet.create({',
`const useStyles = makeStyles((theme) => {
  const ACCENT_PURPLE = theme.colors.dalisay?.[500] ?? "#8D69F6";
  const ACCENT_PINK = theme.colors.amihan?.[500] ?? "#EF3E78";
  return {`);

welcome = welcome.replace(/^}\);/m, '  };\n});');
fs.writeFileSync('src/features/account/screens/WelcomeCompleteScreen.tsx', welcome, 'utf-8');
console.log("Fixed WelcomeCompleteScreen.");
