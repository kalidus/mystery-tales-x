import * as Phaser from 'phaser';
import { BaseRoomScene } from './BaseRoomScene';
import { DEPTH, GAME_HEIGHT, GAME_WIDTH, PALETTE, TEX } from '../../config/gameConfig';
import { SCENE } from '../../config/constants';
import { DIALOGUES } from '../../data/dialogues';
import { DialogueSystem } from '../../systems/DialogueSystem';
import { SaveSystem } from '../../systems/SaveSystem';
import type { RoomId } from '../../types/game';

export class MuelleScene extends BaseRoomScene {
  readonly roomId: RoomId = 'muelle';

  private ectoplasma: Phaser.GameObjects.Image | null = null;

  constructor() {
    super(SCENE.MUELLE);
  }

  protected decorateBackground(): void {
    // Ectoplasma (estado dependiente de flags). Se coloca sobre el muelle pintado.
    if (!SaveSystem.instance.hasFlag('ectoplasma_recogido')) {
      this.ectoplasma = this.add
        .image(950, 1005, TEX.MUELLE_ECTOPLASMA)
        .setDepth(DEPTH.BG_PROPS)
        .setScale(1.1);
      this.tweens.add({
        targets: this.ectoplasma,
        scaleY: 0.95,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.tweens.add({
        targets: this.ectoplasma,
        alpha: 0.85,
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      this.add.image(950, 1005, TEX.MUELLE_ECTOPLASMA_VACIO).setDepth(DEPTH.BG_PROPS);
    }

    // Guardián espectral (requerido por la historia). Usa la imagen pixel-art
    // generada y ya pasada por chroma-key si está disponible; si no, cae al
    // placeholder procedural.
    const hasImg = this.textures.exists(TEX.MUELLE_GUARDIAN_IMG);
    const guardianKey = hasImg ? TEX.MUELLE_GUARDIAN_IMG : TEX.MUELLE_GUARDIAN;
    const baseScale = hasImg ? (this.registry.get(`${TEX.MUELLE_GUARDIAN_IMG}_scale`) as number ?? 0.5) : 1;
    const guardianAlpha = SaveSystem.instance.hasFlag('visto_guardian') ? 0.65 : 0.92;
    const guardian = this.add
      .image(1430, 930, guardianKey)
      .setOrigin(0.5, 1)
      .setScale(baseScale)
      .setDepth(DEPTH.ENTITIES - 1)
      .setAlpha(guardianAlpha);
    this.tweens.add({
      targets: guardian,
      y: 915,
      duration: 2400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    this.tweens.add({
      targets: guardian,
      alpha: guardianAlpha * 0.72,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Capa extra de niebla animada (por encima del bg pintado) para dar vida.
    const fog = this.add
      .image(GAME_WIDTH / 2, 680, TEX.NIEBLA)
      .setDepth(DEPTH.FOG)
      .setAlpha(0.35)
      .setScale(1.4, 1);
    this.tweens.add({
      targets: fog,
      x: GAME_WIDTH / 2 + 220,
      duration: 22000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Viñeta verde muy sutil.
    const vignette = this.add.graphics().setDepth(DEPTH.FOG + 1);
    vignette.fillStyle(PALETTE.verdeEctoSombra, 0.05);
    vignette.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  protected override onFirstEnter(): void {
    const save = SaveSystem.instance.getData();
    const isFresh = save.inventory.length === 0 && save.flags.length === 0;
    if (isFresh) {
      this.time.delayedCall(500, async () => {
        await DialogueSystem.instance.say(DIALOGUES.muelle.intro);
      });
    }
  }
}
