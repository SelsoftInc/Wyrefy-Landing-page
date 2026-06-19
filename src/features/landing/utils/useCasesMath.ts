/* ─────────────────────────────────────────────────────────────────────────────
   SVG coordinate system  →  viewBox "0 0 1000 680"
   Card half-dims: CW=120 (width), CH=50 (height, inactive)
   EXP = extra height in VB units added when active

   Layout (matches reference):
     01  cx=170  cy=245   ← vertically centered between 02 and 03
     02  cx=530  cy= 90   ← top right
     03  cx=530  cy=400   ← mid right (310 units below 02)
     04  cx=350  cy=720   ← bottom middle (320 units below 03)
───────────────────────────────────────────────────────────────────────────── */

export const VB_W = 750;
export const VB_H = 800;   // Increased significantly to give all cards vertical breathing room
export const CW   = 150;
export const CH   = 75;
export const EXP  = 130;

// Card centres — spaced to ensure no overlap when fully expanded
export const C = [
  { cx: 170, cy: 245 },   // 01 – vertically centered between 02 and 03
  { cx: 530, cy:  90 },   // 02 – top right
  { cx: 530, cy: 400 },   // 03 – mid right     (310 units below 02)
  { cx: 350, cy: 720 },   // 04 – bottom middle (320 units below 03)
];

// Which path is lit for which activeStep
export const PATH_ACTIVE_MAP = [
  (a: number) => a === 0 || a === 1, // p0  01→02
  (a: number) => a === 0 || a === 2, // p1  01→03
  (a: number) => a === 1 || a === 2, // p2  02→03 loop
  (a: number) => a === 2 || a === 3, // p3  03→04
];

// Gradient colour pairs per path
export const PATH_GRAD = [
  ["#00C3FF", "#A200FF"],   // p0 cyan→purple
  ["#00C3FF", "#FF007F"],   // p1 cyan→pink
  ["#A200FF", "#FF007F"],   // p2 purple loop to pink
  ["#FF007F", "#00E676"],   // p3 pink→green
];

export function buildPaths(active: number) {
  // bottom y of card 03 – moves down when it's active
  const c3bot = C[2].cy + CH + (active === 2 ? EXP : 0);

  // Connection coordinates (y shifts down by EXP/2 when active to stay vertically centered)
  const o1r  = { x: C[0].cx + CW, y: C[0].cy + (active === 0 ? EXP / 2 : 0) };   // 01 right
  const o2l  = { x: C[1].cx - CW, y: C[1].cy + (active === 1 ? EXP / 2 : 0) };   // 02 left
  const o2r  = { x: C[1].cx + CW, y: C[1].cy + (active === 1 ? EXP / 2 : 0) };   // 02 right
  const o3l  = { x: C[2].cx - CW, y: C[2].cy + (active === 2 ? EXP / 2 : 0) };   // 03 left
  const o3r  = { x: C[2].cx + CW, y: C[2].cy + (active === 2 ? EXP / 2 : 0) };   // 03 right
  const o3b  = { x: C[2].cx,      y: c3bot    };   // 03 bottom (dynamic)
  const o4t  = { x: C[3].cx,      y: C[3].cy - CH };// 04 top (top edge never shifts)

  const p0 = `M ${o1r.x} ${o1r.y} C ${o1r.x+60} ${o1r.y}, ${o2l.x-60} ${o2l.y}, ${o2l.x} ${o2l.y}`;
  const p1 = `M ${o1r.x} ${o1r.y} C ${o1r.x+60} ${o1r.y}, ${o3l.x-60} ${o3l.y}, ${o3l.x} ${o3l.y}`;
  const p2 = `M ${o2r.x} ${o2r.y} C ${o2r.x+60} ${o2r.y}, ${o3r.x+60} ${o3r.y}, ${o3r.x} ${o3r.y}`;
  const dy3 = Math.min(80, Math.max(20, (o4t.y - o3b.y) / 2));
  const p3 = `M ${o3b.x} ${o3b.y} C ${o3b.x} ${o3b.y+dy3}, ${o4t.x} ${o4t.y-dy3}, ${o4t.x} ${o4t.y}`;

  // All anchor dots (start + end of each path)
  const anchors = [
    o1r, o2l,   // p0
    o1r, o3l,   // p1  (o1r duplicates – both draw at same spot, looks like one dot)
    o2r, o3r,   // p2
    o3b, o4t,   // p3
  ];

  return { paths: [p0, p1, p2, p3], anchors };
}
