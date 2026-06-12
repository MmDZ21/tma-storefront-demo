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

const stage = (bg) => `
  <rect width="320" height="320" fill="${bg}"/>
  <ellipse cx="160" cy="116" rx="150" ry="96" fill="#ffffff" opacity="0.10"/>`;

/** A bag of coffee with a cream label and a single bean. */
function coffeeBag({ bg, item, itemDark, accent }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" role="img" aria-label="Coffee">${stage(bg)}
  <ellipse cx="160" cy="272" rx="78" ry="12" fill="#000000" opacity="0.08"/>
  <rect x="108" y="78" width="104" height="26" rx="9" fill="${itemDark}"/>
  <rect x="140" y="69" width="40" height="9" rx="4.5" fill="${itemDark}"/>
  <rect x="100" y="100" width="120" height="162" rx="16" fill="${item}"/>
  <rect x="186" y="100" width="34" height="162" rx="16" fill="#000000" opacity="0.10"/>
  <rect x="116" y="150" width="88" height="80" rx="12" fill="#fbf7f0"/>
  <ellipse cx="160" cy="180" rx="15" ry="19" fill="${accent}"/>
  <path d="M160 163 C168 180 152 182 160 197" stroke="#fbf7f0" stroke-width="3" fill="none" stroke-linecap="round"/>
  <rect x="134" y="210" width="52" height="6" rx="3" fill="${accent}" opacity="0.55"/>
</svg>
`;
}

/** A flat-style low-top sneaker. */
function sneaker({ bg, item, itemDark, accent }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" role="img" aria-label="Sneaker">${stage(bg)}
  <ellipse cx="162" cy="246" rx="118" ry="13" fill="#000000" opacity="0.08"/>
  <rect x="48" y="212" width="224" height="32" rx="16" fill="#ffffff"/>
  <rect x="48" y="212" width="224" height="11" rx="5.5" fill="${accent}"/>
  <rect x="70" y="150" width="190" height="70" rx="34" fill="${item}"/>
  <rect x="198" y="158" width="62" height="62" rx="31" fill="${itemDark}"/>
  <rect x="70" y="158" width="54" height="62" rx="26" fill="${itemDark}"/>
  <rect x="92" y="138" width="48" height="30" rx="14" fill="${itemDark}"/>
  <path d="M122 200 L196 172 L206 184 L132 212 Z" fill="#ffffff" opacity="0.92"/>
  <g stroke="#ffffff" stroke-width="5" stroke-linecap="round">
    <line x1="150" y1="166" x2="172" y2="158"/>
    <line x1="156" y1="182" x2="178" y2="174"/>
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
