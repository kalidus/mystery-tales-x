import * as Phaser from 'phaser';

/**
 * Recorta una textura al bounding box de pixeles con alpha >= threshold y la
 * guarda con un nuevo key. Esto permite que cada pose de un personaje (idle,
 * walk, talk, grab) tenga el mismo "anchor" (pies al bottom, centro en x),
 * independientemente del padding transparente de la imagen fuente.
 */
export function cropTextureToBBox(
  scene: Phaser.Scene,
  srcKey: string,
  dstKey: string,
  alphaThreshold = 30,
  padding = 2
): { width: number; height: number } {
  const srcTex = scene.textures.get(srcKey);
  if (!srcTex || srcTex.key === '__MISSING') {
    return { width: 0, height: 0 };
  }

  const srcImg = srcTex.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  const w = srcImg.width;
  const h = srcImg.height;

  const tmp = document.createElement('canvas');
  tmp.width = w;
  tmp.height = h;
  const ctx = tmp.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { width: w, height: h };
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(srcImg as CanvasImageSource, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;

  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a > alphaThreshold) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  if (!found) {
    if (!scene.textures.exists(dstKey)) {
      scene.textures.addCanvas(dstKey, tmp);
    }
    return { width: w, height: h };
  }

  const cx = Math.max(0, minX - padding);
  const cy = Math.max(0, minY - padding);
  const cw = Math.min(w - cx, maxX - minX + 1 + padding * 2);
  const ch = Math.min(h - cy, maxY - minY + 1 + padding * 2);

  const out = document.createElement('canvas');
  out.width = cw;
  out.height = ch;
  const octx = out.getContext('2d');
  if (!octx) return { width: cw, height: ch };
  octx.drawImage(srcImg as CanvasImageSource, cx, cy, cw, ch, 0, 0, cw, ch);

  if (scene.textures.exists(dstKey)) {
    scene.textures.remove(dstKey);
  }
  scene.textures.addCanvas(dstKey, out);
  return { width: cw, height: ch };
}

/**
 * Limpia el fondo "checkerboard" gris (típico de las imagenes IA que pretenden
 * ser transparentes pero se guardaron en 24bpp sin alpha) y recorta al bbox.
 *
 * Algoritmo: flood fill BFS desde los 4 bordes marcando como transparentes
 * todos los pixeles "grises neutros" (|R-G| <= grayTolerance, |G-B| <=
 * grayTolerance) con brillo dentro del rango del checkerboard tipico
 * (~70..215). Los grises TINTADOS del personaje (gabardina, fedora,
 * etc.) no son detectados como grises neutros y se conservan intactos.
 */
export function chromaKeyAndCrop(
  scene: Phaser.Scene,
  srcKey: string,
  dstKey: string,
  options: {
    grayTolerance?: number;
    brightnessMin?: number;
    brightnessMax?: number;
    padding?: number;
  } = {}
): { width: number; height: number } {
  const {
    grayTolerance = 10,
    brightnessMin = 85,
    brightnessMax = 220,
    padding = 2
  } = options;

  const srcTex = scene.textures.get(srcKey);
  if (!srcTex || srcTex.key === '__MISSING') {
    return { width: 0, height: 0 };
  }
  const srcImg = srcTex.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  const w = srcImg.width;
  const h = srcImg.height;

  const tmp = document.createElement('canvas');
  tmp.width = w;
  tmp.height = h;
  const ctx = tmp.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { width: w, height: h };
  ctx.drawImage(srcImg as CanvasImageSource, 0, 0);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const readRGB = (x: number, y: number): [number, number, number] => {
    const xx = Math.min(w - 1, Math.max(0, x));
    const yy = Math.min(h - 1, Math.max(0, y));
    const i = (yy * w + xx) * 4;
    return [data[i], data[i + 1], data[i + 2]];
  };

  // Colores de fondo deducidos de las esquinas (checkerboard “falso alpha”).
  // Se usan como chroma-key global para borrar también islotes internos.
  const bgSamples: Array<[number, number, number]> = [
    readRGB(0, 0),
    readRGB(1, 0),
    readRGB(0, 1),
    readRGB(w - 1, 0),
    readRGB(w - 2, 0),
    readRGB(w - 1, 1),
    readRGB(0, h - 1),
    readRGB(1, h - 1),
    readRGB(0, h - 2),
    readRGB(w - 1, h - 1),
    readRGB(w - 2, h - 1),
    readRGB(w - 1, h - 2)
  ];

  const uniqueBg: Array<[number, number, number]> = [];
  const addUniqueBg = (r: number, g: number, b: number) => {
    for (const [ur, ug, ub] of uniqueBg) {
      const d = Math.max(Math.abs(r - ur), Math.abs(g - ug), Math.abs(b - ub));
      if (d <= 8) return;
    }
    uniqueBg.push([r, g, b]);
  };
  for (const [r, g, b] of bgSamples) addUniqueBg(r, g, b);

  const isCheckerAt = (p: number): boolean => {
    const i = p * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    if (maxDiff > grayTolerance) return false;
    const br = (r + g + b) / 3;
    return br >= brightnessMin && br <= brightnessMax;
  };

  const visited = new Uint8Array(w * h);
  const queue: number[] = [];
  let head = 0;

  const seed = (p: number) => {
    if (!visited[p] && isCheckerAt(p)) {
      visited[p] = 1;
      queue.push(p);
    }
  };

  for (let x = 0; x < w; x++) {
    seed(x);
    seed((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    seed(y * w);
    seed(y * w + (w - 1));
  }

  while (head < queue.length) {
    const p = queue[head++];
    const x = p % w;
    const y = (p - x) / w;
    if (x > 0) seed(p - 1);
    if (x < w - 1) seed(p + 1);
    if (y > 0) seed(p - w);
    if (y < h - 1) seed(p + w);
  }

  // Segundo pase: elimina "islotes" de checkerboard que el flood-fill no
  // alcanza porque quedan rodeados de personaje (huecos entre piernas,
  // entre brazo y torso, entre gabardina y cuerpo, etc.). Usamos una
  // tolerancia MUY ESTRICTA para no tocar los grises tintados del personaje
  // (gabardina tintada, fedora gris-oscura) que tienen R, G, B diferentes.
  const strictTolerance = Math.min(8, grayTolerance + 1);
  for (let p = 0; p < w * h; p++) {
    if (visited[p]) continue;
    const i = p * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Chroma-key global contra colores del checkerboard detectados en esquinas.
    // Esto elimina restos internos aislados aunque no estén conectados al borde.
    let matchesCornerBg = false;
    for (const [br, bg, bb] of uniqueBg) {
      const d = Math.max(Math.abs(r - br), Math.abs(g - bg), Math.abs(b - bb));
      if (d <= 16) {
        matchesCornerBg = true;
        break;
      }
    }
    if (matchesCornerBg) {
      visited[p] = 1;
      continue;
    }

    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    if (maxDiff > strictTolerance) continue;
    const br = (r + g + b) / 3;
    // Los dos tonos clásicos del "transparent background" de Photoshop:
    // oscuro ~110-135 y claro ~180-210. Limitamos a esas bandas para
    // maxima seguridad.
    const inDarkBand = br >= 100 && br <= 140;
    const inLightBand = br >= 175 && br <= 215;
    if (inDarkBand || inLightBand) {
      visited[p] = 1;
    }
  }

  // Pase extra anti-speckles: borra píxeles neutrales sueltos que quedan
  // pegados al contorno tras el chroma-key (flicker en walk).
  for (let iter = 0; iter < 2; iter++) {
    const mark = new Uint8Array(w * h);
    for (let p = 0; p < w * h; p++) {
      if (visited[p]) continue;
      const x = p % w;
      const y = (p - x) / w;
      const i = p * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      const br = (r + g + b) / 3;
      // Solo candidatos "neutros" típicos de checker residual.
      if (maxDiff > 18 || br < 80 || br > 235) continue;

      let aroundVisited = 0;
      for (let ny = y - 1; ny <= y + 1; ny++) {
        if (ny < 0 || ny >= h) continue;
        for (let nx = x - 1; nx <= x + 1; nx++) {
          if (nx < 0 || nx >= w || (nx === x && ny === y)) continue;
          const np = ny * w + nx;
          if (visited[np]) aroundVisited++;
        }
      }
      // Si casi todos sus vecinos ya son fondo, es basura residual.
      if (aroundVisited >= 6) mark[p] = 1;
    }
    for (let p = 0; p < w * h; p++) {
      if (mark[p]) visited[p] = 1;
    }
  }

  // Tercer pase: elimina "bloques" residuales pequeños del checkerboard que
  // aún puedan quedar dentro del personaje (muy típico en frames walk).
  // Solo borra componentes conectados pequeños y neutrales para no destruir
  // zonas reales de la gabardina/sombrero.
  const residual = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) {
    if (visited[p]) continue;
    const i = p * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    if (maxDiff > 16) continue;
    const br = (r + g + b) / 3;
    if (br < 80 || br > 240) continue;
    residual[p] = 1;
  }

  const seenResidual = new Uint8Array(w * h);
  const q2: number[] = [];
  for (let seedP = 0; seedP < w * h; seedP++) {
    if (!residual[seedP] || seenResidual[seedP]) continue;

    q2.length = 0;
    q2.push(seedP);
    seenResidual[seedP] = 1;
    let head2 = 0;
    let area = 0;
    let minRX = w;
    let minRY = h;
    let maxRX = 0;
    let maxRY = 0;

    while (head2 < q2.length) {
      const p = q2[head2++];
      area++;
      const x = p % w;
      const y = (p - x) / w;
      if (x < minRX) minRX = x;
      if (y < minRY) minRY = y;
      if (x > maxRX) maxRX = x;
      if (y > maxRY) maxRY = y;

      const left = x > 0 ? p - 1 : -1;
      const right = x < w - 1 ? p + 1 : -1;
      const up = y > 0 ? p - w : -1;
      const down = y < h - 1 ? p + w : -1;

      if (left >= 0 && residual[left] && !seenResidual[left]) {
        seenResidual[left] = 1;
        q2.push(left);
      }
      if (right >= 0 && residual[right] && !seenResidual[right]) {
        seenResidual[right] = 1;
        q2.push(right);
      }
      if (up >= 0 && residual[up] && !seenResidual[up]) {
        seenResidual[up] = 1;
        q2.push(up);
      }
      if (down >= 0 && residual[down] && !seenResidual[down]) {
        seenResidual[down] = 1;
        q2.push(down);
      }
    }

    const bw = maxRX - minRX + 1;
    const bh = maxRY - minRY + 1;
    const isSmallResidual = area <= 120 && bw <= 18 && bh <= 18;
    if (isSmallResidual) {
      for (const p of q2) visited[p] = 1;
    }
  }

  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let p = 0; p < w * h; p++) {
    if (visited[p]) {
      data[p * 4 + 3] = 0;
    } else {
      const x = p % w;
      const y = (p - x) / w;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      found = true;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  if (!found) {
    if (scene.textures.exists(dstKey)) scene.textures.remove(dstKey);
    scene.textures.addCanvas(dstKey, tmp);
    return { width: w, height: h };
  }

  const cx = Math.max(0, minX - padding);
  const cy = Math.max(0, minY - padding);
  const cw = Math.min(w - cx, maxX - minX + 1 + padding * 2);
  const ch = Math.min(h - cy, maxY - minY + 1 + padding * 2);

  const out = document.createElement('canvas');
  out.width = cw;
  out.height = ch;
  const octx = out.getContext('2d');
  if (!octx) return { width: cw, height: ch };
  octx.drawImage(tmp, cx, cy, cw, ch, 0, 0, cw, ch);

  if (scene.textures.exists(dstKey)) scene.textures.remove(dstKey);
  scene.textures.addCanvas(dstKey, out);
  return { width: cw, height: ch };
}

/**
 * Variante de chroma-key optimizada para imagenes generadas con FONDO DE COLOR
 * SOLIDO (magenta, verde cromakey, etc.). Mucho mas simple y fiable que el
 * flood-fill del checkerboard: cualquier pixel cuya distancia L-infinito al
 * color clave este dentro de `tolerance` se convierte en transparente.
 */
export function chromaKeySolidColor(
  scene: Phaser.Scene,
  srcKey: string,
  dstKey: string,
  keyR: number,
  keyG: number,
  keyB: number,
  options: { tolerance?: number; padding?: number } = {}
): { width: number; height: number } {
  const { tolerance = 60, padding = 2 } = options;

  const killMagentaSpill = (d: Uint8ClampedArray): void => {
    for (let p = 0; p < d.length / 4; p++) {
      const i = p * 4;
      if (d[i + 3] === 0) continue;
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      // Halos rosa/magenta residual (G bajo, R y B altos): típico del antialias
      // del chroma en exportaciones IA; la gabardina marrón no cumple R,B altos a la vez.
      if (r > 165 && b > 165 && g < 130 && g < (r + b) / 2 - 35) {
        d[i + 3] = 0;
        continue;
      }
      const dist = Math.max(Math.abs(r - keyR), Math.abs(g - keyG), Math.abs(b - keyB));
      // Segundo anillo: casi magenta pero colado por compresión / bordes suaves.
      if (dist <= tolerance + 45 && g < Math.min(r, b) - 10 && r + b > 320) {
        d[i + 3] = 0;
      }
    }
  };

  const srcTex = scene.textures.get(srcKey);
  if (!srcTex || srcTex.key === '__MISSING') {
    return { width: 0, height: 0 };
  }
  const srcImg = srcTex.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  const w = srcImg.width;
  const h = srcImg.height;

  const tmp = document.createElement('canvas');
  tmp.width = w;
  tmp.height = h;
  const ctx = tmp.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { width: w, height: h };
  ctx.drawImage(srcImg as CanvasImageSource, 0, 0);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let p = 0; p < w * h; p++) {
    const i = p * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const dr = Math.abs(r - keyR);
    const dg = Math.abs(g - keyG);
    const db = Math.abs(b - keyB);
    const dist = Math.max(dr, dg, db);
    if (dist <= tolerance) {
      data[i + 3] = 0;
    } else {
      const x = p % w;
      const y = (p - x) / w;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      found = true;
    }
  }

  killMagentaSpill(data);

  minX = w;
  minY = h;
  maxX = 0;
  maxY = 0;
  found = false;
  for (let p = 0; p < w * h; p++) {
    if (data[p * 4 + 3] === 0) continue;
    const x = p % w;
    const y = (p - x) / w;
    found = true;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  ctx.putImageData(imgData, 0, 0);

  if (!found) {
    if (scene.textures.exists(dstKey)) scene.textures.remove(dstKey);
    scene.textures.addCanvas(dstKey, tmp);
    return { width: w, height: h };
  }

  const cx = Math.max(0, minX - padding);
  const cy = Math.max(0, minY - padding);
  const cw = Math.min(w - cx, maxX - minX + 1 + padding * 2);
  const ch = Math.min(h - cy, maxY - minY + 1 + padding * 2);

  const out = document.createElement('canvas');
  out.width = cw;
  out.height = ch;
  const octx = out.getContext('2d');
  if (!octx) return { width: cw, height: ch };
  octx.drawImage(tmp, cx, cy, cw, ch, 0, 0, cw, ch);

  if (scene.textures.exists(dstKey)) scene.textures.remove(dstKey);
  scene.textures.addCanvas(dstKey, out);
  return { width: cw, height: ch };
}

/**
 * Variante batch de chromaKeySolidColor: aplica el chroma-key a multiples
 * frames del MISMO personaje y los recorta a un UNICO bounding box unificado
 * (la union de todos los bboxes individuales). Resultado: todas las texturas
 * de salida tienen EXACTAMENTE el mismo ancho/alto y el personaje esta en las
 * mismas coordenadas de pixel dentro de cada frame.
 *
 * Esto elimina por completo los saltos/jitter al animar (origin (0.5, 1)
 * siempre apunta al mismo punto del canvas uniforme).
 */
export function chromaKeyBatchUnifiedCrop(
  scene: Phaser.Scene,
  frames: Array<{ rawKey: string; cropKey: string }>,
  keyR: number,
  keyG: number,
  keyB: number,
  options: { tolerance?: number; padding?: number } = {}
): { width: number; height: number } {
  const { tolerance = 60, padding = 2 } = options;

  const killSpill = (d: Uint8ClampedArray): void => {
    for (let p = 0; p < d.length / 4; p++) {
      const i = p * 4;
      if (d[i + 3] === 0) continue;
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      if (r > 165 && b > 165 && g < 130 && g < (r + b) / 2 - 35) {
        d[i + 3] = 0;
        continue;
      }
      const dist = Math.max(Math.abs(r - keyR), Math.abs(g - keyG), Math.abs(b - keyB));
      if (dist <= tolerance + 45 && g < Math.min(r, b) - 10 && r + b > 320) {
        d[i + 3] = 0;
      }
    }
  };

  type Prepared = { key: string; canvas: HTMLCanvasElement; w: number; h: number };
  const prepared: Prepared[] = [];

  let unionMinX = Number.POSITIVE_INFINITY;
  let unionMinY = Number.POSITIVE_INFINITY;
  let unionMaxX = 0;
  let unionMaxY = 0;
  let maxW = 0;
  let maxH = 0;
  let anyFound = false;

  for (const { rawKey, cropKey } of frames) {
    const srcTex = scene.textures.get(rawKey);
    if (!srcTex || srcTex.key === '__MISSING') continue;
    const srcImg = srcTex.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const w = srcImg.width;
    const h = srcImg.height;
    if (w > maxW) maxW = w;
    if (h > maxH) maxH = h;

    const tmp = document.createElement('canvas');
    tmp.width = w;
    tmp.height = h;
    const ctx = tmp.getContext('2d', { willReadFrequently: true });
    if (!ctx) continue;
    ctx.drawImage(srcImg as CanvasImageSource, 0, 0);
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    for (let p = 0; p < w * h; p++) {
      const i = p * 4;
      const dr = Math.abs(data[i] - keyR);
      const dg = Math.abs(data[i + 1] - keyG);
      const db = Math.abs(data[i + 2] - keyB);
      if (Math.max(dr, dg, db) <= tolerance) data[i + 3] = 0;
    }
    killSpill(data);

    for (let p = 0; p < w * h; p++) {
      if (data[p * 4 + 3] === 0) continue;
      const x = p % w;
      const y = (p - x) / w;
      if (x < unionMinX) unionMinX = x;
      if (y < unionMinY) unionMinY = y;
      if (x > unionMaxX) unionMaxX = x;
      if (y > unionMaxY) unionMaxY = y;
      anyFound = true;
    }

    ctx.putImageData(imgData, 0, 0);
    prepared.push({ key: cropKey, canvas: tmp, w, h });
  }

  if (!anyFound || prepared.length === 0) {
    return { width: 0, height: 0 };
  }

  const cx = Math.max(0, Math.floor(unionMinX) - padding);
  const cy = Math.max(0, Math.floor(unionMinY) - padding);
  const rawW = Math.ceil(unionMaxX) - Math.floor(unionMinX) + 1 + padding * 2;
  const rawH = Math.ceil(unionMaxY) - Math.floor(unionMinY) + 1 + padding * 2;
  const cw = Math.min(maxW - cx, rawW);
  const ch = Math.min(maxH - cy, rawH);

  for (const p of prepared) {
    const out = document.createElement('canvas');
    out.width = cw;
    out.height = ch;
    const octx = out.getContext('2d');
    if (!octx) continue;
    const drawW = Math.min(cw, p.w - cx);
    const drawH = Math.min(ch, p.h - cy);
    if (drawW > 0 && drawH > 0) {
      octx.drawImage(p.canvas, cx, cy, drawW, drawH, 0, 0, drawW, drawH);
    }
    if (scene.textures.exists(p.key)) scene.textures.remove(p.key);
    scene.textures.addCanvas(p.key, out);
  }

  return { width: cw, height: ch };
}
