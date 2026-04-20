import * as Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PALETTE, TEX } from '../config/gameConfig';

/**
 * Genera todas las texturas placeholder pixel-art en runtime.
 * Todo se dibuja a baja resolución "fuente" y se escala con nearest para mantener
 * la estética pixel art HD a 1920x1080.
 *
 * Para sustituir por assets reales: reemplazar las llamadas desde PreloadScene
 * a este módulo por `this.load.image(key, ...)` manteniendo los IDs de TEX.
 */

type PixelRGBA = [number, number, number, number];

/**
 * Dibuja una matriz de pixeles 2D sobre un Graphics.
 * `palette` es un map de carácter -> color hex (0xRRGGBB) o null para transparente.
 * Cada entrada de `pixels` es una fila de caracteres.
 */
function drawPixelMap(
  g: Phaser.GameObjects.Graphics,
  pixels: string[],
  palette: Record<string, number | null>,
  pixelSize = 1,
  offsetX = 0,
  offsetY = 0
): void {
  for (let y = 0; y < pixels.length; y++) {
    const row = pixels[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const color = palette[ch];
      if (color === null || color === undefined) continue;
      g.fillStyle(color, 1);
      g.fillRect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize, pixelSize);
    }
  }
}

function makeGraphics(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  return g;
}

// =========================================================================
// XAVIER - sprite sheet animado
// =========================================================================
// Sprite por frame: 32x56 (se escalará x3 = 96x168 en pantalla).
// 4 frames por fila, 4 filas (idle, walk, talk, grab).

const X_W = 32;
const X_H = 56;
const X_COLS = 4;
const X_ROWS = 4;

function xavierPaletteBase(): Record<string, number | null> {
  return {
    '.': null,
    G: PALETTE.gabardina,
    g: PALETTE.gabardinaDark,
    F: PALETTE.fedora,
    f: PALETTE.fedoraBand,
    P: PALETTE.piel,
    p: PALETTE.pielSombra,
    B: PALETTE.bota,
    E: PALETTE.verdeEcto,
    e: PALETTE.verdeEctoSombra,
    W: PALETTE.blanco,
    K: PALETTE.negro
  };
}

/**
 * Genera una silueta de Xavier parametrizable para producir los 16 frames.
 * params:
 *  - armL / armR: posición del brazo (-1 = arriba, 0 = normal, 1 = abajo)
 *  - legL / legR: offset vertical de pies
 *  - mouthOpen: bool
 *  - ectoColor: variante de color espectrómetro (E o e)
 *  - headBob: +1/-1 pequeña variación vertical cabeza
 */
interface XavierFrameParams {
  armL?: -1 | 0 | 1;
  armR?: -1 | 0 | 1;
  legL?: number;
  legR?: number;
  mouthOpen?: boolean;
  ectoOn?: boolean;
  headBob?: 0 | 1;
  grabItem?: boolean;
}

function buildXavierFrame(params: XavierFrameParams): string[] {
  const {
    armL = 0,
    armR = 0,
    legL = 0,
    legR = 0,
    mouthOpen = false,
    ectoOn = true,
    headBob = 0,
    grabItem = false
  } = params;

  const rows: string[] = [];
  for (let i = 0; i < X_H; i++) rows.push('.'.repeat(X_W));

  const set = (x: number, y: number, ch: string) => {
    if (y < 0 || y >= X_H || x < 0 || x >= X_W) return;
    rows[y] = rows[y].substring(0, x) + ch + rows[y].substring(x + 1);
  };
  const fillRect = (x: number, y: number, w: number, h: number, ch: string) => {
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) set(xx, yy, ch);
    }
  };

  const yHead = 4 + headBob;

  // Sombrero fedora
  fillRect(8, yHead, 16, 2, 'F');
  fillRect(6, yHead + 2, 20, 2, 'F');
  fillRect(7, yHead + 4, 18, 1, 'f');

  // Cara
  fillRect(10, yHead + 5, 12, 8, 'P');
  fillRect(10, yHead + 12, 12, 1, 'p');
  // Ojos
  set(13, yHead + 7, 'K');
  set(14, yHead + 7, 'K');
  set(18, yHead + 7, 'K');
  set(19, yHead + 7, 'K');
  // Boca
  if (mouthOpen) {
    fillRect(14, yHead + 10, 5, 2, 'K');
  } else {
    fillRect(14, yHead + 10, 5, 1, 'K');
  }

  // Cuello
  fillRect(14, yHead + 13, 4, 2, 'p');

  // Gabardina (torso)
  fillRect(7, yHead + 15, 18, 18, 'G');
  // Sombras laterales
  fillRect(7, yHead + 15, 2, 18, 'g');
  fillRect(23, yHead + 15, 2, 18, 'g');
  // Solapas
  fillRect(14, yHead + 15, 4, 10, 'g');
  set(15, yHead + 16, 'W');
  // Botones
  set(16, yHead + 20, 'f');
  set(16, yHead + 24, 'f');

  // Cinturón con espectrómetro
  fillRect(7, yHead + 33, 18, 2, 'f');
  // Espectrómetro luz
  const ectoCh = ectoOn ? 'E' : 'e';
  fillRect(20, yHead + 33, 3, 2, ectoCh);
  set(21, yHead + 32, ectoCh);

  // Piernas (gabardina cae)
  fillRect(10, yHead + 35, 5, 10 + legL, 'g');
  fillRect(17, yHead + 35, 5, 10 + legR, 'g');

  // Botas
  fillRect(10, yHead + 45 + legL, 5, 3, 'B');
  fillRect(17, yHead + 45 + legR, 5, 3, 'B');

  // Brazos
  // Brazo izquierdo (player left = pantalla derecha cuando mira al espectador)
  if (armL === -1) {
    // Levantado (grab)
    fillRect(5, yHead + 14, 3, 10, 'G');
    fillRect(4, yHead + 10, 4, 6, 'G');
    fillRect(4, yHead + 9, 4, 2, 'P');
  } else if (armL === 1) {
    fillRect(5, yHead + 16, 3, 14, 'G');
    fillRect(5, yHead + 30, 3, 2, 'P');
  } else {
    fillRect(5, yHead + 16, 3, 12, 'G');
    fillRect(5, yHead + 28, 3, 2, 'P');
  }

  // Brazo derecho
  if (armR === -1) {
    fillRect(24, yHead + 14, 3, 10, 'G');
    fillRect(24, yHead + 10, 4, 6, 'G');
    fillRect(24, yHead + 9, 4, 2, 'P');
    if (grabItem) {
      fillRect(24, yHead + 7, 4, 3, 'E');
    }
  } else if (armR === 1) {
    fillRect(24, yHead + 16, 3, 14, 'G');
    fillRect(24, yHead + 30, 3, 2, 'P');
  } else {
    fillRect(24, yHead + 16, 3, 12, 'G');
    fillRect(24, yHead + 28, 3, 2, 'P');
  }

  return rows;
}

export function generateXavierSheet(scene: Phaser.Scene): void {
  const g = makeGraphics(scene);

  const palette = xavierPaletteBase();

  const frames: string[][] = [];

  // Fila 0: IDLE (4 frames, respiración suave)
  frames.push(buildXavierFrame({ ectoOn: true, headBob: 0 }));
  frames.push(buildXavierFrame({ ectoOn: true, headBob: 1 }));
  frames.push(buildXavierFrame({ ectoOn: false, headBob: 0 }));
  frames.push(buildXavierFrame({ ectoOn: true, headBob: 1 }));

  // Fila 1: WALK (4 frames, piernas alternan)
  frames.push(buildXavierFrame({ legL: 0, legR: -1, armL: 1, armR: 0 }));
  frames.push(buildXavierFrame({ legL: -1, legR: 0, armL: 0, armR: 1 }));
  frames.push(buildXavierFrame({ legL: 0, legR: -1, armL: 1, armR: 0, ectoOn: false }));
  frames.push(buildXavierFrame({ legL: -1, legR: 0, armL: 0, armR: 1 }));

  // Fila 2: TALK (4 frames, boca abre/cierra)
  frames.push(buildXavierFrame({ mouthOpen: false, headBob: 0 }));
  frames.push(buildXavierFrame({ mouthOpen: true, headBob: 0 }));
  frames.push(buildXavierFrame({ mouthOpen: true, headBob: 1 }));
  frames.push(buildXavierFrame({ mouthOpen: false, headBob: 1 }));

  // Fila 3: GRAB (4 frames, brazo derecho sube y baja con item)
  frames.push(buildXavierFrame({ armR: 0 }));
  frames.push(buildXavierFrame({ armR: -1 }));
  frames.push(buildXavierFrame({ armR: -1, grabItem: true }));
  frames.push(buildXavierFrame({ armR: 0, grabItem: true }));

  // Dibujamos la hoja completa
  const sheetW = X_W * X_COLS;
  const sheetH = X_H * X_ROWS;

  for (let r = 0; r < X_ROWS; r++) {
    for (let c = 0; c < X_COLS; c++) {
      const frameIdx = r * X_COLS + c;
      const map = frames[frameIdx];
      drawPixelMap(g, map, palette, 1, c * X_W, r * X_H);
    }
  }

  g.generateTexture(TEX.XAVIER, sheetW, sheetH);
  g.destroy();
}

export const XAVIER_FRAME_SIZE = { w: X_W, h: X_H, cols: X_COLS, rows: X_ROWS };

// =========================================================================
// FONDO MUELLE (1920x1080)
// =========================================================================
export function generateMuelleBg(scene: Phaser.Scene): void {
  const g = makeGraphics(scene);

  // Cielo gradiente por bandas
  const bands = 18;
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    const c = lerpColor(PALETTE.cieloNoche, PALETTE.cieloNocheClaro, t);
    g.fillStyle(c, 1);
    g.fillRect(0, (i * 540) / bands, GAME_WIDTH, 540 / bands + 2);
  }

  // Estrellas
  const rng = mulberry32(1337);
  g.fillStyle(PALETTE.blanco, 1);
  for (let i = 0; i < 120; i++) {
    const sx = Math.floor(rng() * GAME_WIDTH);
    const sy = Math.floor(rng() * 500);
    const size = rng() > 0.9 ? 3 : 2;
    g.fillRect(sx, sy, size, size);
  }

  // Luna
  const moonX = 1500;
  const moonY = 160;
  const moonR = 80;
  g.fillStyle(PALETTE.lunaSombra, 1);
  g.fillCircle(moonX + 6, moonY + 6, moonR);
  g.fillStyle(PALETTE.luna, 1);
  g.fillCircle(moonX, moonY, moonR);
  // Cráteres pixel
  g.fillStyle(PALETTE.lunaSombra, 1);
  g.fillRect(moonX - 30, moonY - 10, 14, 10);
  g.fillRect(moonX + 10, moonY + 20, 18, 12);
  g.fillRect(moonX - 10, moonY + 40, 8, 8);

  // Halo luna
  g.fillStyle(PALETTE.luna, 0.08);
  g.fillCircle(moonX, moonY, moonR + 30);
  g.fillStyle(PALETTE.luna, 0.05);
  g.fillCircle(moonX, moonY, moonR + 60);

  // Mar (distante)
  g.fillStyle(0x0b1428, 1);
  g.fillRect(0, 540, GAME_WIDTH, 120);
  // Reflejos luna en mar
  g.fillStyle(PALETTE.luna, 0.45);
  for (let y = 560; y < 660; y += 6) {
    const w = 120 - Math.abs(610 - y) * 1.8;
    g.fillRect(moonX - w / 2, y, w, 2);
  }
  g.fillStyle(PALETTE.luna, 0.2);
  for (let y = 550; y < 660; y += 4) {
    g.fillRect(moonX - 80 + Math.sin(y * 0.2) * 40, y, 4, 1);
  }

  // Silueta de rocas/acantilados
  g.fillStyle(0x0a0f1a, 1);
  drawJaggedSilhouette(g, 0, 530, GAME_WIDTH, 60, 0x0a0f1a, 40);

  // Muelle de madera (plataforma principal)
  const pierTop = 660;
  const pierBottom = GAME_HEIGHT;
  g.fillStyle(PALETTE.maderaPodrida, 1);
  g.fillRect(0, pierTop, GAME_WIDTH, pierBottom - pierTop);

  // Tablones verticales
  for (let x = 0; x < GAME_WIDTH; x += 80) {
    g.fillStyle(PALETTE.maderaOscura, 1);
    g.fillRect(x, pierTop, 4, pierBottom - pierTop);
  }
  // Vetas y tonos medios
  for (let x = 20; x < GAME_WIDTH; x += 80) {
    g.fillStyle(PALETTE.maderaMedia, 0.6);
    g.fillRect(x, pierTop + 8, 60, 3);
    g.fillStyle(PALETTE.maderaClara, 0.25);
    g.fillRect(x + 10, pierTop + 40, 45, 2);
  }

  // Línea de horizonte muelle (borde)
  g.fillStyle(PALETTE.maderaOscura, 1);
  g.fillRect(0, pierTop, GAME_WIDTH, 6);
  g.fillStyle(PALETTE.maderaClara, 0.8);
  g.fillRect(0, pierTop + 6, GAME_WIDTH, 2);

  // Pilotes verticales de muelle al fondo
  g.fillStyle(PALETTE.maderaOscura, 1);
  for (let x = 80; x < GAME_WIDTH; x += 220) {
    g.fillRect(x, 660, 16, 20);
  }

  // Farolas verdes fantasmales
  drawFarola(g, 240, 480);
  drawFarola(g, 1120, 460);

  // Halo verde sobre farolas (en el fondo)
  g.fillStyle(PALETTE.verdeEcto, 0.08);
  g.fillCircle(240 + 18, 500, 120);
  g.fillStyle(PALETTE.verdeEcto, 0.08);
  g.fillCircle(1120 + 18, 480, 120);

  // Silueta lejana de pueblo
  g.fillStyle(0x111827, 1);
  drawJaggedSilhouette(g, 0, 580, GAME_WIDTH, 40, 0x111827, 80);
  // Ventanas iluminadas puntuales
  g.fillStyle(PALETTE.amarilloLuz, 0.85);
  const lights = [300, 420, 710, 890, 1300, 1550, 1720];
  for (const lx of lights) g.fillRect(lx, 600, 3, 4);

  g.generateTexture(TEX.BG_MUELLE, GAME_WIDTH, GAME_HEIGHT);
  g.destroy();
}

function drawFarola(g: Phaser.GameObjects.Graphics, x: number, baseY: number): void {
  // Poste
  g.fillStyle(PALETTE.negro, 1);
  g.fillRect(x + 14, baseY, 6, 180);
  // Base
  g.fillRect(x + 8, baseY + 180, 18, 6);
  g.fillStyle(PALETTE.piedraMedia, 1);
  g.fillRect(x + 10, baseY + 174, 14, 4);
  // Brazo
  g.fillStyle(PALETTE.negro, 1);
  g.fillRect(x + 4, baseY - 4, 20, 4);
  // Farol
  g.fillStyle(PALETTE.negro, 1);
  g.fillRect(x + 2, baseY - 24, 24, 22);
  g.fillStyle(PALETTE.verdeEctoSombra, 1);
  g.fillRect(x + 4, baseY - 22, 20, 18);
  g.fillStyle(PALETTE.verdeEcto, 1);
  g.fillRect(x + 8, baseY - 18, 12, 10);
  g.fillStyle(PALETTE.blanco, 0.7);
  g.fillRect(x + 12, baseY - 16, 4, 4);
}

function drawJaggedSilhouette(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
  step: number
): void {
  g.fillStyle(color, 1);
  let curY = y;
  for (let cx = x; cx < x + w; cx += step) {
    const dy = (Math.sin(cx * 0.03) + Math.cos(cx * 0.013)) * (h * 0.4);
    curY = y + dy;
    g.fillRect(cx, curY, step + 2, h - dy + 4);
  }
}

// =========================================================================
// FONDO TABERNA
// =========================================================================
export function generateTabernaBg(scene: Phaser.Scene): void {
  const g = makeGraphics(scene);

  // Paredes
  const wallBottom = 760;
  for (let i = 0; i < 16; i++) {
    const t = i / 15;
    const c = lerpColor(PALETTE.tabernaOscuro, PALETTE.tabernaMedio, t);
    g.fillStyle(c, 1);
    g.fillRect(0, (i * wallBottom) / 16, GAME_WIDTH, wallBottom / 16 + 2);
  }

  // Rodapié oscuro
  g.fillStyle(PALETTE.tabernaOscuro, 1);
  g.fillRect(0, wallBottom - 40, GAME_WIDTH, 40);

  // Suelo de madera
  g.fillStyle(PALETTE.maderaMedia, 1);
  g.fillRect(0, wallBottom, GAME_WIDTH, GAME_HEIGHT - wallBottom);
  g.fillStyle(PALETTE.maderaOscura, 1);
  for (let x = 0; x < GAME_WIDTH; x += 120) g.fillRect(x, wallBottom, 3, GAME_HEIGHT - wallBottom);
  g.fillStyle(PALETTE.maderaClara, 0.35);
  for (let y = wallBottom + 20; y < GAME_HEIGHT; y += 40) g.fillRect(0, y, GAME_WIDTH, 2);

  // Barra del bar
  const barTop = 620;
  g.fillStyle(PALETTE.tabernaClaro, 1);
  g.fillRect(100, barTop, GAME_WIDTH - 200, 40);
  g.fillStyle(PALETTE.maderaClara, 1);
  g.fillRect(100, barTop - 8, GAME_WIDTH - 200, 8);
  g.fillStyle(PALETTE.maderaOscura, 1);
  g.fillRect(100, barTop + 40, GAME_WIDTH - 200, 140);
  g.fillStyle(PALETTE.maderaMedia, 0.6);
  for (let x = 120; x < GAME_WIDTH - 120; x += 80) g.fillRect(x, barTop + 40, 3, 140);

  // Estanterías con botellas al fondo
  for (let s = 0; s < 3; s++) {
    const shelfY = 180 + s * 100;
    g.fillStyle(PALETTE.maderaOscura, 1);
    g.fillRect(200, shelfY, GAME_WIDTH - 400, 14);
    for (let bx = 220; bx < GAME_WIDTH - 220; bx += 40) {
      const botColor = [0x3a5a3a, 0x6b3a22, 0x2c4a5c, 0x5a2c4a][(bx + s) % 4];
      g.fillStyle(botColor, 1);
      g.fillRect(bx + 6, shelfY - 28, 10, 28);
      g.fillRect(bx + 8, shelfY - 34, 6, 6);
    }
  }

  // Cabeza de monstruo marino disecada
  const mx = 900;
  const my = 140;
  g.fillStyle(0x2c4a5c, 1);
  g.fillCircle(mx, my, 60);
  g.fillStyle(0x1d3847, 1);
  g.fillCircle(mx - 12, my + 8, 50);
  // Ojos rojos
  g.fillStyle(PALETTE.rojoAcento, 1);
  g.fillRect(mx - 20, my - 10, 6, 6);
  g.fillRect(mx + 14, my - 10, 6, 6);
  // Dientes
  g.fillStyle(PALETTE.blanco, 1);
  for (let tx = -20; tx <= 20; tx += 10) {
    g.fillTriangle(mx + tx, my + 18, mx + tx + 6, my + 18, mx + tx + 3, my + 30);
  }

  // Lámpara colgante con halo amarillo
  g.fillStyle(PALETTE.negro, 1);
  g.fillRect(1400, 0, 3, 120);
  g.fillRect(1380, 120, 43, 10);
  g.fillStyle(PALETTE.amarilloLuz, 1);
  g.fillCircle(1401, 150, 28);
  g.fillStyle(PALETTE.amarilloLuz, 0.15);
  g.fillCircle(1401, 150, 120);
  g.fillStyle(PALETTE.amarilloLuz, 0.08);
  g.fillCircle(1401, 150, 220);

  // Puerta (salida al muelle) izquierda
  g.fillStyle(PALETTE.maderaOscura, 1);
  g.fillRect(80, 420, 180, 340);
  g.fillStyle(PALETTE.maderaMedia, 1);
  g.fillRect(90, 430, 160, 320);
  for (let py = 440; py < 750; py += 30) {
    g.fillStyle(PALETTE.maderaOscura, 1);
    g.fillRect(90, py, 160, 3);
  }
  g.fillStyle(PALETTE.bronce, 1);
  g.fillCircle(230, 590, 5);
  // Cartel "SALIDA" sobre puerta
  g.fillStyle(PALETTE.negro, 1);
  g.fillRect(100, 400, 140, 20);
  g.fillStyle(PALETTE.verdeEcto, 1);
  g.fillRect(110, 405, 10, 10);
  g.fillRect(130, 405, 10, 10);
  g.fillRect(150, 405, 10, 10);

  g.generateTexture(TEX.BG_TABERNA, GAME_WIDTH, GAME_HEIGHT);
  g.destroy();
}

// =========================================================================
// FONDO CALLEJÓN
// =========================================================================
export function generateCallejonBg(scene: Phaser.Scene): void {
  const g = makeGraphics(scene);

  // Cielo nocturno superior (estrecho, entre paredes)
  g.fillStyle(PALETTE.cieloNoche, 1);
  g.fillRect(0, 0, GAME_WIDTH, 160);
  // Estrellas discretas
  const rng = mulberry32(777);
  g.fillStyle(PALETTE.blanco, 1);
  for (let i = 0; i < 40; i++) {
    g.fillRect(Math.floor(rng() * GAME_WIDTH), Math.floor(rng() * 160), 2, 2);
  }

  // Muros laterales
  g.fillStyle(PALETTE.piedraOscura, 1);
  g.fillRect(0, 160, GAME_WIDTH, 600);
  // Ladrillos
  g.fillStyle(PALETTE.piedraMedia, 1);
  for (let y = 160; y < 760; y += 28) {
    const offset = ((y / 28) | 0) % 2 === 0 ? 0 : 30;
    for (let x = -30 + offset; x < GAME_WIDTH; x += 60) {
      g.fillRect(x, y, 58, 26);
    }
  }
  // Juntas oscuras
  g.fillStyle(PALETTE.piedraOscura, 0.75);
  for (let y = 160; y < 760; y += 28) g.fillRect(0, y + 26, GAME_WIDTH, 2);

  // Pared del fondo (oscurecida hacia el centro)
  g.fillStyle(PALETTE.negro, 0.55);
  g.fillRect(540, 160, 840, 600);

  // Suelo
  g.fillStyle(PALETTE.piedraMedia, 1);
  g.fillRect(0, 760, GAME_WIDTH, GAME_HEIGHT - 760);
  g.fillStyle(PALETTE.piedraClara, 0.25);
  for (let y = 780; y < GAME_HEIGHT; y += 30) g.fillRect(0, y, GAME_WIDTH, 2);
  g.fillStyle(PALETTE.piedraOscura, 0.5);
  for (let x = 0; x < GAME_WIDTH; x += 100) g.fillRect(x, 760, 2, GAME_HEIGHT - 760);

  // Puerta de madera de la tienda vudú (centro)
  const doorX = 840;
  const doorY = 380;
  const doorW = 240;
  const doorH = 380;
  g.fillStyle(PALETTE.maderaOscura, 1);
  g.fillRect(doorX - 16, doorY - 16, doorW + 32, doorH + 32);
  g.fillStyle(PALETTE.maderaMedia, 1);
  g.fillRect(doorX, doorY, doorW, doorH);
  // Vetas verticales
  g.fillStyle(PALETTE.maderaOscura, 1);
  for (let x = doorX; x < doorX + doorW; x += 40) g.fillRect(x, doorY, 3, doorH);
  // Marco oxidado
  g.fillStyle(PALETTE.bronce, 1);
  g.fillRect(doorX - 4, doorY - 4, doorW + 8, 8);
  g.fillRect(doorX - 4, doorY + doorH - 4, doorW + 8, 8);
  // Pomo
  g.fillStyle(PALETTE.bronce, 1);
  g.fillCircle(doorX + doorW - 30, doorY + doorH / 2, 8);
  // Amuletos colgantes
  drawAmuleto(g, doorX + 30, doorY + 20, PALETTE.amulet1);
  drawAmuleto(g, doorX + 120, doorY + 10, PALETTE.amulet2);
  drawAmuleto(g, doorX + 200, doorY + 25, PALETTE.amulet3);
  drawAmuleto(g, doorX + 60, doorY + 60, PALETTE.verdeEcto);
  drawAmuleto(g, doorX + 170, doorY + 70, PALETTE.amulet1);

  // Cartel vudú encima de la puerta
  g.fillStyle(PALETTE.maderaOscura, 1);
  g.fillRect(doorX - 40, doorY - 80, doorW + 80, 56);
  g.fillStyle(PALETTE.maderaClara, 1);
  g.fillRect(doorX - 36, doorY - 76, doorW + 72, 48);
  g.fillStyle(PALETTE.negro, 1);
  // "VUDÚ" con rectángulos
  const letterX = doorX + 50;
  const letterY = doorY - 60;
  drawLetter(g, letterX, letterY, 'V');
  drawLetter(g, letterX + 32, letterY, 'U');
  drawLetter(g, letterX + 64, letterY, 'D');
  drawLetter(g, letterX + 96, letterY, 'U');

  // Farola verde fantasmal superior
  drawFarola(g, 200, 260);
  g.fillStyle(PALETTE.verdeEcto, 0.1);
  g.fillCircle(218, 280, 220);

  // Charquitos en el suelo
  g.fillStyle(PALETTE.piedraOscura, 1);
  g.fillEllipse(450, 950, 120, 20);
  g.fillEllipse(1400, 980, 160, 24);
  g.fillStyle(PALETTE.verdeEcto, 0.2);
  g.fillEllipse(450, 946, 100, 14);
  g.fillEllipse(1400, 976, 140, 16);

  g.generateTexture(TEX.BG_CALLEJON, GAME_WIDTH, GAME_HEIGHT);
  g.destroy();
}

function drawAmuleto(g: Phaser.GameObjects.Graphics, x: number, y: number, color: number): void {
  g.fillStyle(PALETTE.negro, 1);
  g.fillRect(x + 4, y, 2, 18);
  g.fillStyle(color, 1);
  g.fillCircle(x + 5, y + 22, 8);
  g.fillStyle(PALETTE.negro, 1);
  g.fillCircle(x + 5, y + 22, 3);
}

function drawLetter(g: Phaser.GameObjects.Graphics, x: number, y: number, letter: string): void {
  g.fillStyle(PALETTE.negro, 1);
  switch (letter) {
    case 'V':
      g.fillRect(x, y, 4, 24);
      g.fillRect(x + 20, y, 4, 24);
      g.fillRect(x + 4, y + 20, 4, 8);
      g.fillRect(x + 12, y + 24, 4, 8);
      break;
    case 'U':
      g.fillRect(x, y, 4, 28);
      g.fillRect(x + 20, y, 4, 28);
      g.fillRect(x + 4, y + 28, 16, 4);
      break;
    case 'D':
      g.fillRect(x, y, 4, 32);
      g.fillRect(x + 4, y, 16, 4);
      g.fillRect(x + 4, y + 28, 16, 4);
      g.fillRect(x + 20, y + 4, 4, 24);
      break;
    default:
      g.fillRect(x, y, 24, 32);
      break;
  }
}

// =========================================================================
// PROPS / SPRITES SECUNDARIOS
// =========================================================================

export function generateMuelleProps(scene: Phaser.Scene): void {
  // Cartel muelle
  {
    const g = makeGraphics(scene);
    g.fillStyle(PALETTE.maderaOscura, 1);
    g.fillRect(0, 30, 200, 120);
    g.fillStyle(PALETTE.maderaMedia, 1);
    g.fillRect(6, 36, 188, 108);
    g.fillStyle(PALETTE.maderaOscura, 1);
    g.fillRect(92, 150, 16, 80);
    // Letras (simuladas con rectángulos)
    g.fillStyle(PALETTE.negro, 1);
    const txt = [10, 20, 32, 50, 62, 78, 94, 110, 122, 136, 148, 164];
    for (const tx of txt) g.fillRect(tx, 70, 8, 12);
    for (const tx of [14, 30, 46, 62, 78, 94, 122, 140, 156, 172]) g.fillRect(tx, 100, 8, 12);
    g.generateTexture(TEX.MUELLE_CARTEL, 200, 230);
    g.destroy();
  }
  // Ectoplasma charco
  {
    const g = makeGraphics(scene);
    g.fillStyle(PALETTE.verdeEctoSombra, 1);
    g.fillEllipse(70, 30, 130, 40);
    g.fillStyle(PALETTE.verdeEcto, 1);
    g.fillEllipse(70, 26, 110, 26);
    g.fillStyle(PALETTE.blanco, 0.65);
    g.fillEllipse(55, 22, 40, 8);
    g.generateTexture(TEX.MUELLE_ECTOPLASMA, 140, 60);
    g.destroy();
  }
  // Ectoplasma vacío (después de recoger) - sólo marca débil
  {
    const g = makeGraphics(scene);
    g.fillStyle(PALETTE.verdeEctoSombra, 0.35);
    g.fillEllipse(70, 18, 90, 14);
    g.generateTexture(TEX.MUELLE_ECTOPLASMA_VACIO, 140, 36);
    g.destroy();
  }
  // Guardián espectral
  {
    const g = makeGraphics(scene);
    // Silueta con pluma
    const palette: Record<string, number | null> = {
      '.': null,
      G: PALETTE.verdeEcto,
      g: PALETTE.verdeEctoSombra,
      K: PALETTE.negro,
      W: PALETTE.blanco,
      Y: PALETTE.amarilloLuz
    };
    const pixels = [
      '........ggggg........',
      '.......gggggGg.......',
      '......gGGGGGGGg......',
      '......gGGGGGGGg......',
      '......gGKKGGKKg......',
      '......gGGGGGGGg......',
      '.......gGGGGg........',
      '.......ggGGgg........',
      '......ggGGGGgg.......',
      '.....gggGGGGggg......',
      '.....gGGGGGGGGg......',
      '.....gGGGGYGGGg......',
      '.....gGGGYYYGGg......',
      '.....gGGGGYGGGg......',
      '......gGGGGGGg.......',
      '......gGGGGGGg.......',
      '......gGGGGGGg.......',
      '......ggGGGGgg.......',
      '.....ggggggggg.......',
      '.....g.......g.......'
    ];
    drawPixelMap(g, pixels, palette, 8);
    g.generateTexture(TEX.MUELLE_GUARDIAN, 21 * 8, 20 * 8);
    g.destroy();
  }
  // Barco alejándose
  {
    const g = makeGraphics(scene);
    g.fillStyle(0x111827, 1);
    g.fillRect(0, 18, 90, 8);
    g.fillTriangle(0, 26, 90, 26, 80, 32);
    // Mástil
    g.fillRect(40, 0, 3, 24);
    g.fillStyle(0x1b2340, 1);
    g.fillRect(30, 6, 24, 14);
    g.generateTexture(TEX.MUELLE_BARCO, 90, 32);
    g.destroy();
  }
  // Niebla (franja suave)
  {
    const g = makeGraphics(scene);
    const w = 1600;
    const h = 200;
    for (let y = 0; y < h; y++) {
      const alpha = Math.max(0, 0.22 - Math.abs(h / 2 - y) / (h / 2) * 0.22);
      g.fillStyle(PALETTE.nieblaB, alpha);
      g.fillRect(0, y, w, 1);
    }
    g.generateTexture(TEX.NIEBLA, w, h);
    g.destroy();
  }
}

export function generateTabernaProps(scene: Phaser.Scene): void {
  // Tabernero zombi
  {
    const g = makeGraphics(scene);
    const pal: Record<string, number | null> = {
      '.': null,
      P: 0x8aad82,
      p: 0x5e7f5e,
      S: 0x5b3020,
      s: 0x3d1f14,
      K: PALETTE.negro,
      W: PALETTE.blanco,
      R: PALETTE.rojoAcento
    };
    const rows: string[] = [
      '.....pppppp.....',
      '....pPPPPPPp....',
      '....pPPPPPPp....',
      '....pPKPPKPp....',
      '....pPPPPPPp....',
      '....pPPKKPPp....',
      '....pPPPPPPp....',
      '.....pPPPPp.....',
      '....sSSSSSSs....',
      '...sSRSSSSSRs...',
      '...sSSSSSSSSs...',
      '...sSSSSSSSSs...',
      '...sSSSSSSSSs...',
      '...sSSSWWSSSs...',
      '....SSSSSSSS....',
      '....SSSSSSSS....',
      '....SS....SS....',
      '....SS....SS....',
      '...sss....sss...'
    ];
    drawPixelMap(g, rows, pal, 6);
    g.generateTexture(TEX.TABERNA_TABERNERO, 16 * 6, 19 * 6);
    g.destroy();
  }
  // Botella en barra
  {
    const g = makeGraphics(scene);
    g.fillStyle(0x2e5030, 1);
    g.fillRect(6, 6, 12, 28);
    g.fillStyle(0x1c3a1e, 1);
    g.fillRect(10, 0, 4, 8);
    g.fillStyle(PALETTE.blanco, 0.3);
    g.fillRect(8, 10, 2, 18);
    g.generateTexture(TEX.TABERNA_BOTELLA, 24, 36);
    g.destroy();
  }
}

export function generateCallejonProps(scene: Phaser.Scene): void {
  // Cubo de basura
  {
    const g = makeGraphics(scene);
    const pal: Record<string, number | null> = {
      '.': null,
      M: PALETTE.basuraMetal,
      m: 0x2f363a,
      O: PALETTE.basuraOxido,
      K: PALETTE.negro,
      G: PALETTE.verdeEctoSombra,
      g: PALETTE.verdeEcto
    };
    const rows: string[] = [
      '..KKKKKKKKKKKK..',
      '..MMMMMMMMMMMM..',
      '.MMMMOMMMMMMMMM.',
      '.MMMMMMMMMMOMMM.',
      '.MmmmmmmmmmmmmM.',
      '.MmMMMMMMMMMMmM.',
      '.MmMgGgMMMMMMmM.',
      '.MmMgggMMOMMMmM.',
      '.MmMMMMMMMMMMmM.',
      '.MmMMOMMMMMMMmM.',
      '.MmMMMMMMMMMMmM.',
      '.MmMMMMMMMMMMmM.',
      '.MmmmmmmmmmmmmM.',
      '.MMMMMMMMMMMMMM.',
      '.KKKKKKKKKKKKKK.'
    ];
    drawPixelMap(g, rows, pal, 8);
    g.generateTexture(TEX.CALLEJON_BASURA, 16 * 8, 15 * 8);
    g.destroy();
  }
  // Puerta amuletos (resaltador de hotspot interactivo)
  {
    const g = makeGraphics(scene);
    g.fillStyle(PALETTE.verdeEcto, 0);
    g.fillRect(0, 0, 240, 380);
    g.generateTexture(TEX.CALLEJON_PUERTA, 240, 380);
    g.destroy();
  }
  // Frasco brillando en basura (indicador visual cuando aún no se cogió)
  {
    const g = makeGraphics(scene);
    g.fillStyle(PALETTE.blanco, 0.4);
    g.fillCircle(16, 16, 14);
    g.fillStyle(PALETTE.blanco, 0.9);
    g.fillRect(11, 4, 10, 24);
    g.fillStyle(0x666666, 1);
    g.fillRect(13, 0, 6, 6);
    g.generateTexture(TEX.CALLEJON_FRASCO, 32, 32);
    g.destroy();
  }
}

// =========================================================================
// ITEMS (iconos 64x64 para UI)
// =========================================================================
export function generateItemIcons(scene: Phaser.Scene): void {
  // Frasco vacío
  {
    const g = makeGraphics(scene);
    const pal: Record<string, number | null> = {
      '.': null,
      W: PALETTE.blanco,
      G: 0xb8d4c0,
      g: 0x7a9182,
      K: PALETTE.negro,
      C: 0x555555
    };
    const rows = [
      '....KKKK....',
      '....KCCK....',
      '...KKCCKK...',
      '...KggggK...',
      '..KGWWWWGK..',
      '..KGWWWWGK..',
      '..KGWWWWGK..',
      '..KGWWWWGK..',
      '..KGWWWWGK..',
      '..KGGGGGGK..',
      '...KKKKKK...'
    ];
    drawPixelMap(g, rows, pal, 5);
    g.generateTexture(TEX.ITEM_FRASCO_VACIO, 12 * 5, 11 * 5);
    g.destroy();
  }
  // Frasco con ectoplasma
  {
    const g = makeGraphics(scene);
    const pal: Record<string, number | null> = {
      '.': null,
      W: PALETTE.blanco,
      G: 0xb8d4c0,
      E: PALETTE.verdeEcto,
      e: PALETTE.verdeEctoSombra,
      K: PALETTE.negro,
      C: 0x555555
    };
    const rows = [
      '....KKKK....',
      '....KCCK....',
      '...KKCCKK...',
      '...KeeeeK...',
      '..KGWWWWGK..',
      '..KGEeeEGK..',
      '..KGEEEEGK..',
      '..KGeEEeGK..',
      '..KGEEEEGK..',
      '..KGGGGGGK..',
      '...KKKKKK...'
    ];
    drawPixelMap(g, rows, pal, 5);
    g.generateTexture(TEX.ITEM_FRASCO_ECTOPLASMA, 12 * 5, 11 * 5);
    g.destroy();
  }
  // Formulario
  {
    const g = makeGraphics(scene);
    const pal: Record<string, number | null> = {
      '.': null,
      W: 0xe7ead5,
      K: PALETTE.negro,
      L: 0x555555
    };
    const rows = [
      'KKKKKKKKKK',
      'KWWWWWWWWK',
      'KWLLLLLLWK',
      'KWWWWWWWWK',
      'KWLLLLLLWK',
      'KWLLLLLLWK',
      'KWWWWWWWWK',
      'KWLLLLLLWK',
      'KWLLLWWWWK',
      'KWWWWWWWWK',
      'KKKKKKKKKK'
    ];
    drawPixelMap(g, rows, pal, 5);
    g.generateTexture(TEX.ITEM_FORMULARIO, 10 * 5, 11 * 5);
    g.destroy();
  }
}

// =========================================================================
// CURSORES / UI
// =========================================================================

export function generateCursors(scene: Phaser.Scene): void {
  const sizes: [string, number][] = [
    [TEX.CURSOR_NORMAL, PALETTE.blanco],
    [TEX.CURSOR_INTERACT, PALETTE.verdeEcto],
    [TEX.CURSOR_EXIT, PALETTE.amarilloLuz]
  ];
  for (const [key, color] of sizes) {
    const g = makeGraphics(scene);
    const pal: Record<string, number | null> = {
      '.': null,
      K: PALETTE.negro,
      C: color
    };
    let rows: string[];
    if (key === TEX.CURSOR_EXIT) {
      rows = [
        'KK......',
        'KCK.....',
        'KCCK....',
        'KCCCKKKK',
        'KCCCCCCK',
        'KCCCKKKK',
        'KCCK....',
        'KCK.....',
        'KK......'
      ];
    } else {
      rows = [
        'K..........',
        'KK.........',
        'KCK........',
        'KCCK.......',
        'KCCCK......',
        'KCCCCK.....',
        'KCCCCCK....',
        'KCCCCCCK...',
        'KCCCCCCCK..',
        'KCCCCKKKK..',
        'KCCK.......',
        'KCK........',
        'KK.........'
      ];
    }
    drawPixelMap(g, rows, pal, 3);
    g.generateTexture(key, rows[0].length * 3, rows.length * 3);
    g.destroy();
  }
}

export function generateDialogBox(scene: Phaser.Scene): void {
  const g = makeGraphics(scene);
  const w = 1600;
  const h = 180;
  // Sombra
  g.fillStyle(PALETTE.negro, 0.7);
  g.fillRect(4, 4, w, h);
  // Cuerpo
  g.fillStyle(0x0b0f1a, 0.92);
  g.fillRect(0, 0, w, h);
  // Marco verde fantasmal
  g.fillStyle(PALETTE.verdeEctoSombra, 1);
  g.fillRect(0, 0, w, 4);
  g.fillRect(0, h - 4, w, 4);
  g.fillRect(0, 0, 4, h);
  g.fillRect(w - 4, 0, 4, h);
  // Esquinas pixel art
  g.fillStyle(PALETTE.verdeEcto, 1);
  g.fillRect(0, 0, 12, 4);
  g.fillRect(0, 0, 4, 12);
  g.fillRect(w - 12, 0, 12, 4);
  g.fillRect(w - 4, 0, 4, 12);
  g.fillRect(0, h - 4, 12, 4);
  g.fillRect(0, h - 12, 4, 12);
  g.fillRect(w - 12, h - 4, 12, 4);
  g.fillRect(w - 4, h - 12, 4, 12);
  g.generateTexture(TEX.DIALOG_BOX, w, h);
  g.destroy();
}

export function generateInventorySlot(scene: Phaser.Scene): void {
  const g = makeGraphics(scene);
  const s = 96;
  g.fillStyle(PALETTE.negro, 0.85);
  g.fillRect(0, 0, s, s);
  g.fillStyle(PALETTE.verdeEctoSombra, 1);
  g.fillRect(0, 0, s, 3);
  g.fillRect(0, s - 3, s, 3);
  g.fillRect(0, 0, 3, s);
  g.fillRect(s - 3, 0, 3, s);
  g.fillStyle(PALETTE.verdeEcto, 1);
  g.fillRect(0, 0, 9, 3);
  g.fillRect(0, 0, 3, 9);
  g.fillRect(s - 9, 0, 9, 3);
  g.fillRect(s - 3, 0, 3, 9);
  g.fillRect(0, s - 3, 9, 3);
  g.fillRect(0, s - 9, 3, 9);
  g.fillRect(s - 9, s - 3, 9, 3);
  g.fillRect(s - 3, s - 9, 3, 9);
  g.generateTexture(TEX.INVENTORY_SLOT, s, s);
  g.destroy();
}

export function generateTitleAssets(scene: Phaser.Scene): void {
  // Fondo título: cielo nocturno + luna enorme + isla silueta
  {
    const g = makeGraphics(scene);
    const bands = 24;
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1);
      const c = lerpColor(0x050612, PALETTE.cieloNocheClaro, t * 0.8);
      g.fillStyle(c, 1);
      g.fillRect(0, (i * GAME_HEIGHT) / bands, GAME_WIDTH, GAME_HEIGHT / bands + 2);
    }
    const rng = mulberry32(42);
    g.fillStyle(PALETTE.blanco, 1);
    for (let i = 0; i < 280; i++) {
      const sx = Math.floor(rng() * GAME_WIDTH);
      const sy = Math.floor(rng() * GAME_HEIGHT * 0.85);
      const size = rng() > 0.92 ? 3 : 2;
      g.fillRect(sx, sy, size, size);
    }
    // Luna grande
    g.fillStyle(PALETTE.luna, 0.08);
    g.fillCircle(960, 380, 320);
    g.fillStyle(PALETTE.luna, 0.15);
    g.fillCircle(960, 380, 260);
    g.fillStyle(PALETTE.lunaSombra, 1);
    g.fillCircle(968, 388, 200);
    g.fillStyle(PALETTE.luna, 1);
    g.fillCircle(960, 380, 200);
    g.fillStyle(PALETTE.lunaSombra, 1);
    g.fillRect(880, 340, 30, 20);
    g.fillRect(1000, 400, 40, 26);
    g.fillRect(920, 440, 20, 14);
    // Silueta isla
    g.fillStyle(0x050612, 1);
    drawJaggedSilhouette(g, 0, 780, GAME_WIDTH, 80, 0x050612, 60);
    g.fillStyle(0x050612, 1);
    g.fillRect(0, 860, GAME_WIDTH, GAME_HEIGHT - 860);
    // Niebla en el mar
    g.fillStyle(PALETTE.nieblaA, 0.3);
    g.fillRect(0, 820, GAME_WIDTH, 60);
    g.generateTexture(TEX.TITLE_BG, GAME_WIDTH, GAME_HEIGHT);
    g.destroy();
  }
}

// =========================================================================
// Utilidades
// =========================================================================

function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lerpColor(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xff;
  const ag = (a >> 8) & 0xff;
  const ab = a & 0xff;
  const br = (b >> 16) & 0xff;
  const bg = (b >> 8) & 0xff;
  const bb = b & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const gr = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (gr << 8) | bl;
}

// Evitar "unused" warning para el tipo PixelRGBA si lo reusamos en el futuro.
export type __PixelRGBA = PixelRGBA;
