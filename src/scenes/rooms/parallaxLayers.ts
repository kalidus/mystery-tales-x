import * as Phaser from 'phaser';
import { DEPTH } from '../../config/gameConfig';
import type { ParallaxRoomConfig } from '../../types/game';

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawVerticalSkyGradient(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  top: number,
  bottom: number
): void {
  const strips = 40;
  const cTop = Phaser.Display.Color.IntegerToColor(top);
  const cBot = Phaser.Display.Color.IntegerToColor(bottom);
  for (let i = 0; i < strips; i++) {
    const t = i / Math.max(1, strips - 1);
    const r = Phaser.Math.Linear(cTop.red, cBot.red, t);
    const gr = Phaser.Math.Linear(cTop.green, cBot.green, t);
    const b = Phaser.Math.Linear(cTop.blue, cBot.blue, t);
    g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b), 1);
    g.fillRect(x, y + (h * i) / strips, w, h / strips + 1);
  }
}

/**
 * Capas decorativas detrás del fondo pintado: cielo, estrellas y brumas lejanas
 * con distinto scrollFactor para parallax al mover la cámara.
 */
export function addRoomParallaxLayers(
  scene: Phaser.Scene,
  worldWidth: number,
  viewWidth: number,
  gameHeight: number,
  config: ParallaxRoomConfig
): void {
  const span = worldWidth + viewWidth * 2;
  const skyH = gameHeight * (config.skyHeightRatio ?? 0.78);
  const skySf = config.skyScrollFactor ?? 0.07;

  const sky = scene.add.graphics().setDepth(DEPTH.BG_PARALLAX_SKY).setScrollFactor(skySf, 0);
  drawVerticalSkyGradient(sky, -viewWidth, 0, span, skyH, config.skyTop, config.skyBottom);

  if (config.stars) {
    const { count, scrollFactor, y, height, seed } = config.stars;
    const rng = mulberry32(seed);
    const rw = Math.ceil(Math.min(4096, span));
    const rh = Math.ceil(Math.max(80, height));
    const gStars = new Phaser.GameObjects.Graphics(scene);
    for (let i = 0; i < count; i++) {
      const sx = rng() * rw;
      const sy = rng() * rh;
      const a = 0.15 + rng() * 0.85;
      const s = rng() < 0.12 ? 2 : 1;
      const tint = rng() < 0.08 ? 0xb8e8ff : 0xffffff;
      gStars.fillStyle(tint, a);
      gStars.fillRect(sx, sy, s, s);
    }
    const cx = worldWidth / 2;
    const rt = scene.add.renderTexture(cx, y, rw, rh).setDepth(DEPTH.BG_PARALLAX_STARS).setScrollFactor(scrollFactor, 0);
    rt.setOrigin(0.5, 0.5);
    rt.draw(gStars, 0, 0);
    gStars.destroy();
    if (scene.textures.exists(rt.texture.key)) {
      scene.textures.get(rt.texture.key).setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
  }

  if (config.distantBand) {
    const b = config.distantBand;
    const band = scene.add.graphics().setDepth(DEPTH.BG_PARALLAX_DISTANT).setScrollFactor(b.scrollFactor, 0);
    band.fillStyle(b.color, b.alpha);
    band.fillRect(-viewWidth, b.y, span, b.height);
  }

  if (config.ambientHaze) {
    const h = config.ambientHaze;
    const haze = scene.add.graphics().setDepth(DEPTH.BG_PARALLAX_HAZE).setScrollFactor(h.scrollFactor, 0);
    haze.fillStyle(h.color, h.alpha);
    haze.fillRect(-viewWidth, h.y, span, h.height);
  }
}
