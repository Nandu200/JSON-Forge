const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// Background gradient
const grad = ctx.createLinearGradient(0, 0, W, H);
grad.addColorStop(0, '#0f172a');
grad.addColorStop(1, '#1e293b');
ctx.fillStyle = grad;
ctx.fillRect(0, 0, W, H);

// Subtle grid pattern
ctx.strokeStyle = 'rgba(59, 130, 246, 0.06)';
ctx.lineWidth = 1;
for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

// Blue accent line at top
ctx.fillStyle = '#2563eb';
ctx.fillRect(0, 0, W, 4);

// Decorative JSON brackets (background) — moved to avoid overlap
ctx.font = 'bold 240px monospace';
ctx.fillStyle = 'rgba(59, 130, 246, 0.04)';
ctx.fillText('{', 20, 260);
ctx.fillText('}', 1000, 350);

// Logo icon background
const iconX = 80, iconY = 120;
const iconSize = 72;
ctx.beginPath();
ctx.roundRect(iconX, iconY, iconSize, iconSize, 14);
ctx.fillStyle = '#2563eb';
ctx.fill();

// Logo icon text { J }
ctx.font = 'bold 36px monospace';
ctx.fillStyle = '#ffffff';
ctx.fillText('{', iconX + 8, iconY + 34);
ctx.font = 'bold 30px monospace';
ctx.fillStyle = '#93c5fd';
ctx.fillText('J', iconX + 23, iconY + 56);
ctx.font = 'bold 36px monospace';
ctx.fillStyle = '#ffffff';
ctx.fillText('}', iconX + 38, iconY + 66);

// App name — positioned after icon with gap
ctx.font = 'bold 68px sans-serif';
ctx.fillStyle = '#f8fafc';
const prettyW = ctx.measureText('Pretty').width;
ctx.fillText('Pretty', 172, 175);
ctx.fillStyle = '#3b82f6';
ctx.fillText('JSON', 172 + prettyW + 8, 175);

// Tagline
ctx.font = '28px sans-serif';
ctx.fillStyle = '#94a3b8';
ctx.fillText('Online JSON Formatter, Validator & Editor', 85, 240);

// Feature pills — row 1
const features = ['Format', 'Validate', 'Tree View', 'Diff', 'Auto-Repair', 'Export'];
let pillX = 85;
const pillY = 290;
ctx.font = '20px monospace';
features.forEach(f => {
  const tw = ctx.measureText(f).width;
  const pw = tw + 28;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pw, 36, 8);
  ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#60a5fa';
  ctx.fillText(f, pillX + 14, pillY + 24);
  pillX += pw + 12;
});

// JSON snippet decoration — lower left, no overlap
const snippetX = 80, snippetY = 370;
ctx.beginPath();
ctx.roundRect(snippetX, snippetY, 440, 200, 12);
ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
ctx.fill();
ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
ctx.lineWidth = 1.5;
ctx.stroke();

ctx.font = '19px monospace';
const codeLines = [
  { parts: [['{', '#94a3b8']] },
  { parts: [['  "name"', '#60a5fa'], [': ', '#94a3b8'], ['"PrettyJSON"', '#34d399'], [',', '#94a3b8']] },
  { parts: [['  "free"', '#60a5fa'], [': ', '#94a3b8'], ['true', '#fbbf24'], [',', '#94a3b8']] },
  { parts: [['  "features"', '#60a5fa'], [': ', '#94a3b8'], ['42', '#f472b6']] },
  { parts: [['}', '#94a3b8']] },
];
codeLines.forEach((line, idx) => {
  let x = snippetX + 24;
  const y = snippetY + 34 + idx * 34;
  line.parts.forEach(([text, color]) => {
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    x += ctx.measureText(text).width;
  });
});

// URL at bottom right
ctx.font = '22px monospace';
ctx.fillStyle = '#64748b';
ctx.fillText('prettyjson.org', W - 85 - ctx.measureText('prettyjson.org').width, H - 30);

// Write PNG
const out = path.join(__dirname, '..', 'public', 'og-image.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(out, buffer);
console.log(`OG image created: ${out} (${(buffer.length / 1024).toFixed(1)} KB)`);
