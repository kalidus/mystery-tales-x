import * as Phaser from 'phaser';
import { BaseRoomScene } from './BaseRoomScene';
import { DEPTH, TEX } from '../../config/gameConfig';
import { SCENE } from '../../config/constants';
import { DIALOGUES } from '../../data/dialogues';
import { DialogueSystem } from '../../systems/DialogueSystem';
import { InventorySystem } from '../../systems/InventorySystem';
import type { RoomId } from '../../types/game';

export class CallejonScene extends BaseRoomScene {
  readonly roomId: RoomId = 'callejon';

  constructor() {
    super(SCENE.CALLEJON);
  }

  protected decorateBackground(): void {
    // El fondo pintado ya incluye la basura y los amuletos.
    // Sólo añadimos un "brillito" animado sobre el frasco si aún no se recogió,
    // para indicar visualmente la interacción disponible.
    if (!InventorySystem.instance.has('frasco_vacio')) {
      const brillo = this.add
        .image(this.scaleRoomX(440), 870, TEX.CALLEJON_FRASCO)
        .setDepth(DEPTH.BG_PROPS + 1)
        .setAlpha(0.9)
        .setScale(1.6);
      this.tweens.add({
        targets: brillo,
        alpha: 0.25,
        scale: 2,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  protected override onFirstEnter(): void {
    if (!InventorySystem.instance.has('frasco_vacio')) {
      this.time.delayedCall(300, async () => {
        await DialogueSystem.instance.say(DIALOGUES.callejon.intro);
      });
    }
  }
}
