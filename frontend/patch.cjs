const fs = require('fs');
const oldCss = fs.readFileSync('src/index.css', 'utf-8');

const newTokens = {
  'error-container': '#ffdad6',
  'on-primary-container': '#eeefff',
  'tertiary-container': '#996100',
  'background': '#f8f9ff',
  'surface-tint': '#0053db',
  'tertiary-fixed-dim': '#ffb95f',
  'surface-bright': '#f8f9ff',
  'on-secondary-container': '#00714d',
  'surface-container-low': '#eff4ff',
  'on-primary-fixed-variant': '#003ea8',
  'on-primary': '#ffffff',
  'on-primary-fixed': '#00174b',
  'surface-container-highest': '#d3e4fe',
  'on-error-container': '#93000a',
  'inverse-surface': '#213145',
  'surface-container-lowest': '#ffffff',
  'surface-container': '#e5eeff',
  'on-surface': '#0b1c30',
  'surface-variant': '#d3e4fe',
  'on-secondary-fixed-variant': '#005236',
  'tertiary': '#784b00',
  'primary': '#004ac6',
  'on-background': '#0b1c30',
  'on-tertiary': '#ffffff',
  'on-error': '#ffffff',
  'outline': '#737686',
  'on-tertiary-fixed-variant': '#653e00',
  'primary-container': '#2563eb',
  'surface': '#f8f9ff',
  'on-tertiary-container': '#ffeedd',
  'on-secondary': '#ffffff',
  'primary-fixed-dim': '#b4c5ff',
  'on-secondary-fixed': '#002113',
  'inverse-on-surface': '#eaf1ff',
  'secondary-container': '#6cf8bb',
  'on-tertiary-fixed': '#2a1700',
  'surface-container-high': '#dce9ff',
  'surface-dim': '#cbdbf5',
  'on-surface-variant': '#434655',
  'secondary': '#006c49',
  'outline-variant': '#c3c6d7',
  'primary-fixed': '#dbe1ff',
  'secondary-fixed-dim': '#4edea3',
  'tertiary-fixed': '#ffddb8',
  'secondary-fixed': '#6ffbbe',
  'error': '#ba1a1a',
  'inverse-primary': '#b4c5ff'
};

const spacing = {
  'margin-mobile': '1rem',
  'container-max': '1280px',
  'stack-md': '1rem',
  'stack-xs': '0.25rem',
  'stack-xl': '2.5rem',
  'stack-sm': '0.5rem',
  'gutter': '1.5rem',
  'stack-lg': '1.5rem'
};

let themeStr = '@theme {\n';
for (const [k, v] of Object.entries(newTokens)) {
  themeStr += '  --color-' + k + ': ' + v + ';\n';
}
for (const [k, v] of Object.entries(spacing)) {
  themeStr += '  --spacing-' + k + ': ' + v + ';\n';
}
themeStr += `  --font-body-md: 'Inter', sans-serif;
  --font-headline-lg: 'Plus Jakarta Sans', sans-serif;
  --font-headline-lg-mobile: 'Plus Jakarta Sans', sans-serif;
  --font-title-md: 'Plus Jakarta Sans', sans-serif;
  --font-label-md: 'Inter', sans-serif;
  --font-display-lg: 'Plus Jakarta Sans', sans-serif;
  --font-label-sm: 'Inter', sans-serif;
  --font-body-lg: 'Inter', sans-serif;
  
  --text-body-md: 16px;
  --text-body-md--line-height: 24px;
  --text-body-md--font-weight: 400;
  
  --text-headline-lg: 32px;
  --text-headline-lg--line-height: 40px;
  --text-headline-lg--font-weight: 700;
  
  --text-headline-lg-mobile: 24px;
  --text-headline-lg-mobile--line-height: 32px;
  --text-headline-lg-mobile--font-weight: 700;
  
  --text-title-md: 20px;
  --text-title-md--line-height: 28px;
  --text-title-md--font-weight: 600;
  
  --text-label-md: 14px;
  --text-label-md--line-height: 20px;
  --text-label-md--letter-spacing: 0.01em;
  --text-label-md--font-weight: 500;
  
  --text-display-lg: 48px;
  --text-display-lg--line-height: 1.2;
  --text-display-lg--letter-spacing: -0.02em;
  --text-display-lg--font-weight: 800;
  
  --text-label-sm: 12px;
  --text-label-sm--line-height: 16px;
  --text-label-sm--font-weight: 600;
  
  --text-body-lg: 18px;
  --text-body-lg--line-height: 28px;
  --text-body-lg--font-weight: 400;
}\n`;

const themeRegex = /@theme\s*\{[\s\S]*?\}/;
let newCss = oldCss.replace(themeRegex, themeStr);

const darkRegex = /\.dark\s*\{[\s\S]*?\}/g;
let match;
let lastIndex = 0;
let finalCss = '';
while ((match = darkRegex.exec(newCss)) !== null) {
  finalCss += newCss.substring(lastIndex, match.index);
  let block = match[0];
  if (block.includes('--color-primary')) {
    finalCss += block.replace('.dark {', '.admin-layout.dark {');
  } else {
    finalCss += block;
  }
  lastIndex = match.index + block.length;
}
finalCss += newCss.substring(lastIndex);

finalCss += `
/* Stitch Custom Styles */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .glass-panel {
  background: rgba(33, 49, 69, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
`;

fs.writeFileSync('src/index.css', finalCss);
console.log('index.css updated');
