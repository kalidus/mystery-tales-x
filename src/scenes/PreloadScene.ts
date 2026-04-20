import * as Phaser from 'phaser';
import { ANIM, GAME_HEIGHT, GAME_WIDTH, PALETTE, TEX } from '../config/gameConfig';
import { SCENE } from '../config/constants';
import {
  generateCallejonProps,
  generateCursors,
  generateDialogBox,
  generateInventorySlot,
  generateItemIcons,
  generateMuelleProps,
  generateTabernaProps
} from '../utils/placeholderArt';
import { chromaKeyBatchUnifiedCrop, chromaKeySolidColor } from '../utils/spriteCrop';

const BG_ASSET_KEYS: Array<{ key: string; path: string }> = [
  { key: TEX.BG_MUELLE, path: 'assets/bg_muelle.png' },
  { key: TEX.BG_TABERNA, path: 'assets/bg_taberna.png' },
  { key: TEX.BG_CALLEJON, path: 'assets/bg_callejon.png' },
  { key: TEX.TITLE_BG, path: 'assets/bg_title.png' }
];

/**
 * Xavier: 10 frames pixel-art con fondo magenta solido #FF00FF.
 * Se cargan todos y se recortan a un ÚNICO bbox unificado (chromaKeyBatchUnifiedCrop)
 * para garantizar que todos los frames tengan el mismo ancho/alto y el personaje
 * este en las mismas coordenadas de pixel. Esto elimina los "saltos" al animar.
 */
const XAVIER_FRAMES: Array<{ rawKey: string; cropKey: string; path: string }> = [
  { rawKey: TEX.XAVIER_IDLE_1_RAW, cropKey: TEX.XAVIER_IDLE_1, path: 'assets/xavier/xavier_idle_1.png' },
  { rawKey: TEX.XAVIER_IDLE_2_RAW, cropKey: TEX.XAVIER_IDLE_2, path: 'assets/xavier/xavier_idle_2.png' },
  { rawKey: TEX.XAVIER_WALK_1_RAW, cropKey: TEX.XAVIER_WALK_1, path: 'assets/xavier/xavier_walk_1.png' },
  { rawKey: TEX.XAVIER_WALK_2_RAW, cropKey: TEX.XAVIER_WALK_2, path: 'assets/xavier/xavier_walk_2.png' },
  { rawKey: TEX.XAVIER_WALK_3_RAW, cropKey: TEX.XAVIER_WALK_3, path: 'assets/xavier/xavier_walk_3.png' },
  { rawKey: TEX.XAVIER_WALK_4_RAW, cropKey: TEX.XAVIER_WALK_4, path: 'assets/xavier/xavier_walk_4.png' },
  { rawKey: TEX.XAVIER_TALK_1_RAW, cropKey: TEX.XAVIER_TALK_1, path: 'assets/xavier/xavier_talk_1.png' },
  { rawKey: TEX.XAVIER_TALK_2_RAW, cropKey: TEX.XAVIER_TALK_2, path: 'assets/xavier/xavier_talk_2.png' },
  { rawKey: TEX.XAVIER_REACH_RAW, cropKey: TEX.XAVIER_REACH, path: 'assets/xavier/xavier_reach.png' },
  { rawKey: TEX.XAVIER_GRAB_RAW, cropKey: TEX.XAVIER_GRAB, path: 'assets/xavier/xavier_grab.png' }
];

/**
 * NPCs cargados desde imagen con fondo MAGENTA solido -> chromakey trivial.
 */
const NPC_MAGENTA_FRAMES: Array<{ rawKey: string; cropKey: string; path: string }> = [
  { rawKey: TEX.MUELLE_GUARDIAN_IMG_RAW, cropKey: TEX.MUELLE_GUARDIAN_IMG, path: 'assets/guardian_idle.png' },
  { rawKey: TEX.TABERNA_TABERNERO_IMG_RAW, cropKey: TEX.TABERNA_TABERNERO_IMG, path: 'assets/tabernero_idle.png' }
];

/** Altura visual objetivo (en pixeles de juego) del canvas unificado de Xavier. */
const XAVIER_TARGET_HEIGHT = 520;

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENE.PRELOAD);
  }

  preload(): void {
    const barW = 600;
    const barH = 20;
    const barX = GAME_WIDTH / 2 - barW / 2;
    const barY = GAME_HEIGHT / 2;

    const border = this.add.rectangle(GAME_WIDTH / 2, barY + barH / 2, barW + 8, barH + 8, 0x000000, 0);
    border.setStrokeStyle(2, PALETTE.verdeEcto);
    const bar = this.add.rectangle(barX, barY, 1, barH, PALETTE.verdeEcto).setOrigin(0, 0);
    this.add
      .text(GAME_WIDTH / 2, barY - 60, 'MYSTERY TALES X', {
        fontFamily: 'Courier New, monospace',
        fontSize: '48px',
        color: '#7cff8a'
      })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, barY - 10, 'Invocando Isla Bruma...', {
        fontFamily: 'Courier New, monospace',
        fontSize: '22px',
        color: '#cfe9d4'
      })
      .setOrigin(0.5);

    this.data.set('__bar', bar);
    this.data.set('__barMaxW', barW);

    for (const { key, path } of BG_ASSET_KEYS) {
      this.load.image(key, path);
    }
    for (const { rawKey, path } of XAVIER_FRAMES) {
      this.load.image(rawKey, path);
    }
    for (const { rawKey, path } of NPC_MAGENTA_FRAMES) {
      this.load.image(rawKey, path);
    }

    this.load.on('progress', (p: number) => {
      bar.width = Math.max(1, p * 0.35 * barW);
    });
  }

  create(): void {
    const bar = this.data.get('__bar') as Phaser.GameObjects.Rectangle;
    const maxW = this.data.get('__barMaxW') as number;

    for (const { key } of BG_ASSET_KEYS) {
      if (this.textures.exists(key)) {
        this.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
    }

    const steps: Array<[string, () => void]> = [
      ['Recortando personaje', () => {
        // Batch-chromakey: los 10 frames comparten bbox unificado -> mismo canvas,
        // mismas coordenadas de pixel, caminata sin jitter.
        chromaKeyBatchUnifiedCrop(this, XAVIER_FRAMES, 255, 0, 255, {
          tolerance: 110,
          padding: 2
        });
        for (const { cropKey } of XAVIER_FRAMES) {
          if (this.textures.exists(cropKey)) {
            // NEAREST evita halos al re-muestrear bordes.
            this.textures.get(cropKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
          }
        }
      }],
      ['Recortando NPCs', () => {
        const targets: Record<string, number> = {
          [TEX.MUELLE_GUARDIAN_IMG]: 480,
          [TEX.TABERNA_TABERNERO_IMG]: 380
        };
        for (const { rawKey, cropKey } of NPC_MAGENTA_FRAMES) {
          const { height } = chromaKeySolidColor(this, rawKey, cropKey, 255, 0, 255, {
            tolerance: 110,
            padding: 2
          });
          if (this.textures.exists(cropKey)) {
            this.textures.get(cropKey).setFilter(Phaser.Textures.FilterMode.LINEAR);
          }
          const target = targets[cropKey] ?? 360;
          const s = height > 0 ? target / height : 0.5;
          this.registry.set(`${cropKey}_scale`, s);
        }
      }],
      ['Props muelle', () => generateMuelleProps(this)],
      ['Props taberna', () => generateTabernaProps(this)],
      ['Props callejón', () => generateCallejonProps(this)],
      ['Items', () => generateItemIcons(this)],
      ['Cursores', () => generateCursors(this)],
      ['UI', () => {
        generateDialogBox(this);
        generateInventorySlot(this);
      }]
    ];

    let i = 0;
    const runNext = () => {
      if (i >= steps.length) {
        this.registerXavierAnimations();
        bar.width = maxW;
        this.time.delayedCall(180, () => {
          this.scene.start(SCENE.TITLE);
        });
        return;
      }
      const [, fn] = steps[i];
      fn();
      i++;
      const ratio = 0.35 + (i / steps.length) * 0.65;
      bar.width = Math.max(1, ratio * maxW);
      this.time.delayedCall(16, runNext);
    };
    runNext();
  }

  private registerXavierAnimations(): void {
    // Todos los frames de Xavier comparten canvas unificado: escala calculada
    // una sola vez sobre el frame IDLE (equivalente a todos los demas).
    const idleTex = this.textures.get(TEX.XAVIER_IDLE_1);
    const idleImg = idleTex?.getSourceImage() as HTMLImageElement | HTMLCanvasElement | undefined;
    const idleH = idleImg?.height ?? 0;
    const baseScale = idleH > 0 ? XAVIER_TARGET_HEIGHT / idleH : 0.5;
    this.registry.set('xavierScale', baseScale);

    if (!this.anims.exists(ANIM.XAVIER_IDLE)) {
      this.anims.create({
        key: ANIM.XAVIER_IDLE,
        frames: [
          { key: TEX.XAVIER_IDLE_1 },
          { key: TEX.XAVIER_IDLE_2 }
        ],
        frameRate: 1.8,
        repeat: -1
      });
    }

    if (!this.anims.exists(ANIM.XAVIER_WALK)) {
      this.anims.create({
        key: ANIM.XAVIER_WALK,
        frames: [
          { key: TEX.XAVIER_WALK_1 },
          { key: TEX.XAVIER_WALK_2 },
          { key: TEX.XAVIER_WALK_3 },
          { key: TEX.XAVIER_WALK_4 }
        ],
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.anims.exists(ANIM.XAVIER_TALK)) {
      this.anims.create({
        key: ANIM.XAVIER_TALK,
        frames: [
          { key: TEX.XAVIER_TALK_1 },
          { key: TEX.XAVIER_TALK_2 }
        ],
        frameRate: 6,
        repeat: -1
      });
    }

    if (!this.anims.exists(ANIM.XAVIER_GRAB)) {
      this.anims.create({
        key: ANIM.XAVIER_GRAB,
        frames: [
          { key: TEX.XAVIER_REACH, duration: 180 },
          { key: TEX.XAVIER_GRAB, duration: 320 }
        ],
        repeat: 0
      });
    }
  }
}
