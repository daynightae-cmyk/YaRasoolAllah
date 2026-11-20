/**
 * Build the illustrative Seerah environment plates.
 *
 * These are art-directed landscape illustrations: terrain, sky, palms, tents,
 * fortifications and architecture only. They contain no people, no sacred
 * personalities, no angels, no calligraphy and no embedded UI text. Every plate
 * is disclosed in the interface as an illustrative reconstruction, never as
 * documentary or archaeological evidence.
 *
 * The generator is deterministic (seeded), so re-running it reproduces the
 * same plates. Output: client/public/visual-golden/art/scene-*.svg
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const W = 1600;
const H = 900;
const OUT = resolve("client/public/visual-golden/art");

/* ------------------------------------------------------------------ */
/* Seeded randomness                                                    */
/* ------------------------------------------------------------------ */

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Terrain                                                              */
/* ------------------------------------------------------------------ */

/**
 * One faceted mountain: a dark flank, a lit flank and a centre ridge facet,
 * with a thin rim light along the sun-facing ridge.
 */
function peak(rng, { cx, baseY, height, width, palette, rim = true, detail = true }) {
  const apexX = cx + (rng() - 0.5) * width * 0.16;
  const apexY = baseY - height;
  const left = cx - width / 2;
  const right = cx + width / 2;
  const lx = cx - width * (0.16 + rng() * 0.08);
  const ly = apexY + height * (0.3 + rng() * 0.14);
  const rx = cx + width * (0.14 + rng() * 0.1);
  const ry = apexY + height * (0.28 + rng() * 0.16);
  const midL = cx - width * 0.32;
  const midR = cx + width * 0.34;
  const baseMid = cx + (rng() - 0.5) * width * 0.08;

  let out = `<g>`;
  out += `<path d="M${left.toFixed(1)} ${baseY} L${lx.toFixed(1)} ${ly.toFixed(1)} L${apexX.toFixed(1)} ${apexY.toFixed(1)} L${baseMid.toFixed(1)} ${baseY} Z" fill="${palette.dark}"/>`;
  out += `<path d="M${baseMid.toFixed(1)} ${baseY} L${apexX.toFixed(1)} ${apexY.toFixed(1)} L${rx.toFixed(1)} ${ry.toFixed(1)} L${right.toFixed(1)} ${baseY} Z" fill="${palette.mid}"/>`;
  out += `<path d="M${lx.toFixed(1)} ${ly.toFixed(1)} L${apexX.toFixed(1)} ${apexY.toFixed(1)} L${rx.toFixed(1)} ${ry.toFixed(1)} L${baseMid.toFixed(1)} ${baseY} Z" fill="${palette.light}" opacity="0.9"/>`;
  out += `<path d="M${midL.toFixed(1)} ${baseY} L${lx.toFixed(1)} ${ly.toFixed(1)} L${baseMid.toFixed(1)} ${baseY} Z" fill="${palette.shadow}" opacity="0.55"/>`;
  out += `<path d="M${baseMid.toFixed(1)} ${baseY} L${rx.toFixed(1)} ${ry.toFixed(1)} L${midR.toFixed(1)} ${baseY} Z" fill="${palette.shadow}" opacity="0.28"/>`;
  if (rim) {
    out += `<path d="M${apexX.toFixed(1)} ${apexY.toFixed(1)} L${rx.toFixed(1)} ${ry.toFixed(1)}" stroke="${palette.rim}" stroke-width="2" opacity="0.55" fill="none"/>`;
  }
  if (detail) {
    out += `<path d="M${apexX.toFixed(1)} ${apexY.toFixed(1)} L${(apexX + width * 0.04).toFixed(1)} ${(apexY + height * 0.45).toFixed(1)} L${(apexX - width * 0.03).toFixed(1)} ${(baseY - height * 0.06).toFixed(1)}" stroke="${palette.shadow}" stroke-width="1.6" opacity="0.4" fill="none"/>`;
    out += `<path d="M${lx.toFixed(1)} ${ly.toFixed(1)} L${(lx - width * 0.05).toFixed(1)} ${(baseY - height * 0.12).toFixed(1)}" stroke="${palette.shadow}" stroke-width="1.2" opacity="0.3" fill="none"/>`;
  }
  out += `</g>`;
  return out;
}

function range(rng, { baseY, count, minH, maxH, palette, opacity = 1, detail = true }) {
  const step = (W + 320) / count;
  let out = `<g opacity="${opacity}">`;
  for (let i = 0; i < count; i += 1) {
    const cx = -160 + step * i + (rng() - 0.5) * step * 0.55;
    const h = minH + rng() * (maxH - minH);
    const w = step * (1.15 + rng() * 0.75);
    out += peak(rng, { cx, baseY, height: h, width: w, palette, detail });
  }
  out += `<rect x="-120" y="${baseY - 2}" width="${W + 240}" height="${H - baseY + 60}" fill="${palette.base}"/>`;
  out += `</g>`;
  return out;
}

function dune(y, amp, color, opacity = 1, phase = 0, steps = 44) {
  let d = `M-60 ${H + 40} L-60 ${y.toFixed(1)}`;
  for (let i = 0; i <= steps; i += 1) {
    const x = -60 + (i / steps) * (W + 120);
    const yy =
      y +
      Math.sin((x / W) * Math.PI * 3 + phase) * amp +
      Math.sin((x / W) * Math.PI * 7.3 + phase * 2.1) * amp * 0.32;
    d += ` L${x.toFixed(1)} ${yy.toFixed(1)}`;
  }
  d += ` L${W + 60} ${H + 40} Z`;
  return `<path d="${d}" fill="${color}" opacity="${opacity}"/>`;
}

/* ------------------------------------------------------------------ */
/* Props                                                                */
/* ------------------------------------------------------------------ */

function palm(x, y, s, { trunk = "#241a12", leaf = "#1d3524", opacity = 1, lean = 0 } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${opacity}">
    <ellipse cx="4" cy="2" rx="26" ry="7" fill="#000" opacity="0.18"/>
    <path d="M-2 0 C${-6 + lean} -20 ${-8 + lean} -38 ${-3 + lean} -58 L${4 + lean} -58 C${4 + lean} -38 ${4 + lean} -20 5 0 Z" fill="${trunk}"/>
    <g stroke="${trunk}" stroke-width="1.2" opacity="0.5">
      <path d="M-1 -12 H4 M-2 -24 H4 M-2 -36 H4 M-2 -48 H4"/>
    </g>
    <g fill="${leaf}">
      <path d="M${1 + lean} -58 C-18 -66 -38 -64 -52 -53 C-34 -58 -16 -57 ${1 + lean} -51 Z"/>
      <path d="M${1 + lean} -58 C20 -70 42 -70 56 -59 C38 -62 18 -60 ${1 + lean} -51 Z"/>
      <path d="M${1 + lean} -58 C-12 -78 -32 -85 -48 -80 C-28 -75 -12 -66 ${1 + lean} -53 Z"/>
      <path d="M${1 + lean} -58 C15 -82 36 -88 52 -83 C34 -77 16 -66 ${1 + lean} -53 Z"/>
      <path d="M${1 + lean} -58 C-4 -80 0 -96 9 -106 C7 -88 6 -72 ${3 + lean} -56 Z"/>
      <path d="M${1 + lean} -58 C8 -78 20 -89 32 -94 C20 -78 11 -67 ${3 + lean} -56 Z"/>
      <path d="M${1 + lean} -58 C-6 -72 -18 -82 -30 -86 C-18 -72 -7 -64 ${1 + lean} -56 Z"/>
      <path d="M${1 + lean} -58 C12 -62 26 -60 38 -52 C24 -54 12 -54 ${1 + lean} -52 Z" opacity="0.8"/>
    </g>
    <ellipse cx="${1 + lean}" cy="-55" rx="4" ry="3" fill="${trunk}"/>
  </g>`;
}

function bush(x, y, s, color = "#2a3a26", opacity = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${color}" opacity="${opacity}">
    <ellipse cx="0" cy="0" rx="26" ry="12"/>
    <ellipse cx="-16" cy="-6" rx="14" ry="9"/>
    <ellipse cx="14" cy="-8" rx="16" ry="10"/>
    <ellipse cx="2" cy="-12" rx="12" ry="8"/>
  </g>`;
}

function tent(x, y, s, { cloth = "#b9a382", shade = "#7d6a52", pole = "#3a2c1e", opacity = 1 } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${opacity}">
    <ellipse cx="0" cy="2" rx="48" ry="9" fill="#000" opacity="0.2"/>
    <path d="M-46 0 C-38 -30 -22 -46 0 -50 C22 -46 38 -30 46 0 Z" fill="${cloth}"/>
    <path d="M-46 0 C-38 -30 -22 -46 0 -50 L0 0 Z" fill="${shade}" opacity="0.55"/>
    <path d="M0 -50 L0 0" stroke="${pole}" stroke-width="2"/>
    <path d="M-52 0 H52" stroke="${pole}" stroke-width="2" opacity="0.7"/>
    <path d="M0 -50 L-10 -62 L8 -58 Z" fill="${shade}" opacity="0.8"/>
    <path d="M-30 -14 C-18 -22 18 -22 30 -14" stroke="${shade}" stroke-width="1.2" fill="none" opacity="0.5"/>
  </g>`;
}

function banner(x, y, s, { pole = "#2c2118", cloth = "#1f4d3a", accent = "#d6b26a", opacity = 1 } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${opacity}">
    <path d="M0 0 V-96" stroke="${pole}" stroke-width="3"/>
    <path d="M0 -94 C10 -92 18 -96 28 -92 L28 -54 C18 -50 10 -54 0 -52 Z" fill="${cloth}"/>
    <path d="M0 -92 C8 -90 14 -92 20 -90" stroke="${accent}" stroke-width="1.4" fill="none" opacity="0.8"/>
    <path d="M0 -72 C6 -70 12 -72 20 -70" stroke="${accent}" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M-4 -96 L0 -106 L4 -96 Z" fill="${accent}"/>
  </g>`;
}

function crenellations(x, y, width, { color, step = 26, height = 14, opacity = 1 }) {
  let d = `M${x} ${y}`;
  const count = Math.max(1, Math.round(width / step));
  for (let i = 0; i < count; i += 1) {
    const bx = x + i * step;
    d += ` L${bx} ${y - height} L${bx + step * 0.55} ${y - height} L${bx + step * 0.55} ${y} L${bx + step} ${y}`;
  }
  d += ` L${x + width} ${y} Z`;
  return `<path d="${d}" fill="${color}" opacity="${opacity}"/>`;
}

function village(rng, x, y, width, { wall = "#8a6a4c", roof = "#6d523a", lit = "#ffc978", scale = 1 }) {
  let out = "";
  let cursor = x;
  while (cursor < x + width) {
    const w = (20 + rng() * 36) * scale;
    const h = (16 + rng() * 40) * scale;
    const top = y - h;
    out += `<g>`;
    out += `<rect x="${cursor.toFixed(1)}" y="${top.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${wall}"/>`;
    out += `<rect x="${cursor.toFixed(1)}" y="${top.toFixed(1)}" width="${w.toFixed(1)}" height="${(h * 0.24).toFixed(1)}" fill="${roof}" opacity="0.6"/>`;
    out += `<rect x="${cursor.toFixed(1)}" y="${top.toFixed(1)}" width="${(w * 0.22).toFixed(1)}" height="${h.toFixed(1)}" fill="#000" opacity="0.14"/>`;
    if (rng() > 0.35) {
      out += `<rect x="${(cursor + w * 0.36).toFixed(1)}" y="${(y - h * 0.55).toFixed(1)}" width="${Math.max(2.5, w * 0.13).toFixed(1)}" height="${Math.max(4, h * 0.22).toFixed(1)}" fill="${lit}" opacity="0.85"/>`;
    }
    if (rng() > 0.72) {
      out += `<path d="M${(cursor + w * 0.18).toFixed(1)} ${top.toFixed(1)} q${(w * 0.32).toFixed(1)} ${(-h * 0.32).toFixed(1)} ${(w * 0.64).toFixed(1)} 0" fill="none" stroke="${roof}" stroke-width="2" opacity="0.6"/>`;
    }
    out += `</g>`;
    cursor += w + (2 + rng() * 10) * scale;
  }
  return out;
}

function fort(x, y, s, { stone = "#7b5f43", dark = "#4a3827", light = "#a9875f", opacity = 1, banners = true } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${opacity}">
    <ellipse cx="0" cy="2" rx="140" ry="18" fill="#000" opacity="0.22"/>
    <path d="M-130 0 L-116 -92 L-72 -108 L-58 -156 L-20 -156 L-10 -110 L36 -110 L44 -166 L84 -166 L94 -108 L130 -98 L142 0 Z" fill="${stone}"/>
    <path d="M-130 0 L-116 -92 L-72 -108 L-58 -156 L-20 -156 L-10 -110 L36 -110 L44 -166 L84 -166 L94 -108 L130 -98 L142 0 Z" fill="${dark}" opacity="0.22"/>
    <path d="M-58 -156 L-20 -156 L-10 -110 L-58 -110 Z" fill="${light}" opacity="0.25"/>
    ${crenellations(-114, -92, 226, { color: dark, step: 22, height: 12 })}
    ${crenellations(-54, -156, 72, { color: dark, step: 18, height: 10 })}
    ${crenellations(48, -166, 72, { color: dark, step: 18, height: 10 })}
    <path d="M-18 0 L-14 -60 L24 -60 L28 0 Z" fill="${dark}"/>
    <rect x="-74" y="-82" width="13" height="19" rx="6.5" fill="${light}" opacity="0.4"/>
    <rect x="56" y="-76" width="13" height="19" rx="6.5" fill="${light}" opacity="0.4"/>
    <rect x="-30" y="-132" width="9" height="14" rx="4.5" fill="${light}" opacity="0.4"/>
    <path d="M-42 0 L-38 -30 L-10 -30 L-6 0 Z" fill="${light}" opacity="0.16"/>
    ${banners ? `<g><path d="M-100 -110 V-150" stroke="#2c2118" stroke-width="2"/><path d="M-100 -148 h18 v28 h-18 Z" fill="#1f4d3a"/><path d="M84 -120 V-158" stroke="#2c2118" stroke-width="2"/><path d="M84 -156 h16 v26 h-16 Z" fill="#5a2a22"/></g>` : ""}
  </g>`;
}

function camel(x, y, s, color, opacity = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${color}" opacity="${opacity}">
    <path d="M0 0 C2 -7 7 -11 14 -11 L20 -11 C22 -18 26 -23 30 -23 C32 -23 34 -21 34 -19 L34 -10 L40 -10 C46 -10 50 -6 52 0 L48 0 C46 -4 43 -6 39 -6 L15 -6 C11 -6 8 -4 6 0 Z"/>
    <path d="M8 0 L7 10 L4 10 L5 0 Z"/>
    <path d="M15 0 L14 11 L11 11 L12 0 Z"/>
    <path d="M38 0 L39 10 L42 10 L41 0 Z"/>
    <path d="M45 0 L46 11 L49 11 L48 0 Z"/>
    <path d="M33 -20 L36 -25 L38 -25 L36 -19 Z"/>
  </g>`;
}

function well(x, y, s, { stone = "#8d775a", dark = "#4d3d2b", water = "#2f4d54" } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="0" rx="32" ry="10" fill="#000" opacity="0.25"/>
    <path d="M-26 0 C-26 -12 26 -12 26 0 L26 8 C26 18 -26 18 -26 8 Z" fill="${stone}"/>
    <path d="M-26 0 C-26 -12 26 -12 26 0" stroke="${dark}" stroke-width="2" fill="none"/>
    <ellipse cx="0" cy="0" rx="21" ry="6" fill="${water}"/>
    <path d="M-26 4 C-16 8 16 8 26 4" stroke="${dark}" stroke-width="1.5" fill="none" opacity="0.6"/>
    <path d="M-18 8 V14 M0 9 V16 M18 8 V14" stroke="${dark}" stroke-width="1.2" opacity="0.5"/>
  </g>`;
}

function lantern(x, y, s, { glow = "#ffca7a", frame = "#2a2018" } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="0" r="58" fill="url(#lampGlow)" opacity="0.95"/>
    <path d="M0 -34 V-46" stroke="${frame}" stroke-width="2"/>
    <path d="M-10 -34 L10 -34 L14 -22 L10 10 L-10 10 L-14 -22 Z" fill="${frame}"/>
    <path d="M-7 -30 L7 -30 L10 -21 L7 6 L-7 6 L-10 -21 Z" fill="${glow}" opacity="0.95"/>
    <path d="M-7 -30 L7 -30 M-9 -12 L9 -12 M-7 6 L7 6" stroke="${frame}" stroke-width="1.2"/>
    <path d="M0 10 L0 18" stroke="${frame}" stroke-width="2"/>
  </g>`;
}

function stars(rng, count, maxY = 480) {
  let out = "";
  for (let i = 0; i < count; i += 1) {
    const x = rng() * W;
    const y = rng() * maxY;
    const r = 0.5 + rng() * 1.4;
    const o = 0.2 + rng() * 0.7;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#f4ecd2" opacity="${o.toFixed(2)}"/>`;
  }
  return out;
}

function haze(y, height, color, opacity) {
  return `<rect x="0" y="${y}" width="${W}" height="${height}" fill="url(#hazeFade)" opacity="${opacity}" style="color:${color}"/>`;
}

function foregroundRocks(rng, { color = "#120d09", side = "both" } = {}) {
  let out = "";
  if (side === "both" || side === "left") {
    out += `<path d="M-40 900 L-40 760 L60 730 L150 780 L210 900 Z" fill="${color}"/>`;
    out += `<path d="M-40 760 L60 730 L150 780 L70 820 Z" fill="${color}" opacity="0.7"/>`;
  }
  if (side === "both" || side === "right") {
    out += `<path d="M1640 900 L1640 750 L1540 720 L1440 790 L1390 900 Z" fill="${color}"/>`;
    out += `<path d="M1640 750 L1540 720 L1440 790 L1530 830 Z" fill="${color}" opacity="0.7"/>`;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Scene shell                                                          */
/* ------------------------------------------------------------------ */

function defs({ sky, horizon, ground, glowColor }) {
  return `<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${sky[0]}"/>
      <stop offset="0.52" stop-color="${sky[1]}"/>
      <stop offset="1" stop-color="${horizon}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${glowColor}" stop-opacity="0.95"/>
      <stop offset="0.24" stop-color="${glowColor}" stop-opacity="0.55"/>
      <stop offset="0.58" stop-color="${glowColor}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${glowColor}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffe4a6" stop-opacity="0.95"/>
      <stop offset="0.3" stop-color="#f0b45a" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#f0b45a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="hazeFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="currentColor" stop-opacity="0"/>
      <stop offset="0.5" stop-color="currentColor" stop-opacity="0.6"/>
      <stop offset="1" stop-color="currentColor" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${ground[0]}"/>
      <stop offset="1" stop-color="${ground[1]}"/>
    </linearGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.42" r="0.8">
      <stop offset="0.4" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.62"/>
    </radialGradient>
    <pattern id="girih" width="76" height="76" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="#e2c07a" stroke-opacity="0.5" stroke-width="1.1">
        <path d="M38 2 74 38 38 74 2 38Z"/>
        <path d="M38 14 62 38 38 62 14 38Z"/>
        <circle cx="38" cy="38" r="9"/>
        <path d="M0 0 12 12M76 0 64 12M0 76 12 64M76 76 64 64"/>
      </g>
    </pattern>
    <pattern id="ashlar" width="150" height="64" patternUnits="userSpaceOnUse">
      <path d="M0 0H150V64H0Z" fill="none" stroke="#0d0906" stroke-opacity="0.4" stroke-width="1.4"/>
      <path d="M0 32H150M75 0V32M30 32V64M120 32V64" stroke="#0d0906" stroke-opacity="0.26" stroke-width="1"/>
      <path d="M0 2H150M0 34H150" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
    <filter id="soft"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="soft8"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.055"/></feComponentTransfer>
    </filter>
  </defs>`;
}

function frame(content, { vignette = true, grain = true } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
  ${content}
  ${grain ? `<rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.55"/>` : ""}
  ${vignette ? `<rect width="${W}" height="${H}" fill="url(#vignette)"/>` : ""}
</svg>
`;
}

/* ------------------------------------------------------------------ */
/* Palettes                                                             */
/* ------------------------------------------------------------------ */

const P = {
  farWarm: { dark: "#6d4d3c", mid: "#8a6448", light: "#a87a54", shadow: "#4a3226", rim: "#e8b978", base: "#7a5638" },
  midWarm: { dark: "#4a3326", mid: "#63452f", light: "#7d5a3c", shadow: "#2e1f16", rim: "#d8a066", base: "#543a28" },
  nearWarm: { dark: "#2a1d14", mid: "#3a2a1c", light: "#4a3624", shadow: "#150e09", rim: "#c98a4a", base: "#33241a" },
  farBlue: { dark: "#243646", mid: "#31485a", light: "#3e5a6e", shadow: "#16242e", rim: "#8fb6cc", base: "#2a3e4c" },
  midBlue: { dark: "#16242e", mid: "#20343f", light: "#2a4450", shadow: "#0b1319", rim: "#7aa0b4", base: "#1a2a34" },
  nearBlue: { dark: "#0a1116", mid: "#101c24", light: "#182832", shadow: "#05090c", rim: "#5e8498", base: "#0c151a" },
  farDust: { dark: "#6d5a44", mid: "#877052", light: "#a08662", shadow: "#4a3c2c", rim: "#d8b98a", base: "#7a6448" },
  midDust: { dark: "#4a3c2c", mid: "#5e4c36", light: "#725c42", shadow: "#2a2018", rim: "#c9a878", base: "#54442f" },
  nearDust: { dark: "#2a2018", mid: "#362a1e", light: "#443426", shadow: "#140f0a", rim: "#a8845a", base: "#30241a" },
  farCold: { dark: "#4a5a66", mid: "#5e707c", light: "#748894", shadow: "#36444e", rim: "#c8d8de", base: "#566872" },
  midCold: { dark: "#36444e", mid: "#46565f", light: "#586a74", shadow: "#222c33", rim: "#a8bcc4", base: "#3e4c55" },
  nearCold: { dark: "#1c262c", mid: "#26323a", light: "#32404a", shadow: "#0c1216", rim: "#7e98a4", base: "#222c33" },
};

/* ------------------------------------------------------------------ */
/* Scene definitions                                                    */
/* ------------------------------------------------------------------ */

const scenes = {};

/* --- Gateway: monumental night entrance ----------------------------- */
scenes["scene-gateway"] = () => {
  const rng = mulberry32(1101);
  return frame(`${defs({
    sky: ["#02050d", "#081726"],
    horizon: "#16323a",
    ground: ["#2b2118", "#0b0805"],
    glowColor: "#ffca7a",
  })}
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${stars(rng, 110, 400)}
  <circle cx="1270" cy="140" r="220" fill="url(#glow)" opacity="0.7"/>
  <circle cx="1270" cy="140" r="40" fill="#f3e8ca" opacity="0.95"/>
  <circle cx="1258" cy="132" r="38" fill="#081726" opacity="0.6"/>
  ${range(rng, { baseY: 560, count: 7, minH: 90, maxH: 210, palette: P.farBlue, opacity: 0.85 })}
  ${range(rng, { baseY: 650, count: 5, minH: 60, maxH: 150, palette: P.midBlue, opacity: 0.9 })}
  <rect y="640" width="${W}" height="260" fill="url(#groundGrad)"/>

  <!-- distant town seen through the doorway -->
  <g opacity="0.9">
    <ellipse cx="800" cy="700" rx="330" ry="130" fill="url(#glow)"/>
    ${village(rng, 600, 720, 400, { wall: "#5a4430", roof: "#3d2d1f", lit: "#ffcf87", scale: 1.15 })}
    ${palm(590, 740, 1.2, { trunk: "#20160f", leaf: "#132a1e" })}
    ${palm(1010, 744, 1.35, { trunk: "#20160f", leaf: "#132a1e" })}
  </g>

  <!-- gate facade -->
  <path fill="#3a2b1f" fill-rule="evenodd" d="M0 260 H${W} V${H} H0 Z M560 900 V430 C560 310 660 220 800 220 C940 220 1040 310 1040 430 V900 Z"/>
  <path fill="url(#ashlar)" fill-rule="evenodd" d="M0 260 H${W} V${H} H0 Z M560 900 V430 C560 310 660 220 800 220 C940 220 1040 310 1040 430 V900 Z" opacity="0.8"/>
  <path fill="url(#girih)" fill-rule="evenodd" d="M0 260 H${W} V${H} H0 Z M560 900 V430 C560 310 660 220 800 220 C940 220 1040 310 1040 430 V900 Z" opacity="0.3"/>

  <!-- side pilasters and capitals -->
  <g fill="#4a3827">
    <rect x="470" y="300" width="46" height="600"/>
    <rect x="1084" y="300" width="46" height="600"/>
    <rect x="456" y="286" width="74" height="26" rx="4" fill="#6b513a"/>
    <rect x="1070" y="286" width="74" height="26" rx="4" fill="#6b513a"/>
    <rect x="440" y="880" width="106" height="20" fill="#6b513a"/>
    <rect x="1054" y="880" width="106" height="20" fill="#6b513a"/>
  </g>

  <!-- arch bands -->
  <path d="M534 900 V430 C534 296 646 200 800 200 C954 200 1066 296 1066 430 V900" fill="none" stroke="#c9a361" stroke-width="6" opacity="0.75"/>
  <path d="M514 900 V430 C514 280 638 182 800 182 C962 182 1086 280 1086 430 V900" fill="none" stroke="#8a6a3d" stroke-width="18" opacity="0.5"/>
  <path d="M494 900 V430 C494 264 630 164 800 164 C970 164 1106 264 1106 430 V900" fill="none" stroke="#3a2b1f" stroke-width="26" opacity="0.7"/>
  <path d="M800 164 V206" stroke="#e2c07a" stroke-width="10" opacity="0.65"/>
  <path d="M770 176 C784 168 816 168 830 176" stroke="#e2c07a" stroke-width="3" fill="none" opacity="0.5"/>

  <!-- warm depth behind doors -->
  <rect x="560" y="430" width="480" height="470" fill="url(#glow)" opacity="0.5"/>

  <!-- doors -->
  <g>
    <rect x="562" y="440" width="236" height="360" fill="#4a2f1a"/>
    <rect x="802" y="440" width="236" height="360" fill="#432a17"/>
    <rect x="562" y="440" width="236" height="360" fill="url(#ashlar)" opacity="0.14"/>
    <rect x="802" y="440" width="236" height="360" fill="url(#ashlar)" opacity="0.14"/>
    <g fill="none" stroke="#c9a361" stroke-width="3" opacity="0.7">
      <path d="M680 570 l36 36 -36 36 -36 -36 Z"/>
      <path d="M680 590 l16 16 -16 16 -16 -16 Z"/>
      <path d="M920 570 l36 36 -36 36 -36 -36 Z"/>
      <path d="M920 590 l16 16 -16 16 -16 -16 Z"/>
    </g>
    <g fill="#241a12">
      <rect x="562" y="480" width="236" height="12"/>
      <rect x="562" y="750" width="236" height="12"/>
      <rect x="802" y="480" width="236" height="12"/>
      <rect x="802" y="750" width="236" height="12"/>
      <rect x="670" y="440" width="10" height="360" opacity="0.5"/>
      <rect x="910" y="440" width="10" height="360" opacity="0.5"/>
    </g>
    ${Array.from({ length: 7 }, (_, i) => `<circle cx="${590 + i * 34}" cy="510" r="4" fill="#1d1711"/><circle cx="${830 + i * 34}" cy="510" r="4" fill="#1d1711"/><circle cx="${590 + i * 34}" cy="730" r="4" fill="#1d1711"/><circle cx="${830 + i * 34}" cy="730" r="4" fill="#1d1711"/>`).join("")}
    <g fill="none" stroke="#d8b26a" stroke-width="5" opacity="0.9">
      <circle cx="784" cy="630" r="17"/>
      <circle cx="816" cy="630" r="17"/>
    </g>
    <rect x="796" y="440" width="8" height="360" fill="#ffd48a" opacity="0.9"/>
    <rect x="764" y="440" width="72" height="360" fill="url(#glow)" opacity="0.5"/>
  </g>

  <!-- lanterns -->
  ${lantern(420, 400, 1.2)}
  ${lantern(1180, 400, 1.2)}
  <path d="M420 310 V344 M1180 310 V344" stroke="#2a2018" stroke-width="4"/>
  <path d="M390 310 H450 M1150 310 H1210" stroke="#3a2c1e" stroke-width="6"/>

  <!-- steps -->
  <path d="M470 812 H1130 L1180 900 H420 Z" fill="#5b4632"/>
  <path d="M470 812 H1130" stroke="#c9a361" stroke-width="2" opacity="0.45"/>
  <path d="M500 856 H1100 L1120 900 H480 Z" fill="#4a3827"/>
  <path d="M500 856 H1100" stroke="#c9a361" stroke-width="1.6" opacity="0.3"/>
  <ellipse cx="800" cy="806" rx="380" ry="60" fill="#ffca7a" opacity="0.12"/>
  ${foregroundRocks(rng, { color: "#0c0805" })}
  `);
};

/* --- Makkah: pre-message valley ------------------------------------- */
scenes["scene-makkah"] = () => {
  const rng = mulberry32(2201);
  return frame(`${defs({
    sky: ["#1d2b36", "#7a5a42"],
    horizon: "#e7b978",
    ground: ["#7a5638", "#3a2718"],
    glowColor: "#ffd08a",
  })}
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <ellipse cx="900" cy="500" rx="500" ry="140" fill="#f0c48a" opacity="0.12" filter="url(#soft)"/>
  <circle cx="1040" cy="470" r="250" fill="url(#glow)" opacity="0.8"/>
  <circle cx="1040" cy="470" r="44" fill="#ffe0a3" opacity="0.95"/>
  ${range(rng, { baseY: 560, count: 7, minH: 120, maxH: 260, palette: P.farWarm, opacity: 0.75 })}
  ${range(rng, { baseY: 650, count: 5, minH: 80, maxH: 180, palette: P.midWarm, opacity: 0.9 })}
  ${dune(720, 24, "#8a6240", 1, 0.4)}
  ${dune(790, 18, "#6d4a2f", 1, 2.2)}
  ${village(rng, 380, 730, 540, { wall: "#6d4d33", roof: "#4a3322", lit: "#ffc978", scale: 1.2 })}
  ${village(rng, 980, 720, 300, { wall: "#5f432c", roof: "#402c1d", lit: "#ffc978", scale: 1 })}
  ${palm(250, 790, 1.5, { trunk: "#2a1c12", leaf: "#233a25" })}
  ${palm(310, 810, 1.1, { trunk: "#2a1c12", leaf: "#1d3320" })}
  ${palm(1330, 800, 1.6, { trunk: "#2a1c12", leaf: "#233a25" })}
  ${palm(1280, 820, 1.2, { trunk: "#2a1c12", leaf: "#1d3320" })}
  ${palm(560, 760, 0.8, { trunk: "#2a1c12", leaf: "#1d3320", opacity: 0.9 })}
  ${bush(720, 790, 0.8, "#2a3a26", 0.8)}
  ${bush(900, 800, 0.6, "#2a3a26", 0.7)}
  ${haze(590, 150, "#e7b978", 0.4)}
  ${foregroundRocks(rng, { color: "#1a120c" })}
  `);
};

/* --- Hira: night mountain ------------------------------------------- */
scenes["scene-hira"] = () => {
  const rng = mulberry32(3301);
  return frame(`${defs({
    sky: ["#01040d", "#071527"],
    horizon: "#16303c",
    ground: ["#161d22", "#060a0c"],
    glowColor: "#bcd6e6",
  })}
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${stars(rng, 160, 520)}
  <circle cx="320" cy="150" r="210" fill="url(#glow)" opacity="0.55"/>
  <circle cx="320" cy="150" r="32" fill="#e8eef2" opacity="0.9"/>
  <circle cx="310" cy="144" r="30" fill="#071527" opacity="0.55"/>
  ${range(rng, { baseY: 580, count: 6, minH: 120, maxH: 260, palette: P.farBlue, opacity: 0.8 })}
  <!-- main massif with cave -->
  <path d="M-40 900 L120 720 L300 590 L470 500 L620 550 L760 660 L860 780 L940 900 Z" fill="#101820"/>
  <path d="M300 590 L470 500 L620 550 L560 650 L420 670 Z" fill="#1b2833"/>
  <path d="M470 500 L520 570 L470 610 L430 560 Z" fill="#26333d"/>
  <path d="M120 720 L300 590 L420 670 L300 760 Z" fill="#0c141a"/>
  <path d="M620 550 L760 660 L860 780 L700 760 Z" fill="#0a1116"/>
  <path d="M470 500 L470 560 L440 540 Z" fill="#3a4a56" opacity="0.8"/>
  <!-- cave mouth -->
  <path d="M438 570 C438 536 470 518 494 536 C516 552 510 582 492 596 L456 596 C446 590 438 582 438 570 Z" fill="#040708"/>
  <path d="M438 570 C438 536 470 518 494 536" fill="none" stroke="#8fa6b2" stroke-width="2" opacity="0.45"/>
  <path d="M452 586 C464 576 480 576 490 586" stroke="#c9a361" stroke-width="1.4" fill="none" opacity="0.3"/>
  ${range(rng, { baseY: 800, count: 4, minH: 60, maxH: 130, palette: P.midBlue, opacity: 0.9 })}
  ${haze(640, 170, "#7c99aa", 0.2)}
  <g opacity="0.55">
    ${palm(1330, 870, 1.2, { trunk: "#0a0f12", leaf: "#0c1a15" })}
    ${palm(1400, 890, 1.5, { trunk: "#0a0f12", leaf: "#0c1a15" })}
  </g>
  ${foregroundRocks(rng, { color: "#04070a" })}
  `);
};

/* --- Dawah: rocky pass at dawn -------------------------------------- */
scenes["scene-dawah"] = () => {
  const rng = mulberry32(4401);
  return frame(`${defs({
    sky: ["#24303a", "#c98a58"],
    horizon: "#f5d9a8",
    ground: ["#8a6240", "#3a2718"],
    glowColor: "#ffcf8a",
  })}
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="1180" cy="500" r="260" fill="url(#glow)" opacity="0.85"/>
  <circle cx="1180" cy="500" r="38" fill="#ffe6b8"/>
  ${range(rng, { baseY: 560, count: 6, minH: 100, maxH: 220, palette: P.farWarm, opacity: 0.65 })}
  <!-- canyon walls -->
  <path d="M-40 900 L40 470 L200 420 L330 530 L380 900 Z" fill="#3e2c1f"/>
  <path d="M40 470 L200 420 L300 540 L180 590 Z" fill="#5a4230"/>
  <path d="M60 900 L120 560 L230 520 L300 620 L320 900 Z" fill="#2e2016"/>
  <path d="M1640 900 L1540 460 L1390 410 L1270 520 L1230 900 Z" fill="#35261b"/>
  <path d="M1540 460 L1390 410 L1300 530 L1430 580 Z" fill="#4d3827"/>
  <path d="M1560 900 L1500 570 L1400 530 L1330 640 L1310 900 Z" fill="#2a1d14"/>
  <path d="M380 900 C540 780 700 760 820 800 C980 850 1120 820 1230 900 Z" fill="url(#groundGrad)"/>
  <path d="M1180 500 L960 900 H1280 Z" fill="#ffd9a0" opacity="0.16" filter="url(#soft)"/>
  ${dune(830, 20, "#6d4a2f", 1, 1.6)}
  ${palm(240, 870, 1.3, { trunk: "#241a12", leaf: "#1d3320" })}
  ${palm(1420, 880, 1.5, { trunk: "#241a12", leaf: "#1d3320" })}
  ${bush(560, 860, 0.7, "#2a3a26", 0.7)}
  ${haze(640, 170, "#f0c48a", 0.32)}
  ${foregroundRocks(rng, { color: "#140e09" })}
  `);
};

/* --- Hijrah: vast route at sunset ----------------------------------- */
scenes["scene-hijrah"] = () => {
  const rng = mulberry32(5501);
  const route = [
    [180, 790], [340, 750], [520, 716], [700, 686], [880, 662], [1060, 640], [1240, 618], [1400, 596],
  ];
  const routePath = route.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  return frame(`${defs({
    sky: ["#26323f", "#b06a4a"],
    horizon: "#f7d9a6",
    ground: ["#a5713f", "#4a2f1b"],
    glowColor: "#ffbe7a",
  })}
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <ellipse cx="820" cy="520" rx="520" ry="130" fill="#ffbe7a" opacity="0.14" filter="url(#soft)"/>
  <circle cx="820" cy="500" r="290" fill="url(#glow)" opacity="0.9"/>
  <circle cx="820" cy="500" r="52" fill="#ffe3b0" opacity="0.95"/>
  ${range(rng, { baseY: 560, count: 7, minH: 130, maxH: 270, palette: P.farWarm, opacity: 0.6 })}
  ${range(rng, { baseY: 660, count: 6, minH: 90, maxH: 190, palette: P.midWarm, opacity: 0.85 })}
  ${dune(710, 28, "#b07a47", 1, 0.6)}
  ${dune(790, 24, "#8c5c35", 1, 2.4)}
  ${dune(860, 20, "#6b4326", 1, 4.1)}
  <path d="${routePath}" fill="none" stroke="#ffd48a" stroke-width="3" stroke-dasharray="2 15" stroke-linecap="round" opacity="0.95"/>
  <path d="${routePath}" fill="none" stroke="#ffd48a" stroke-width="12" stroke-linecap="round" opacity="0.12" filter="url(#soft8)"/>
  ${route.map(([x, y]) => `<g><circle cx="${x}" cy="${y}" r="6" fill="#ffe3b0"/><circle cx="${x}" cy="${y}" r="15" fill="none" stroke="#ffe3b0" stroke-width="1.4" opacity="0.5"/></g>`).join("")}
  <g opacity="0.9">
    ${camel(660, 730, 0.8, "#3a2718")}
    ${camel(700, 738, 0.72, "#3a2718")}
    ${camel(736, 746, 0.66, "#3a2718")}
  </g>
  ${tent(1080, 700, 0.7, { cloth: "#d8c19a", shade: "#9a805e", opacity: 0.9 })}
  ${tent(1140, 710, 0.55, { cloth: "#c9b08a", shade: "#8a7052", opacity: 0.85 })}
  ${palm(230, 840, 1.2, { trunk: "#2a1c12", leaf: "#263a24" })}
  ${palm(1400, 860, 1.5, { trunk: "#2a1c12", leaf: "#263a24" })}
  ${palm(1460, 880, 1.1, { trunk: "#2a1c12", leaf: "#1d3320" })}
  ${bush(520, 860, 0.8, "#2a3a26", 0.7)}
  ${haze(620, 170, "#f2c48c", 0.36)}
  ${foregroundRocks(rng, { color: "#1a0f08" })}
  `);
};

/* --- Madinah: palm oasis morning ------------------------------------ */
scenes["scene-madinah"] = () => {
  const rng = mulberry32(6601);
  return frame(`${defs({
    sky: ["#6f9cae", "#cfdfd8"],
    horizon: "#f6ecd2",
    ground: ["#9a7a4e", "#4a3822"],
    glowColor: "#fff0c4",
  })}
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="1240" cy="250" r="250" fill="url(#glow)" opacity="0.6"/>
  <circle cx="1240" cy="250" r="38" fill="#fff6d8" opacity="0.95"/>
  ${range(rng, { baseY: 560, count: 6, minH: 70, maxH: 160, palette: P.farCold, opacity: 0.45 })}
  ${dune(650, 16, "#b59a6c", 1, 0.8)}
  ${village(rng, 500, 720, 540, { wall: "#a8835a", roof: "#7d5f40", lit: "#ffd89a", scale: 1.35 })}
  <g>
    <path d="M980 720 V600 H1180 V720 Z" fill="#b08a5e"/>
    ${crenellations(980, 600, 200, { color: "#8a6a45", step: 24, height: 16 })}
    <path d="M1040 720 V650 C1040 622 1060 606 1080 606 C1100 606 1120 622 1120 650 V720 Z" fill="#4a3322"/>
    <rect x="1068" y="636" width="24" height="32" rx="12" fill="#ffd89a" opacity="0.75"/>
    <path d="M1180 720 V640 H1250 V720 Z" fill="#a8835a"/>
  </g>
  ${palm(300, 790, 1.8, { trunk: "#3a2818", leaf: "#2c4a2e" })}
  ${palm(380, 820, 1.4, { trunk: "#3a2818", leaf: "#26402a" })}
  ${palm(180, 830, 1.2, { trunk: "#3a2818", leaf: "#26402a" })}
  ${palm(1260, 810, 1.9, { trunk: "#3a2818", leaf: "#2c4a2e" })}
  ${palm(1340, 840, 1.5, { trunk: "#3a2818", leaf: "#26402a" })}
  ${palm(1440, 860, 1.2, { trunk: "#3a2818", leaf: "#26402a" })}
  ${palm(880, 750, 0.9, { trunk: "#3a2818", leaf: "#26402a" })}
  ${bush(700, 800, 0.9, "#2a3a26", 0.8)}
  <path d="M0 850 C300 830 600 870 900 850 C1150 834 1400 860 1600 840 V900 H0 Z" fill="#3f5a58"/>
  <path d="M0 850 C300 830 600 870 900 850 C1150 834 1400 860 1600 840" stroke="#cfe4dc" stroke-width="2" fill="none" opacity="0.5"/>
  <path d="M0 868 C320 852 640 884 960 866 C1220 852 1440 874 1600 860" stroke="#8fb3ab" stroke-width="1.4" fill="none" opacity="0.4"/>
  ${haze(640, 150, "#f2e6c8", 0.22)}
  ${foregroundRocks(rng, { color: "#3a2c1c" })}
  `);
};

/* --- Hajj: open plain at dawn --------------------------------------- */
scenes["scene-hajj"] = () => {
  const rng = mulberry32(7701);
  return frame(`${defs({
    sky: ["#32404c", "#d09a6a"],
    horizon: "#f8e4bc",
    ground: ["#b08a58", "#4a3822"],
    glowColor: "#ffd9a0",
  })}
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="980" cy="470" r="280" fill="url(#glow)" opacity="0.8"/>
  <circle cx="980" cy="470" r="42" fill="#ffe9c2"/>
  ${range(rng, { baseY: 560, count: 7, minH: 90, maxH: 200, palette: P.farWarm, opacity: 0.55 })}
  ${range(rng, { baseY: 650, count: 5, minH: 50, maxH: 120, palette: P.midWarm, opacity: 0.7 })}
  ${dune(720, 22, "#c09a62", 1, 0.5)}
  ${dune(800, 18, "#96703f", 1, 2.8)}
  ${tent(360, 730, 0.6, { cloth: "#e0cba6", shade: "#a88e68" })}
  ${tent(420, 740, 0.5, { cloth: "#d4bd98", shade: "#9a805e" })}
  ${tent(1180, 720, 0.55, { cloth: "#e0cba6", shade: "#a88e68" })}
  ${banner(1280, 730, 0.7)}
  ${palm(150, 830, 1.1, { trunk: "#3a2818", leaf: "#2c4a2e" })}
  ${palm(1460, 840, 1.3, { trunk: "#3a2818", leaf: "#2c4a2e" })}
  ${bush(760, 820, 0.7, "#3a4a2e", 0.7)}
  ${haze(640, 170, "#f2d3a0", 0.36)}
  ${foregroundRocks(rng, { color: "#241708" })}
  `);
};

/* --- Farewell: palm garden at night --------------------------------- */
scenes["scene-farewell"] = () => {
  const rng = mulberry32(8801);
  return frame(`${defs({
    sky: ["#02060c", "#0a1a22"],
    horizon: "#123029",
    ground: ["#20301f", "#080d08"],
    glowColor: "#ffca7a",
  })}
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${stars(rng, 130, 440)}
  <circle cx="1240" cy="170" r="200" fill="url(#glow)" opacity="0.5"/>
  <circle cx="1240" cy="170" r="34" fill="#eef2e4" opacity="0.9"/>
  <circle cx="1231" cy="164" r="32" fill="#0a1a22" opacity="0.5"/>
  ${range(rng, { baseY: 620, count: 5, minH: 70, maxH: 150, palette: P.nearBlue, opacity: 0.9 })}
  ${dune(720, 16, "#152318", 1, 1.2)}
  ${palm(220, 810, 1.7, { trunk: "#0c120c", leaf: "#14281a" })}
  ${palm(320, 840, 1.3, { trunk: "#0c120c", leaf: "#102214" })}
  ${palm(1320, 820, 1.8, { trunk: "#0c120c", leaf: "#14281a" })}
  ${palm(1420, 850, 1.4, { trunk: "#0c120c", leaf: "#102214" })}
  ${palm(1020, 790, 1, { trunk: "#0c120c", leaf: "#102214" })}
  ${lantern(520, 730, 0.7)}
  ${lantern(1080, 750, 0.6)}
  ${lantern(760, 770, 0.5)}
  <path d="M0 860 C400 840 900 880 1600 850 V900 H0 Z" fill="#0b140c"/>
  ${bush(640, 870, 0.7, "#14281a", 0.8)}
  ${haze(660, 150, "#6a8a72", 0.18)}
  ${foregroundRocks(rng, { color: "#050a06" })}
  `);
};

/* --- Badr: open valley with wells ----------------------------------- */
scenes["scene-badr"] = () => {
  const rng = mulberry32(9901);
  return frame(`${defs({
    sky: ["#343c46", "#c98a62"],
    horizon: "#f7e0b8",
    ground: ["#a87a48", "#4a3320"],
    glowColor: "#ffcf94",
  })}
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="1080" cy="490" r="250" fill="url(#glow)" opacity="0.8"/>
  <circle cx="1080" cy="490" r="40" fill="#ffe9c4"/>
  ${range(rng, { baseY: 580, count: 7, minH: 90, maxH: 190, palette: P.farWarm, opacity: 0.55 })}
  ${range(rng, { baseY: 660, count: 5, minH: 50, maxH: 120, palette: P.midWarm, opacity: 0.75 })}
  ${dune(730, 20, "#b88a54", 1, 0.6)}
  ${dune(810, 16, "#8a6038", 1, 3.1)}
  ${well(360, 750, 1.1)}
  ${well(440, 760, 0.9)}
  ${well(300, 770, 0.8)}
  <g fill="#2f3a24">
    <path d="M1240 750 C1220 730 1210 710 1224 698 C1238 686 1258 692 1266 706 C1278 698 1294 704 1298 718 C1302 734 1286 746 1268 746 Z"/>
    <path d="M1258 746 L1262 790 L1268 790 L1264 746 Z"/>
    <path d="M180 790 C160 772 154 754 168 742 C182 730 202 738 208 752 C220 744 236 750 238 764 C240 778 224 790 206 790 Z" opacity="0.8"/>
    <path d="M198 790 L202 826 L208 826 L204 790 Z" opacity="0.8"/>
  </g>
  ${tent(760, 720, 0.5, { cloth: "#c9b08a", shade: "#8a7052", opacity: 0.85 })}
  ${tent(810, 730, 0.4, { cloth: "#bda57e", shade: "#7d6549", opacity: 0.8 })}
  ${banner(900, 730, 0.6, { cloth: "#1f4d3a" })}
  ${haze(640, 170, "#f2d3a0", 0.34)}
  ${foregroundRocks(rng, { color: "#1e1208" })}
  `);
};

/* --- Uhud: mountain massif ------------------------------------------ */
scenes["scene-uhud"] = () => {
  const rng = mulberry32(10101);
  return frame(`${defs({
    sky: ["#333f4c", "#b78a66"],
    horizon: "#f0d9b4",
    ground: ["#8a6a48", "#3a2a1c"],
    glowColor: "#ffd9a0",
  })}
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="360" cy="470" r="250" fill="url(#glow)" opacity="0.6"/>
  ${range(rng, { baseY: 600, count: 5, minH: 100, maxH: 200, palette: P.farWarm, opacity: 0.5 })}
  <!-- Uhud massif -->
  <path d="M520 900 L700 540 L830 440 L980 520 L1080 480 L1260 580 L1440 900 Z" fill="#4a3a2c"/>
  <path d="M700 540 L830 440 L980 520 L910 600 L780 620 Z" fill="#6b5540"/>
  <path d="M980 520 L1080 480 L1260 580 L1170 650 L1040 620 Z" fill="#5a4634"/>
  <path d="M830 440 L870 520 L820 550 Z" fill="#8a7156"/>
  <path d="M830 440 L860 500 L840 520 Z" fill="#a88a68" opacity="0.7"/>
  <path d="M1080 480 L1110 540 L1060 560 Z" fill="#7a6248" opacity="0.8"/>
  ${range(rng, { baseY: 700, count: 4, minH: 60, maxH: 140, palette: P.midWarm, opacity: 0.85 })}
  ${dune(790, 16, "#6d4f36", 1, 2.2)}
  <g fill="#3a2c20">
    <ellipse cx="300" cy="830" rx="90" ry="34"/>
    <ellipse cx="420" cy="850" rx="60" ry="24"/>
    <ellipse cx="1320" cy="840" rx="80" ry="30"/>
  </g>
  ${banner(260, 790, 0.6, { cloth: "#1f4d3a" })}
  ${bush(520, 840, 0.7, "#3a4a2e", 0.7)}
  ${haze(660, 160, "#e8c9a0", 0.3)}
  ${foregroundRocks(rng, { color: "#160e08" })}
  `);
};

/* --- Khandaq: defensive trench, muted ------------------------------- */
scenes["scene-khandaq"] = () => {
  const rng = mulberry32(11101);
  return frame(`${defs({
    sky: ["#262e38", "#8a7a66"],
    horizon: "#d8c9ae",
    ground: ["#6d5a42", "#2a2018"],
    glowColor: "#d8c9ae",
  })}
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <ellipse cx="900" cy="420" rx="600" ry="180" fill="#d8c9ae" opacity="0.1" filter="url(#soft)"/>
  ${range(rng, { baseY: 580, count: 6, minH: 80, maxH: 170, palette: P.farDust, opacity: 0.5 })}
  ${dune(680, 16, "#8a7658", 1, 0.8)}
  ${tent(320, 690, 0.55, { cloth: "#c9b896", shade: "#8a7a5e" })}
  ${tent(390, 700, 0.45, { cloth: "#bdaa86", shade: "#7d6e52" })}
  ${tent(1120, 690, 0.5, { cloth: "#c9b896", shade: "#8a7a5e" })}
  ${banner(1220, 700, 0.7, { cloth: "#3a4a3a" })}
  ${banner(1260, 705, 0.6, { cloth: "#4a3a2a" })}
  <path d="M-40 790 C240 750 420 770 620 800 C820 830 1020 810 1240 780 C1400 760 1520 770 1640 790 L1640 900 L-40 900 Z" fill="#2a2018"/>
  <path d="M-40 790 C240 750 420 770 620 800 C820 830 1020 810 1240 780 C1400 760 1520 770 1640 790" stroke="#8a7658" stroke-width="6" fill="none" opacity="0.5"/>
  <path d="M-40 830 C260 800 460 820 660 846 C860 872 1060 852 1260 822 C1400 802 1520 810 1640 830" stroke="#3a2c20" stroke-width="10" fill="none" opacity="0.85"/>
  <g fill="#4a3a2a">
    <ellipse cx="180" cy="800" rx="70" ry="20"/>
    <ellipse cx="500" cy="820" rx="60" ry="18"/>
    <ellipse cx="900" cy="840" rx="80" ry="22"/>
    <ellipse cx="1300" cy="810" rx="70" ry="20"/>
  </g>
  ${haze(620, 160, "#c9b896", 0.28)}
  ${foregroundRocks(rng, { color: "#100b06" })}
  `);
};

/* --- Khaybar: fort on rocky hill ------------------------------------ */
scenes["scene-khaybar"] = () => {
  const rng = mulberry32(12101);
  return frame(`${defs({
    sky: ["#34343e", "#c98a5a"],
    horizon: "#f5ddb5",
    ground: ["#9a7040", "#3a2a1a"],
    glowColor: "#ffcf8a",
  })}
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="460" cy="480" r="240" fill="url(#glow)" opacity="0.7"/>
  ${range(rng, { baseY: 590, count: 6, minH: 90, maxH: 190, palette: P.farWarm, opacity: 0.55 })}
  <path d="M740 900 L910 580 L1080 510 L1230 600 L1360 900 Z" fill="#5a4430"/>
  <path d="M910 580 L1080 510 L1230 600 L1120 670 L970 650 Z" fill="#7a5c40"/>
  <path d="M910 580 L950 660 L880 690 Z" fill="#8f7050" opacity="0.8"/>
  ${fort(1080, 580, 0.9, { stone: "#8a6a48", dark: "#4a3626", light: "#b08a5e" })}
  ${palm(300, 830, 1.4, { trunk: "#2a1c12", leaf: "#2c4a2e" })}
  ${palm(380, 850, 1.1, { trunk: "#2a1c12", leaf: "#26402a" })}
  ${palm(1420, 840, 1.3, { trunk: "#2a1c12", leaf: "#2c4a2e" })}
  ${palm(1490, 860, 1, { trunk: "#2a1c12", leaf: "#26402a" })}
  ${dune(810, 18, "#7a5530", 1, 1.4)}
  ${bush(620, 850, 0.8, "#3a4a2e", 0.7)}
  ${haze(640, 170, "#f0cfa0", 0.34)}
  ${foregroundRocks(rng, { color: "#1a1008" })}
  `);
};

/* --- Fath: Makkah approach at dawn ---------------------------------- */
scenes["scene-fath"] = () => {
  const rng = mulberry32(13101);
  return frame(`${defs({
    sky: ["#26303a", "#d09a6a"],
    horizon: "#fbe3c1",
    ground: ["#a87a48", "#3a2a1a"],
    glowColor: "#ffd9a0",
  })}
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="800" cy="500" r="280" fill="url(#glow)" opacity="0.85"/>
  <circle cx="800" cy="500" r="42" fill="#ffe9c2"/>
  ${range(rng, { baseY: 570, count: 6, minH: 110, maxH: 230, palette: P.farWarm, opacity: 0.55 })}
  <g>
    <path d="M560 900 V680 H1040 V900 Z" fill="#5a4430"/>
    <path d="M560 900 V680 H1040 V900 Z" fill="url(#ashlar)" opacity="0.35"/>
    <path d="M680 900 V740 C680 660 760 620 800 620 C840 620 920 660 920 740 V900 Z" fill="#2a1e14"/>
    <path d="M660 900 V740 C660 640 750 600 800 600 C850 600 940 640 940 740 V900" fill="none" stroke="#c9a361" stroke-width="6" opacity="0.7"/>
    ${crenellations(560, 680, 480, { color: "#4a3827", step: 30, height: 18 })}
    <rect x="700" y="780" width="16" height="28" rx="8" fill="#ffd89a" opacity="0.6"/>
    <rect x="884" y="780" width="16" height="28" rx="8" fill="#ffd89a" opacity="0.6"/>
    <path d="M800 600 V640" stroke="#e2c07a" stroke-width="4" opacity="0.6"/>
  </g>
  ${banner(480, 810, 0.8, { cloth: "#1f4d3a" })}
  ${banner(1120, 820, 0.8, { cloth: "#1f4d3a" })}
  ${palm(260, 850, 1.4, { trunk: "#2a1c12", leaf: "#2c4a2e" })}
  ${palm(1340, 860, 1.5, { trunk: "#2a1c12", leaf: "#2c4a2e" })}
  ${haze(660, 160, "#f2d3a0", 0.32)}
  ${foregroundRocks(rng, { color: "#1a0f08" })}
  `);
};

/* --- Hunayn: deep valley -------------------------------------------- */
scenes["scene-hunayn"] = () => {
  const rng = mulberry32(14101);
  return frame(`${defs({
    sky: ["#33302e", "#b07a52"],
    horizon: "#e8c9a0",
    ground: ["#8a6038", "#3a2618"],
    glowColor: "#e8b070",
  })}
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="1080" cy="430" r="220" fill="url(#glow)" opacity="0.55"/>
  ${range(rng, { baseY: 540, count: 6, minH: 100, maxH: 210, palette: P.farDust, opacity: 0.5 })}
  <path d="M-40 900 L60 480 L260 380 L420 520 L480 900 Z" fill="#3a281c"/>
  <path d="M60 480 L260 380 L360 500 L240 560 Z" fill="#5a402c"/>
  <path d="M260 380 L300 470 L260 500 Z" fill="#7a5a40" opacity="0.8"/>
  <path d="M1640 900 L1520 500 L1340 420 L1200 540 L1140 900 Z" fill="#33241a"/>
  <path d="M1520 500 L1340 420 L1240 520 L1380 580 Z" fill="#4d3626"/>
  <path d="M1340 420 L1310 500 L1350 520 Z" fill="#6a4c34" opacity="0.8"/>
  <path d="M480 900 C620 820 760 800 880 820 C1020 844 1100 830 1140 900 Z" fill="#6d4a2f"/>
  ${dune(850, 14, "#7a5530", 1, 1.8)}
  ${haze(600, 220, "#d8b080", 0.44)}
  <path d="M1080 430 L900 900 H1240 Z" fill="#ffd9a0" opacity="0.12" filter="url(#soft)"/>
  ${palm(520, 880, 1.1, { trunk: "#241a12", leaf: "#1d3320" })}
  ${palm(1120, 890, 1.2, { trunk: "#241a12", leaf: "#1d3320" })}
  ${bush(700, 870, 0.7, "#2a3a26", 0.7)}
  ${foregroundRocks(rng, { color: "#120b06" })}
  `);
};

/* --- Tabuk: arid frontier ------------------------------------------- */
scenes["scene-tabuk"] = () => {
  const rng = mulberry32(15101);
  return frame(`${defs({
    sky: ["#465662", "#a8b0aa"],
    horizon: "#e8e0cc",
    ground: ["#a8946a", "#4a3c28"],
    glowColor: "#f0ead8",
  })}
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="1180" cy="360" r="210" fill="url(#glow)" opacity="0.5"/>
  ${range(rng, { baseY: 560, count: 7, minH: 70, maxH: 160, palette: P.farCold, opacity: 0.45 })}
  ${range(rng, { baseY: 640, count: 5, minH: 50, maxH: 110, palette: P.midCold, opacity: 0.6 })}
  ${dune(720, 20, "#b8a276", 1, 0.7)}
  ${dune(810, 16, "#8a7652", 1, 3.3)}
  ${fort(1180, 730, 0.7, { stone: "#8a7a5e", dark: "#4a4030", light: "#b8a67e" })}
  ${tent(420, 770, 0.5, { cloth: "#c9bda0", shade: "#8a7e64" })}
  ${banner(500, 780, 0.6, { cloth: "#3a4a3a" })}
  <g fill="#3a3428" opacity="0.8">
    <path d="M220 810 C200 790 196 770 210 760 C224 750 244 758 248 772 C260 764 276 770 278 784 C280 798 264 810 246 810 Z"/>
    <path d="M238 810 L242 850 L248 850 L244 810 Z"/>
  </g>
  ${bush(760, 840, 0.6, "#4a4a36", 0.6)}
  ${haze(640, 180, "#d8d0b8", 0.3)}
  ${foregroundRocks(rng, { color: "#2a2418" })}
  `);
};

/* ------------------------------------------------------------------ */
/* Write                                                               */
/* ------------------------------------------------------------------ */

mkdirSync(OUT, { recursive: true });
let total = 0;
for (const [name, build] of Object.entries(scenes)) {
  const svg = build();
  const file = resolve(OUT, `${name}.svg`);
  writeFileSync(file, svg, "utf8");
  total += 1;
  console.log(`${name}.svg  ${(svg.length / 1024).toFixed(1)} KB`);
}
console.log(`\nWrote ${total} illustrative scene plates to ${OUT}`);
