const fs = require('fs');
const lightContent = fs.readFileSync('c:/Users/Administrator/Documents/MyProject/Peminjaman Mahasiswa/DESIGN light mode.md', 'utf8');
const darkContent = fs.readFileSync('c:/Users/Administrator/Documents/MyProject/Peminjaman Mahasiswa/DESIGN dark mode.md', 'utf8');

function getColors(content) {
  const match = content.match(/colors:\n([\s\S]*?)(?:\ntypography:|\n---)/);
  const colors = {};
  if (match) {
    const lines = match[1].split('\n');
    for (let line of lines) {
      if (line.includes(':')) {
        let [key, val] = line.split(':');
        key = key.trim();
        val = val.replace(/['"]/g, '').trim();
        if (key && val) colors[key] = val;
      }
    }
  }
  return colors;
}

const lightColors = getColors(lightContent);
const darkColors = getColors(darkContent);

let rootCss = ':root {\n';
for (let key in lightColors) {
  rootCss += '  --color-' + key + ': ' + lightColors[key] + ';\n';
}
rootCss += '}\n\n';

let darkCss = '.dark {\n';
for (let key in darkColors) {
  darkCss += '  --color-' + key + ': ' + darkColors[key] + ';\n';
}
darkCss += '}\n\n';

let themeCss = '';
for (let key in lightColors) {
  themeCss += '  --color-' + key + ': var(--color-' + key + ');\n';
}

let indexCss = fs.readFileSync('c:/Users/Administrator/Documents/MyProject/Peminjaman Mahasiswa/frontend/src/index.css', 'utf8');

const themeMatch = indexCss.match(/@theme\s*\{([\s\S]*?)\}/);
if (themeMatch) {
  let themeBody = themeMatch[1];
  // Remove hardcoded hex colors
  themeBody = themeBody.replace(/^\s*--color-[^:]+:\s*#[0-9a-fA-F]+;\n/gm, '');
  const newThemeBlock = '@theme {\n' + themeCss + themeBody + '}';
  const newCss = indexCss.substring(0, themeMatch.index) + rootCss + darkCss + newThemeBlock + indexCss.substring(themeMatch.index + themeMatch[0].length);
  fs.writeFileSync('c:/Users/Administrator/Documents/MyProject/Peminjaman Mahasiswa/frontend/src/index.css', newCss);
  console.log('Successfully updated index.css');
} else {
  console.log('Failed to find @theme block');
}
