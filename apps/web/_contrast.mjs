function lum(hex) {
  hex = hex.replace('#', '');
  const c = [0, 1, 2].map(i => parseInt(hex.slice(i * 2, i * 2 + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) {
  const la = lum(a), lb = lum(b);
  const hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}
const pairs = [
  ['#1E293B', '#F4F7F6', 'Deep Slate foreground on Eucalyptus background'],
  ['#1E293B', '#FFFFFF', 'Deep Slate foreground on white card'],
  ['#0A5C66', '#FFFFFF', 'Deep Sea Teal text/links on white card'],
  ['#0A5C66', '#F4F7F6', 'Deep Sea Teal text on background'],
  ['#FFFFFF', '#0A5C66', 'White text on Deep Sea Teal (primary buttons)'],
  ['#FFFFFF', '#0F5460', 'White on teal hover (darker)'],
  ['#FFFFFF', '#084A52', 'White on teal active (darker still)'],
  ['#059669', '#FFFFFF', 'Fresh Mint as text on white'],
  ['#047857', '#FFFFFF', 'Emerald-700 (mint text variant) on white'],
  ['#D97706', '#FFFFFF', 'Warm Ochre as text on white'],
  ['#B45309', '#FFFFFF', 'Amber-700 (ochre text variant) on white'],
  ['#B45309', '#FEF3C7', 'Amber-700 text on amber-50 tint'],
  ['#BE123C', '#FFFFFF', 'Rose-700 accessible red on white'],
  ['#B91C1C', '#FFFFFF', 'Red-700 on white'],
  ['#DC2626', '#FFFFFF', 'Red-600 (current --error) on white'],
  ['#E11D48', '#FFFFFF', 'Rose-600 on white'],
  ['#64748B', '#FFFFFF', 'Muted text on white'],
  ['#475569', '#FFFFFF', 'Secondary text on white'],
  ['#94A3A7', '#E8ECEA', 'Disabled text on disabled surface'],
  ['#475569', '#E2E8F0', 'Slate-600 text on Slate Mist secondary surface'],
  ['#0A5C66', '#D8E2DF', 'Teal indicators on subtle border'],
];
for (const [a, b, label] of pairs) {
  console.log(`${ratio(a, b).toFixed(2).padStart(6)}:1  ${a} on ${b}  ${label}`);
}
