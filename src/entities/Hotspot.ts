import * as Phaser from 'phaser';
import { DEPTH, PALETTE } from '../config/gameConfig';
import type { HotspotDef } from '../types/game';

/**
 * Zona rectangular interactiva. Invisible por defecto (puede mostrarse un recuadro
 * en modo debug). Emite eventos de hover/click usando Phaser.
 */
export class Hotspot extends Phaser.GameObjects.Rectangle {
  readonly def: HotspotDef;
  private debugOutline: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, def: HotspotDef) {
    const cx = def.x + def.width / 2;
    const cy = def.y + def.height / 2;
    super(scene, cx, cy, def.width, def.height, 0x000000, 0);
    scene.add.existing(this);
    this.def = def;
    this.setDepth(DEPTH.BG_PROPS + 5);
    this.setInteractive({ useHandCursor: false });
  }

  setDebug(enabled: boolean): void {
    if (enabled && !this.debugOutline) {
      this.debugOutline = this.scene.add.graphics().setDepth(DEPTH.FG_PROPS);
      this.debugOutline.lineStyle(2, PALETTE.verdeEcto, 0.6);
      this.debugOutline.strokeRect(this.def.x, this.def.y, this.def.width, this.def.height);
    } else if (!enabled && this.debugOutline) {
      this.debugOutline.destroy();
      this.debugOutline = null;
    }
  }

  override destroy(fromScene?: boolean): void {
    if (this.debugOutline) this.debugOutline.destroy();
    super.destroy(fromScene);
  }
}
