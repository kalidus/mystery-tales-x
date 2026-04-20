import * as Phaser from 'phaser';
import { BaseRoomScene } from './BaseRoomScene';
import { DEPTH, TEX } from '../../config/gameConfig';
import { SCENE } from '../../config/constants';
import { DIALOGUES } from '../../data/dialogues';
import { DialogueSystem } from '../../systems/DialogueSystem';
import { SaveSystem } from '../../systems/SaveSystem';
import type { RoomId } from '../../types/game';

export class TabernaScene extends BaseRoomScene {
  readonly roomId: RoomId = 'taberna';

  constructor() {
    super(SCENE.TABERNA);
  }

  protected decorateBackground(): void {
    // Tabernero zombi detrás de la barra. Si tenemos la imagen pixel-art
    // generada la usamos; si no, caemos al placeholder procedural.
    const hasImg = this.textures.exists(TEX.TABERNA_TABERNERO_IMG);
    const tabKey = hasImg ? TEX.TABERNA_TABERNERO_IMG : TEX.TABERNA_TABERNERO;
    const baseScale = hasImg ? (this.registry.get(`${TEX.TABERNA_TABERNERO_IMG}_scale`) as number ?? 0.5) : 1;
    const tab = this.add
      .image(990, 720, tabKey)
      .setOrigin(0.5, 1)
      .setScale(baseScale)
      .setDepth(DEPTH.ENTITIES - 1);
    this.tweens.add({
      targets: tab,
      y: 717,
      duration: 3500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Titileo suave del halo de la lámpara existente en el fondo.
    const lamp = this.add.graphics().setDepth(DEPTH.FOG);
    lamp.fillStyle(0xf9e58c, 0.1);
    lamp.fillCircle(512, 280, 180);
    this.tweens.add({
      targets: lamp,
      alpha: 0.6,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  protected override onFirstEnter(): void {
    if (!SaveSystem.instance.hasFlag('hablado_tabernero')) {
      this.time.delayedCall(300, async () => {
        await DialogueSystem.instance.say(DIALOGUES.taberna.intro);
      });
    }
  }
}
