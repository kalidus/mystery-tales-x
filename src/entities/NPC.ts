import * as Phaser from 'phaser';
import { DEPTH } from '../config/gameConfig';

/**
 * Personaje no jugable. En v1 se renderiza como imagen estática con animación de
 * flotar/balanceo. Sirve como base para futuros NPCs más complejos.
 */
export class NPC extends Phaser.GameObjects.Image {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    options?: { floatAmount?: number; floatDuration?: number; fadeAlpha?: number }
  ) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    this.setDepth(DEPTH.ENTITIES - 1);

    const floatAmount = options?.floatAmount ?? 0;
    const floatDuration = options?.floatDuration ?? 2400;
    if (floatAmount > 0) {
      scene.tweens.add({
        targets: this,
        y: y - floatAmount,
        duration: floatDuration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    if (options?.fadeAlpha !== undefined) {
      scene.tweens.add({
        targets: this,
        alpha: options.fadeAlpha,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
}
