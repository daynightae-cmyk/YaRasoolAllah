/**
 * Build the home gateway plate: `scene-threshold.svg`.
 *
 * Art direction: a monumental ashlar threshold seen at a slight angle, its gate
 * thrown open on the left third, warm light spilling across dark stone toward
 * the right — where the RTL hero copy sits. Night sky, crescent, hanging
 * lanterns, carved rosettes. Terrain and architecture only: no people, no
 * sacred figures, no calligraphy, no embedded UI text.
 *
 * The canvas is 2400x1000 (2.4:1) so the hero frame crops almost nothing.
 * Deterministic output.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const W = 2400;
const H = 1000;
const OUT = resolve("client/public/visual-golden/art");

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(424242);

/** Wall top edge: rises slightly toward the left, so the wall reads in perspective. */
const topAt = (x) => 252 + (x / W) * 176;
/** Wall base edge: same recession. */
const baseAt = (x) => 1010 - (x / W) * 46;

/** The gate opening: one pointed arch, shared by every layer so they nest exactly. */
const GATE = (() => {
  const x0 = 120;
  const x1 = 700;
  const cx = 410;
  const spring = 646;
  const apex = 250;
  const rise = spring - apex;
  const half = (x1 - x0) / 2;
  return `M${x0} 1000 V${spring} C${x0} ${(spring - rise * 0.62).toFixed(1)} ${(cx - half * 0.3).toFixed(1)} ${(apex + rise * 0.22).toFixed(1)} ${cx} ${apex} C${(cx + half * 0.3).toFixed(1)} ${(apex + rise * 0.22).toFixed(1)} ${x1} ${(spring - rise * 0.62).toFixed(1)} ${x1} ${spring} V1000 Z`;
})();

function stars(count, maxY) {
  let out = "";
  for (let i = 0; i < count; i += 1) {
    const x = rng() * W;
    const y = rng() * maxY;
    const r = 0.5 + rng() * 1.5;
    const o = 0.18 + rng() * 0.68;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#f6eed6" opacity="${o.toFixed(2)}"/>`;
  }
  return out;
}

/** Masonry courses that follow the perspective slope. */
function courses() {
  const bands = 11;
  let out = "";
  for (let i = 0; i < bands; i += 1) {
    const t0 = i / bands;
    const t1 = (i + 1) / bands;
    const y0 = topAt(0) + (baseAt(0) - topAt(0)) * t0;
    const y1 = topAt(W) + (baseAt(W) - topAt(W)) * t0;
    const y2 = topAt(W) + (baseAt(W) - topAt(W)) * t1;
    const y3 = topAt(0) + (baseAt(0) - topAt(0)) * t1;
    const shade = i % 2 === 0 ? "#000000" : "#ffffff";
    const op = i % 2 === 0 ? 0.1 : 0.022;
    out += `<path d="M0 ${y0.toFixed(1)} L${W} ${y1.toFixed(1)} L${W} ${y2.toFixed(1)} L0 ${y3.toFixed(1)} Z" fill="${shade}" opacity="${op}"/>`;
    // horizontal joint
    out += `<path d="M0 ${y0.toFixed(1)} L${W} ${y1.toFixed(1)}" stroke="#0a0704" stroke-width="2" opacity="0.5"/>`;
    // vertical joints
    const count = 16 + Math.round(rng() * 5);
    for (let j = 0; j < count; j += 1) {
      const x = (j / count) * W + (rng() - 0.5) * 40;
      const ya = topAt(x) + (baseAt(x) - topAt(x)) * t0;
      const yb = topAt(x) + (baseAt(x) - topAt(x)) * t1;
      out += `<path d="M${x.toFixed(1)} ${ya.toFixed(1)} L${x.toFixed(1)} ${yb.toFixed(1)}" stroke="#0a0704" stroke-width="1.6" opacity="0.38"/>`;
    }
  }
  return out;
}

/** Crenellated parapet: merlons with a lit cap, standing above the wall line. */
function parapet() {
  let out = "";
  const step = 82;
  for (let x = -60; x < W + step; x += step) {
    const y = topAt(x);
    const y2 = topAt(x + step * 0.58);
    const h = 44;
    out += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} L${(x + step * 0.58).toFixed(1)} ${y2.toFixed(1)} L${(x + step * 0.58).toFixed(1)} ${(y2 - h).toFixed(1)} L${x.toFixed(1)} ${(y - h).toFixed(1)} Z" fill="#2a1e15"/>`;
    out += `<path d="M${x.toFixed(1)} ${(y - h).toFixed(1)} L${(x + step * 0.58).toFixed(1)} ${(y2 - h).toFixed(1)} L${(x + step * 0.58).toFixed(1)} ${(y2 - h + 8).toFixed(1)} L${x.toFixed(1)} ${(y - h + 8).toFixed(1)} Z" fill="#6b513a" opacity="0.85"/>`;
  }
  return out;
}

function lantern(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="8" r="120" fill="url(#lamp)"/>
    <path d="M0 -70 V-46" stroke="#1a1310" stroke-width="4"/>
    <path d="M-26 -70 H26" stroke="#241a12" stroke-width="7"/>
    <path d="M-9 -46 H9 L13 -30 L9 26 H-9 L-13 -30 Z" fill="#231a12"/>
    <path d="M-6 -42 H6 L9 -29 L6 20 H-6 L-9 -29 Z" fill="#ffd79a" opacity="0.95"/>
    <path d="M-9 -30 H9 M-9 -12 H9 M-9 6 H9 M-6 20 H6" stroke="#231a12" stroke-width="2.4"/>
    <path d="M0 26 V40" stroke="#231a12" stroke-width="3"/>
  </g>`;
}

/** Eight-point carved rosette: two rotated squares inside rings. */
function rosette(cx, cy, r, opacity) {
  return `<g opacity="${opacity}" fill="none" stroke="#c9a361">
    <rect x="${(cx - r).toFixed(1)}" y="${(cy - r).toFixed(1)}" width="${(2 * r).toFixed(1)}" height="${(2 * r).toFixed(1)}" stroke-width="2"/>
    <rect x="${(cx - r).toFixed(1)}" y="${(cy - r).toFixed(1)}" width="${(2 * r).toFixed(1)}" height="${(2 * r).toFixed(1)}" stroke-width="2" transform="rotate(45 ${cx} ${cy})"/>
    <circle cx="${cx}" cy="${cy}" r="${(r * 0.52).toFixed(1)}" stroke-width="1.6"/>
    <circle cx="${cx}" cy="${cy}" r="${(r * 0.2).toFixed(1)}" stroke-width="1.4"/>
    <circle cx="${cx}" cy="${cy}" r="${(r * 1.12).toFixed(1)}" stroke-width="2.2"/>
  </g>`;
}

/** A lit arcade seen through the open gate: nested arches receding into light. */
function arcade() {
  const arch = (inset, base = 1000) => {
    const x0 = 120 + inset;
    const x1 = 700 - inset;
    const half = (x1 - x0) / 2;
    const cx = 410;
    const spring = 646 - inset * 0.3;
    const apex = 250 + inset * 0.62;
    const rise = spring - apex;
    return `M${x0} ${base} V${spring} C${x0} ${(spring - rise * 0.6).toFixed(1)} ${(cx - half * 0.44).toFixed(1)} ${(apex + rise * 0.3).toFixed(1)} ${cx} ${apex} C${(cx + half * 0.44).toFixed(1)} ${(apex + rise * 0.3).toFixed(1)} ${x1} ${(spring - rise * 0.6).toFixed(1)} ${x1} ${spring} V${base} Z`;
  };
  const layers = [
    { inset: 0, fill: "#241610" },
    { inset: 44, fill: "#3d2717" },
    { inset: 92, fill: "#5f3a1e" },
    { inset: 144, fill: "#8a5428" },
    { inset: 200, fill: "#b06f34" },
  ];
  let out = "";
  for (const layer of layers) {
    out += `<path d="${arch(layer.inset)}" fill="${layer.fill}"/>`;
  }
  // far wall inside the innermost bay, lit from below
  out += `<path d="${arch(200)}" fill="url(#gateDepth)"/>`;
  // lit doorway at the end of the corridor
  out += `<path d="M368 1000 V812 C368 770 384 742 410 742 C436 742 452 770 452 812 V1000 Z" fill="#ffe9b8" opacity="0.9"/>`;
  out += `<path d="M368 1000 V812 C368 770 384 742 410 742 C436 742 452 770 452 812 V1000 Z" fill="none" stroke="#8a5428" stroke-width="5" opacity="0.5"/>`;
  // two lamps hanging in the arcade
  out += `<g><path d="M330 470 V520" stroke="#3a2413" stroke-width="3"/><path d="M320 520 h20 l4 26 h-28 Z" fill="#ffd79a"/><circle cx="330" cy="534" r="46" fill="url(#lamp)" opacity="0.7"/></g>`;
  out += `<g><path d="M492 500 V544" stroke="#3a2413" stroke-width="3"/><path d="M483 544 h18 l3 22 h-24 Z" fill="#ffd79a"/><circle cx="492" cy="556" r="38" fill="url(#lamp)" opacity="0.6"/></g>`;
  return out;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#01040b"/>
      <stop offset="0.42" stop-color="#061420"/>
      <stop offset="0.72" stop-color="#0d2630"/>
      <stop offset="1" stop-color="#1b3a3c"/>
    </linearGradient>
    <radialGradient id="moonHalo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#dfe9ea" stop-opacity="0.55"/>
      <stop offset="0.35" stop-color="#9fb8c0" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#9fb8c0" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="lamp" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffe9b8" stop-opacity="0.9"/>
      <stop offset="0.22" stop-color="#f2b968" stop-opacity="0.4"/>
      <stop offset="0.6" stop-color="#c9853c" stop-opacity="0.11"/>
      <stop offset="1" stop-color="#c9853c" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="gateGlow" cx="0.5" cy="0.62" r="0.5">
      <stop offset="0" stop-color="#ffe4ae" stop-opacity="0.95"/>
      <stop offset="0.3" stop-color="#ffc878" stop-opacity="0.6"/>
      <stop offset="0.68" stop-color="#d98f42" stop-opacity="0.2"/>
      <stop offset="1" stop-color="#a8641f" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gateDepth" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1a1108"/>
      <stop offset="0.28" stop-color="#5a3a1c"/>
      <stop offset="0.62" stop-color="#c98a44"/>
      <stop offset="1" stop-color="#ffdf9e"/>
    </linearGradient>
    <linearGradient id="spill" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffd28c" stop-opacity="0.5"/>
      <stop offset="0.34" stop-color="#ffc474" stop-opacity="0.22"/>
      <stop offset="0.72" stop-color="#e09a4c" stop-opacity="0.07"/>
      <stop offset="1" stop-color="#e09a4c" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#241a13"/>
      <stop offset="0.5" stop-color="#150f0a"/>
      <stop offset="1" stop-color="#080604"/>
    </linearGradient>
    <linearGradient id="wallStone" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#4a3626"/>
      <stop offset="0.14" stop-color="#3a2a1c"/>
      <stop offset="0.34" stop-color="#2a1e15"/>
      <stop offset="0.6" stop-color="#1c1410"/>
      <stop offset="1" stop-color="#100a07"/>
    </linearGradient>
    <linearGradient id="rightFade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0"/>
      <stop offset="0.26" stop-color="#000" stop-opacity="0.12"/>
      <stop offset="0.52" stop-color="#000" stop-opacity="0.46"/>
      <stop offset="0.76" stop-color="#000" stop-opacity="0.72"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.86"/>
    </linearGradient>
    <linearGradient id="wallVert" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0.3"/>
      <stop offset="0.4" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.55"/>
    </linearGradient>
    <linearGradient id="jambLeft" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0a0604" stop-opacity="0.92"/>
      <stop offset="0.55" stop-color="#1a110a" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#1a110a" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="jambRight" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#0a0604" stop-opacity="0.92"/>
      <stop offset="0.55" stop-color="#1a110a" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#1a110a" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="floorGlow" cx="0.5" cy="0.35" r="0.6">
      <stop offset="0" stop-color="#ffe9b8" stop-opacity="0.85"/>
      <stop offset="0.4" stop-color="#e8a855" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#7a4a22" stop-opacity="0.2"/>
    </radialGradient>
    <clipPath id="gateClip"><path d="${GATE}"/></clipPath>
    <radialGradient id="rakeLight" cx="0.2" cy="0.66" r="0.62">
      <stop offset="0" stop-color="#ffc478" stop-opacity="0.5"/>
      <stop offset="0.34" stop-color="#e8a855" stop-opacity="0.2"/>
      <stop offset="0.7" stop-color="#b07030" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#b07030" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="hazeFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8aa4a8" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#8aa4a8" stop-opacity="0.4"/>
      <stop offset="1" stop-color="#8aa4a8" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="vignette" cx="0.42" cy="0.46" r="0.82">
      <stop offset="0.38" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.66"/>
    </radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="30"/></filter>
    <filter id="soft12"><feGaussianBlur stdDeviation="12"/></filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.06"/></feComponentTransfer>
    </filter>
  </defs>

  <!-- sky -->
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${stars(210, 470)}
  <circle cx="1980" cy="172" r="150" fill="url(#moonHalo)"/>
  <circle cx="1980" cy="172" r="46" fill="#eef3ee" opacity="0.94"/>
  <circle cx="1962" cy="160" r="43" fill="#061420" opacity="0.62"/>

  <!-- distant ridge behind the wall -->
  <path d="M0 520 L190 448 L360 500 L520 442 L700 512 L900 462 L1100 520 L1320 470 L1560 524 L1800 476 L2040 528 L2240 486 L2400 520 L2400 620 L0 620 Z" fill="#0a1a20" opacity="0.9"/>
  <path d="M0 560 L240 512 L470 556 L720 508 L980 562 L1240 516 L1500 566 L1780 522 L2060 570 L2320 530 L2400 552 L2400 640 L0 640 Z" fill="#071319" opacity="0.9"/>

  <!-- ============ THE WALL ============ -->
  <path d="M0 ${topAt(0)} L${W} ${topAt(W)} L${W} ${baseAt(W)} L0 ${baseAt(0)} Z" fill="url(#wallStone)"/>
  <path d="M0 ${topAt(0)} L${W} ${topAt(W)} L${W} ${baseAt(W)} L0 ${baseAt(0)} Z" fill="url(#wallVert)"/>
  ${courses()}
  <rect width="${W}" height="${H}" fill="url(#rakeLight)" opacity="0.55"/>
  <rect width="${W}" height="${H}" fill="url(#rightFade)"/>
  <path d="M0 ${topAt(0)} L${W} ${topAt(W)} L${W} ${topAt(W) + 24} L0 ${topAt(0) + 24} Z" fill="#3a2b1f"/>
  <path d="M0 ${topAt(0) + 24} L${W} ${topAt(W) + 24}" stroke="#e2c07a" stroke-width="2" opacity="0.35"/>
  ${parapet()}

  <!-- pilasters receding to the right -->
  <g fill="#120c08" opacity="0.7">
    <path d="M812 ${topAt(812) + 26} L866 ${topAt(866) + 26} L866 ${baseAt(866)} L812 ${baseAt(812)} Z"/>
    <path d="M1400 ${topAt(1400) + 26} L1440 ${topAt(1440) + 26} L1440 ${baseAt(1440)} L1400 ${baseAt(1400)} Z"/>
    <path d="M1960 ${topAt(1960) + 26} L1992 ${topAt(1992) + 26} L1992 ${baseAt(1992)} L1960 ${baseAt(1960)} Z"/>
  </g>

  ${rosette(1120, 640, 90, 0.2)}
  ${rosette(1740, 720, 52, 0.1)}

  <!-- ============ THE GATE ============ -->
  <!-- the lit arcade receding inside the opening -->
  <g>${arcade()}</g>
  <g clip-path="url(#gateClip)">
    <rect x="120" y="250" width="104" height="760" fill="url(#jambLeft)"/>
    <rect x="596" y="250" width="104" height="760" fill="url(#jambRight)"/>
    <rect x="120" y="884" width="580" height="116" fill="url(#floorGlow)" opacity="0.7"/>
    <path d="M232 884 H588 L620 930 H200 Z" fill="#c07c38" opacity="0.35"/>
    <path d="M256 930 H564 L590 968 H230 Z" fill="#a8641f" opacity="0.4"/>
  </g>
  <rect x="120" y="820" width="580" height="180" fill="#ffdf9e" opacity="0.2" filter="url(#soft12)"/>

  <!-- stone moldings around the arch -->
  <path d="${GATE}" fill="none" stroke="#3a2b1f" stroke-width="30" opacity="0.95" transform="translate(-30 0)"/>
  <path d="${GATE}" fill="none" stroke="#c9a361" stroke-width="4" opacity="0.55" transform="translate(-30 0)"/>
  <path d="${GATE}" fill="none" stroke="#e2c07a" stroke-width="3" opacity="0.6"/>
  <path d="M410 250 V214" stroke="#c9a361" stroke-width="8" opacity="0.55"/>
  <path d="M410 196 L420 210 L410 224 L400 210 Z" fill="#e2c07a" opacity="0.7"/>

  <!-- door leaves, swung inward and foreshortened -->
  <g>
    <path d="M120 1000 L120 652 L186 602 L186 934 Z" fill="#3a2413"/>
    <path d="M186 602 L186 934" stroke="#5a3a1c" stroke-width="3"/>
    <path d="M120 704 L186 660 M120 784 L186 744 M120 864 L186 828 M120 944 L186 912" stroke="#1b110a" stroke-width="7" opacity="0.8"/>
    ${Array.from({ length: 5 }, (_, i) => `<circle cx="${140 + i * 8}" cy="${704 + i * 4}" r="3" fill="#1b110a"/>`).join("")}
    <path d="M700 1000 L700 652 L634 602 L634 934 Z" fill="#35200f"/>
    <path d="M634 602 L634 934" stroke="#5a3a1c" stroke-width="3"/>
    <path d="M700 704 L634 660 M700 784 L634 744 M700 864 L634 828 M700 944 L634 912" stroke="#1b110a" stroke-width="7" opacity="0.8"/>
    ${Array.from({ length: 5 }, (_, i) => `<circle cx="${678 - i * 8}" cy="${704 + i * 4}" r="3" fill="#1b110a"/>`).join("")}
  </g>

  <!-- light spilling from the gate across the ground to the right -->
  <path d="M120 1000 L700 1000 L1360 1000 L980 812 L470 812 Z" fill="url(#spill)" opacity="0.85" filter="url(#soft12)"/>
  <ellipse cx="440" cy="880" rx="430" ry="112" fill="#ffca7a" opacity="0.16" filter="url(#soft)"/>

  <!-- lanterns on the wall -->
  ${lantern(940, 512, 1)}
  ${lantern(1560, 588, 0.82)}
  <path d="M880 452 H1000 M1504 540 H1616" stroke="#1a1310" stroke-width="6"/>

  <!-- ============ FOREGROUND ============ -->
  <path d="M0 936 C300 918 620 946 940 934 C1260 922 1560 950 1880 936 C2120 926 2280 940 2400 932 L2400 1000 L0 1000 Z" fill="url(#ground)"/>
  <path d="M0 936 C300 918 620 946 940 934 C1260 922 1560 950 1880 936 C2120 926 2280 940 2400 932" stroke="#8a6a3d" stroke-width="1.6" fill="none" opacity="0.25"/>
  <g fill="#0a0705">
    <path d="M-40 1000 L-40 902 L64 874 L150 916 L196 1000 Z"/>
    <path d="M-40 902 L64 874 L150 916 L70 944 Z" fill="#120c08"/>
    <path d="M2440 1000 L2440 892 L2340 866 L2262 912 L2224 1000 Z"/>
    <path d="M2440 892 L2340 866 L2262 912 L2340 942 Z" fill="#120c08"/>
  </g>
  <g fill="#0c0805" opacity="0.8">
    <ellipse cx="330" cy="972" rx="46" ry="12"/>
    <ellipse cx="1830" cy="982" rx="58" ry="14"/>
    <ellipse cx="2110" cy="966" rx="34" ry="9"/>
  </g>

  <rect y="600" width="${W}" height="300" fill="url(#hazeFade)" opacity="0.35"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.5"/>
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
</svg>
`;

mkdirSync(OUT, { recursive: true });
writeFileSync(resolve(OUT, "scene-threshold.svg"), svg, "utf8");
console.log(`scene-threshold.svg  ${(svg.length / 1024).toFixed(1)} KB`);
