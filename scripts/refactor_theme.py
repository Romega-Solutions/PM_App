import os
import re

directory = r"c:\Users\ultim\_ Local Codes\PM_App\src\features\matching"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if no StyleSheet.create
    if "StyleSheet.create" not in content and "const styles =" not in content and "const useStyles =" not in content:
        return

    original_content = content

    # Add imports
    if "import { useAppTheme }" not in content:
        # Find the last import
        imports = list(re.finditer(r'^import .*?;$', content, re.MULTILINE))
        if imports:
            last_import = imports[-1]
            insert_pos = last_import.end()
            content = content[:insert_pos] + '\nimport { useAppTheme } from "@/src/theme/ThemeContext";\nimport { makeStyles } from "@/src/theme/makeStyles";' + content[insert_pos:]
        else:
            content = 'import { useAppTheme } from "@/src/theme/ThemeContext";\nimport { makeStyles } from "@/src/theme/makeStyles";\n' + content

    # Replace StyleSheet.create
    content = content.replace("const styles = StyleSheet.create({", "const useStyles = makeStyles((theme) => ({")

    # Inject hooks into component body
    # Find export const ComponentName: React.FC<...> = (...) => {
    # or export const ComponentName = (...) => {
    # or function ComponentName(...) {
    
    # Let's match typical component patterns in these files
    # Match: export const <Name> = <something> => {
    # Match: export const <Name>: React.FC<...> = (...) => {
    # Match: export const <Name>: React.FC<...> = React.memo((...) => {
    component_pattern = re.compile(r'(export\s+const\s+[A-Za-z0-9_]+\s*(?::\s*React\.FC<[^>]+>\s*)?=\s*(?:React\.memo\()?\(.*?\)\s*=>\s*\{)', re.DOTALL)
    
    def inject_hooks(match):
        header = match.group(1)
        # Check if already injected
        if "const theme = useAppTheme();" in content[match.end():match.end()+200]:
            return header
        return header + '\n  const theme = useAppTheme();\n  const styles = useStyles();'

    content = component_pattern.sub(inject_hooks, content)

    # Color mapping
    color_map = {
        "ACCENT_PINK": "theme.semanticColors.primary",
        "ACCENT_PURPLE": "theme.semanticColors.secondary",
        "SUPER_LIKE_GOLD": "theme.semanticColors.warning",
        "VERIFIED_GREEN": "theme.semanticColors.success",
        "BRAND_BG": "theme.semanticColors.background",
        '"#0F0814"': "theme.semanticColors.background",
        '"#1A0F1F"': "theme.semanticColors.surface",
        '"#2D1B35"': "theme.colors.dalisay[900]",
        '"#EF3E78"': "theme.semanticColors.primary",
        '"#8D69F6"': "theme.semanticColors.secondary",
        '"#F59E0B"': "theme.semanticColors.warning",
        '"#10B981"': "theme.semanticColors.success",
        '"#22c55e"': "theme.semanticColors.success",
        '"#D52C4D"': "theme.semanticColors.error",
        '"#FFFFFF"': "theme.colors.neutral.white",
        '"#FFF"': "theme.colors.neutral.white",
        'WHITE': 'theme.colors.neutral.white', # Assuming WHITE is always used for pure white, we can use neutral.white or theme.semanticColors.text
        # We will replace these as words
    }

    # Remove global color declarations
    content = re.sub(r'^const\s+(ACCENT_PINK|ACCENT_PURPLE|SUPER_LIKE_GOLD|VERIFIED_GREEN|BRAND_BG|WHITE)\s*=\s*".*?";\s*$\n?', '', content, flags=re.MULTILINE)

    # Replace usages
    # Careful not to replace inside quotes unless it's the exact string
    # Replace variable names
    for var, replacement in [
        ("ACCENT_PINK", "theme.semanticColors.primary"),
        ("ACCENT_PURPLE", "theme.semanticColors.secondary"),
        ("SUPER_LIKE_GOLD", "theme.semanticColors.warning"),
        ("VERIFIED_GREEN", "theme.semanticColors.success"),
        ("BRAND_BG", "theme.semanticColors.background"),
        ("WHITE", "theme.colors.neutral.white")
    ]:
        content = re.sub(r'\b' + var + r'\b', replacement, content)

    # Replace hexes
    for hex_val, replacement in [
        ('"#0F0814"', 'theme.semanticColors.background'),
        ('"#1A0F1F"', 'theme.semanticColors.surface'),
        ('"#2D1B35"', 'theme.colors.dalisay[900]'),
        ('"#EF3E78"', 'theme.semanticColors.primary'),
        ('"#8D69F6"', 'theme.semanticColors.secondary'),
        ('"#F59E0B"', 'theme.semanticColors.warning'),
        ('"#10B981"', 'theme.semanticColors.success'),
        ('"#22c55e"', 'theme.semanticColors.success'),
        ('"#D52C4D"', 'theme.semanticColors.error'),
        ('"#FFFFFF"', 'theme.colors.neutral.white'),
        ('"#FFF"', 'theme.colors.neutral.white'),
    ]:
        content = content.replace(hex_val, replacement)

    # Remove StyleSheet from import
    content = re.sub(r'StyleSheet,\s*', '', content)
    content = re.sub(r',\s*StyleSheet', '', content)
    # If import { StyleSheet } from "react-native", remove it entirely
    content = re.sub(r'import\s*\{\s*StyleSheet\s*\}\s*from\s*"react-native";\s*\n?', '', content)
    
    # Remove any empty React Native imports that might be left: import { } from "react-native";
    content = re.sub(r'import\s*\{\s*\}\s*from\s*"react-native";\s*\n?', '', content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(directory):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            process_file(os.path.join(root, f))
