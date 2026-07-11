// Generates the product images referenced by the products config files.
//
// Why generated: the demo must ship local, license-free imagery with zero
// external dependencies (no stock-photo licensing, no hotlinking). Authoring the
// art as parameterized flat-SVG illustrations keeps every product image
// consistent, tiny, crisp at any size, and trivially re-skinnable. Swap in real
// photos later by replacing the files these paths point at.
//
// Run: npm run gen:images   (outputs are committed; this only needs re-running
// when the product lists or templates change).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Earthy, warm palettes for the coffee catalog. */
const coffeePalettes = [
  { bg: '#efe7dd', item: '#6f4a2f', itemDark: '#573722', accent: '#c98a3c' },
  { bg: '#e9efe6', item: '#4f6b46', itemDark: '#3c5235', accent: '#8bb36b' },
  { bg: '#f1e4e0', item: '#8a3f33', itemDark: '#6d2f26', accent: '#d98a52' },
  { bg: '#e6e9f0', item: '#3f4a6b', itemDark: '#2f3852', accent: '#6f86c9' },
  { bg: '#f0ece1', item: '#b07a2f', itemDark: '#8a5e22', accent: '#e0b15a' },
  { bg: '#eae6ef', item: '#5b4a6b', itemDark: '#463752', accent: '#9b7fc9' },
  { bg: '#e3eeec', item: '#2f6b63', itemDark: '#22524c', accent: '#5fb3a6' },
  { bg: '#f1e7e9', item: '#7a3f50', itemDark: '#5e2f3d', accent: '#c97f93' },
];

/** Vivid, varied palettes for the sneaker catalog. */
const sneakerPalettes = [
  { bg: '#fdece8', item: '#ff4d2e', itemDark: '#d6330f', accent: '#1f2937' },
  { bg: '#e8f0fd', item: '#2f6bff', itemDark: '#1f4fd6', accent: '#0b1220' },
  { bg: '#eafaf0', item: '#18b368', itemDark: '#0f8f50', accent: '#0b2018' },
  { bg: '#fef6e8', item: '#ffae20', itemDark: '#d68a0f', accent: '#1f2937' },
  { bg: '#f3eafd', item: '#8b3dff', itemDark: '#6f24d6', accent: '#120b20' },
  { bg: '#e8fbfd', item: '#14b8c4', itemDark: '#0f93a0', accent: '#07252a' },
  { bg: '#fdeaf2', item: '#ff2e83', itemDark: '#d60f63', accent: '#200b16' },
  { bg: '#eef0f2', item: '#334155', itemDark: '#1f2937', accent: '#ff4d2e' },
];

const stage = ({ bg, item, accent }) => `
  <defs>
    <linearGradient id="stage" x1="24" y1="18" x2="296" y2="302" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ffffff" stop-opacity="0.48"/>
      <stop offset="0.5" stop-color="${bg}"/>
      <stop offset="1" stop-color="${item}" stop-opacity="0.14"/>
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientTransform="translate(86 58) rotate(48) scale(196)">
      <stop stop-color="${accent}" stop-opacity="0.24"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%">
      <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#1c120c" flood-opacity="0.22"/>
    </filter>
  </defs>
  <rect width="320" height="320" fill="url(#stage)"/>
  <rect width="320" height="320" fill="url(#glow)"/>
  <circle cx="276" cy="46" r="54" fill="#ffffff" opacity="0.16"/>`;

/** A bag of coffee with a cream label and a single bean. */
function coffeeBag({ bg, item, itemDark, accent }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" role="img" aria-label="Coffee">${stage({ bg, item, accent })}
  <ellipse cx="160" cy="276" rx="78" ry="12" fill="#1c120c" opacity="0.12"/>
  <g filter="url(#shadow)">
    <path d="M102 94h116l-8 170c-.5 10-8.8 18-18.8 18h-62.4c-10 0-18.3-8-18.8-18L102 94Z" fill="${item}"/>
    <path d="M102 94h116l-2 36H104l-2-36Z" fill="${itemDark}"/>
    <path d="M118 111h84" stroke="#ffffff" stroke-opacity="0.26" stroke-width="2"/>
    <path d="M194 130h22l-6 134c-.5 10-8.8 18-18.8 18H180c11-4 14-12 14-25V130Z" fill="#000000" opacity="0.08"/>
    <rect x="119" y="151" width="82" height="87" rx="14" fill="#fffaf2"/>
    <text x="160" y="169" text-anchor="middle" fill="${itemDark}" font-size="8" font-family="Arial, sans-serif" font-weight="700" letter-spacing="1.6">ROAST</text>
    <ellipse cx="160" cy="191" rx="15" ry="19" fill="${accent}"/>
    <path d="M160 174c8 17-8 19 0 34" stroke="#fffaf2" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M137 220h46" stroke="${itemDark}" stroke-opacity="0.34" stroke-width="3" stroke-linecap="round"/>
    <path d="M145 227h30" stroke="${itemDark}" stroke-opacity="0.2" stroke-width="2" stroke-linecap="round"/>
  </g>
  <g fill="${itemDark}" opacity="0.7">
    <ellipse cx="74" cy="252" rx="8" ry="11" transform="rotate(-34 74 252)"/>
    <ellipse cx="245" cy="246" rx="7" ry="10" transform="rotate(28 245 246)"/>
  </g>
</svg>
`;
}

/** A flat-style low-top sneaker. */
function sneaker({ bg, item, itemDark, accent }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" role="img" aria-label="Sneaker">${stage({ bg, item, accent })}
  <ellipse cx="162" cy="253" rx="118" ry="13" fill="#111827" opacity="0.12"/>
  <g filter="url(#shadow)" transform="rotate(-5 160 190)">
    <path d="M53 207c34-7 57-31 78-79l45 20c18 8 30 26 51 33l43 15c8 3 14 11 14 20v9H50v-10c0-4 1-6 3-8Z" fill="${item}"/>
    <path d="M131 128l45 20c13 6 23 17 35 25l-25 25-67-30 12-40Z" fill="${itemDark}"/>
    <path d="m126 169 61 27-13 17-65-28 17-16Z" fill="#ffffff" opacity="0.9"/>
    <g stroke="#ffffff" stroke-width="5" stroke-linecap="round">
      <path d="m146 150 27 12"/>
      <path d="m139 161 28 12"/>
      <path d="m133 172 27 12"/>
    </g>
    <path d="M49 216h236v17c0 8-7 15-15 15H65c-9 0-16-7-16-16v-16Z" fill="#fff"/>
    <path d="M63 233h198" stroke="${accent}" stroke-opacity="0.42" stroke-width="4" stroke-linecap="round" stroke-dasharray="7 8"/>
  </g>
</svg>
`;
}

const sets = [
  { file: 'public/config/products.coffee.json', template: coffeeBag, palettes: coffeePalettes },
  { file: 'public/config/products.sneakers.json', template: sneaker, palettes: sneakerPalettes },
];

let count = 0;
for (const set of sets) {
  const data = JSON.parse(readFileSync(join(root, set.file), 'utf8'));
  data.products.forEach((product, i) => {
    const palette = set.palettes[i % set.palettes.length];
    const relative = product.image.replace(/^\//, '');
    const outPath = join(root, 'public', relative);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, set.template(palette), 'utf8');
    count += 1;
  });
}

console.log(`Generated ${count} product images.`);
