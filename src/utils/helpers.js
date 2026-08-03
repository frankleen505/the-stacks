export function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function formatPrice(amount) {
  return `₦{amount.toFixed(2)}`;
}

export function priceFor(type, seed) {
  const ranges = {
    movie: [3500, 9000],
    manga: [1500, 3500],
    book: [2500, 6000],
    comic: [1200, 3000],
  };
  const [lo, hi] = ranges[type] || [2000, 5000];
  const t = (hashStr(seed) % 1000) / 1000;
  return Math.round((lo + t * (hi - lo)) * 100) / 100;
}

export function ratingFor(seed) {
  const t = (hashStr(seed + "r") % 1000) / 1000;
  return Math.round((3.4 + t * 1.6) * 10) / 10;
}

export function wrapLines(text, max) {
  const words = (text || "Untitled").split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      if (cur) lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
    if (lines.length === 3) break;
  }
  if (cur && lines.length < 3) lines.push(cur.trim());
  return lines.slice(0, 3);
}

export function placeholderCover(title, color) {
  const lines = wrapLines(title, 16);
  const textEls = lines
    .map(
      (l, i) =>
        `<text x="90" y="${150 + i * 24}" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#F3EFE4">${l
          .replace(/&/g, "&amp;")
          .replace(/</g, "")}</text>`
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="260" viewBox="0 0 180 260">
    <rect width="180" height="260" fill="${color}"/>
    <rect x="8" y="8" width="164" height="244" fill="none" stroke="#F3EFE4" stroke-opacity="0.5" stroke-width="1.5"/>
    <line x1="8" y1="40" x2="172" y2="40" stroke="#F3EFE4" stroke-opacity="0.5" stroke-width="1"/>
    ${textEls}
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
