export interface Particle {
  xPct: number;
  yPct: number;
  xSphere: number;
  ySphere: number;
  zSphere: number;
  xLandNorm: number;
  zLandNorm: number;
  color: string;
  starSize: number;
  starOpacity: number;
  floatSpeedX: number;
  floatSpeedY: number;
  floatPhaseX: number;
  floatPhaseY: number;
  floatAmp: number;
  xCur?: number;
  yCur?: number;
}

export const easeInOutQuad = (x: number) => {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};

export function initParticles(N: number): Particle[] {
  const particles: Particle[] = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const goldenAngle = 2 * Math.PI * (1 - 1 / goldenRatio);
  const cols = Math.floor(Math.sqrt(N)); // ~86
  const maxRow = Math.ceil(N / cols) - 1;

  for (let i = 0; i < N; i++) {
    const ySphere = 1 - (i / (N - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - ySphere * ySphere);
    const theta = i * goldenAngle;
    
    const xSphere = Math.cos(theta) * radiusAtY;
    const zSphere = Math.sin(theta) * radiusAtY;

    const col = i % cols;
    const row = Math.floor(i / cols);
    const xLandNorm = (col / (cols - 1)) * 2 - 1;
    const zLandNorm = (row / maxRow) * 2 - 1;
    
    const rand = Math.random();
    let color = "215, 235, 255"; // bright white-blue
    if (rand < 0.45) {
      color = "65, 105, 255"; // vibrant royal neon blue
    } else if (rand < 0.8) {
      color = "115, 185, 255"; // neon cyan/ice blue
    } else {
      color = "20, 60, 220"; // deep indigo blue
    }

    particles.push({
      xPct: Math.random(),
      yPct: Math.random(),
      xSphere,
      ySphere,
      zSphere,
      xLandNorm,
      zLandNorm,
      color,
      starSize: 0.35 + Math.random() * 0.55,
      starOpacity: 0.7 + Math.random() * 0.3,
      floatSpeedX: 0.15 + Math.random() * 0.4,
      floatSpeedY: 0.15 + Math.random() * 0.4,
      floatPhaseX: Math.random() * Math.PI * 2,
      floatPhaseY: Math.random() * Math.PI * 2,
      floatAmp: 4 + Math.random() * 12,
    });
  }
  return particles;
}

// Pre-compute landscape rotation constants
export const cosRY = Math.cos(-0.22);
export const sinRY = Math.sin(-0.22);
export const cosRXLand = Math.cos(0.62);
export const sinRXLand = Math.sin(0.62);

export type ProjectedParticle = { x: number; y: number; z: number; size: number; color: string; opacity: number; idx: number };

export function updateProjectedParticles(
  particles: Particle[],
  projected: ProjectedParticle[],
  N: number,
  width: number,
  height: number,
  p: number, // scroll progress
  floatTime: number,
  rotationY: number,
  rotationX: number,
  springFactor: number,
  mouseActive: boolean,
  mouseX: number,
  mouseY: number
) {
  const R = Math.min(width, height) * (width < 768 ? 0.28 : 0.22);
  const cx = width / 2;
  const cy = height / 2;
  const cosY = Math.cos(rotationY);
  const sinY = Math.sin(rotationY);
  const cosX = Math.cos(rotationX);
  const sinX = Math.sin(rotationX);
  const D = 400; // perspective depth constant

  for (let i = 0; i < N; i++) {
    const part = particles[i];
    const proj = projected[i];

    // --- 1. Starfield Target coordinates ---
    const floatX = Math.sin(floatTime * part.floatSpeedX + part.floatPhaseX) * part.floatAmp;
    const floatY = Math.cos(floatTime * part.floatSpeedY + part.floatPhaseY) * part.floatAmp;
    const sxStar = part.xPct * width + floatX;
    const syStar = part.yPct * height + floatY;
    const sizeStar = part.starSize;
    const opacityStar = part.starOpacity;

    // --- 2. Sphere Target coordinates ---
    const xSphereRot = part.xSphere * cosY - part.zSphere * sinY;
    const zSphereRot1 = part.xSphere * sinY + part.zSphere * cosY;
    const ySphereRot = part.ySphere * cosX - zSphereRot1 * sinX;
    const zSphereRot = part.ySphere * sinX + zSphereRot1 * cosX;

    const zSpherePx = zSphereRot * R;
    const distToFocal = D + zSpherePx;
    const scaleSphere = D / Math.max(50, distToFocal);
    
    let sizeSphere = part.starSize * 1.15 * scaleSphere;
    let opacitySphere = 0.8 * (0.6 - 0.42 * zSphereRot);

    if (distToFocal < 150) {
      const fadeFactor = Math.max(0, (distToFocal - 50) / 100);
      const easedFade = easeInOutQuad(fadeFactor);
      sizeSphere *= easedFade;
      opacitySphere *= easedFade;
    }

    const sxSphere = cx + xSphereRot * R * scaleSphere;
    const sySphere = cy + ySphereRot * R * scaleSphere;
    const szSphere = zSpherePx;

    // --- 3. Landscape Target coordinates ---
    const waveTime = floatTime * 1.5;
    const wave1 = Math.sin(part.xLandNorm * 4.0 + waveTime) * Math.cos(part.zLandNorm * 3.0 + waveTime * 0.7) * 0.35;
    const wave2 = Math.sin(part.xLandNorm * 10.0 - waveTime * 1.1) * Math.sin(part.zLandNorm * 8.0 + waveTime) * 0.12;
    const wave3 = Math.cos(part.xLandNorm * 18.0 + waveTime * 1.8) * 0.04;
    const lyNorm = wave1 + wave2 + wave3;

    const lx = (part.xLandNorm - 0.08) * (width * 0.78);
    const lz = part.zLandNorm * 230;
    const ly = lyNorm * 165;

    const lxRot = lx * cosRY - lz * sinRY;
    const lzRot = lx * sinRY + lz * cosRY;
    const ly2 = ly * cosRXLand - lzRot * sinRXLand;
    const lz2 = ly * sinRXLand + lzRot * cosRXLand;

    const zLandPx = lz2;
    const D_land = 340;
    const zCam = D_land + zLandPx;
    const scaleLand = D_land / Math.max(50, zCam);
    
    const sxLand = cx + lxRot * scaleLand;
    const syLand = (height * 0.70) + ly2 * scaleLand;
    const szLand = zLandPx;
    
    let sizeLand = part.starSize * 1.6 * scaleLand;
    let opacityLand = 0.85 * (1.0 - Math.max(0, zCam - 120) / 480 * 0.72);

    if (zCam < 160) {
      const nearFactor = (160 - zCam) / 110;
      sizeLand *= (1.0 + nearFactor * 1.5);
      opacityLand *= (1.0 - nearFactor * 0.35);
    }

    if (zCam < 150) {
      const fadeFactor = Math.max(0, (zCam - 50) / 100);
      const easedFade = easeInOutQuad(fadeFactor);
      sizeLand *= easedFade;
      opacityLand *= easedFade;
    }

    // Interpolate target depending on scroll phase
    let tx: number, ty: number, tz: number, tSize: number, tOpacity: number;

    if (p < 0.45) {
      const t1 = easeInOutQuad(p / 0.45);
      const inv = 1 - t1;
      tx = inv * sxStar + t1 * sxSphere;
      ty = inv * syStar + t1 * sySphere;
      tz = t1 * szSphere;
      tSize = inv * sizeStar + t1 * sizeSphere;
      tOpacity = inv * opacityStar + t1 * opacitySphere;
    } else if (p < 0.65) {
      tx = sxSphere;
      ty = sySphere;
      tz = szSphere;
      tSize = sizeSphere;
      tOpacity = opacitySphere;
    } else {
      const t2 = easeInOutQuad((p - 0.65) / 0.35);
      const inv = 1 - t2;
      tx = inv * sxSphere + t2 * sxLand;
      ty = inv * sySphere + t2 * syLand;
      tz = inv * szSphere + t2 * szLand;
      tSize = inv * sizeSphere + t2 * sizeLand;
      tOpacity = inv * opacitySphere + t2 * opacityLand;
    }

    // Initialize current position if needed
    if (part.xCur === undefined || part.yCur === undefined) {
      part.xCur = tx;
      part.yCur = ty;
    }

    // Mouse repel
    let pushX = 0;
    let pushY = 0;
    if (mouseActive) {
      const dx = tx - mouseX;
      const dy = ty - mouseY;
      const distSq = dx * dx + dy * dy;
      const repelRadius = 110;
      if (distSq < repelRadius * repelRadius && distSq > 0.01) {
        const dist = Math.sqrt(distSq);
        const force = (repelRadius - dist) / repelRadius;
        const angle = Math.atan2(dy, dx);
        pushX = Math.cos(angle) * force * 60;
        pushY = Math.sin(angle) * force * 60;
      }
    }

    // Spring physics
    const targetX = tx + pushX;
    const targetY = ty + pushY;
    part.xCur += (targetX - part.xCur) * springFactor;
    part.yCur += (targetY - part.yCur) * springFactor;

    proj.x = part.xCur;
    proj.y = part.yCur;
    proj.z = tz;
    proj.size = tSize;
    proj.color = part.color;
    proj.opacity = tOpacity;
  }
}
