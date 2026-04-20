import * as Phaser from 'phaser';
import { DEPTH, TEX } from '../config/gameConfig';
import { EVT } from '../config/constants';
import { EventBus } from '../systems/EventBus';
import type { CursorKind } from '../types/game';

/**
 * Cursor custom pixel art. Se mueve siguiendo al puntero en coords internas.
 * Cambia de forma según el contexto (hotspot interactivo / salida / normal).
 */
export class Cursor extends Phaser.GameObjects.Image {
  private currentKind: CursorKind = 'normal';
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, TEX.CURSOR_NORMAL);
    scene.add.existing(this);
    this.setDepth(DEPTH.CURSOR);
    this.setOrigin(0, 0);
    this.setScrollFactor(0);

    this.label = scene.add
      .text(0, 0, '', {
        fontFamily: 'Courier New, monospace',
        fontSize: '18px',
        color: '#eef1f4',
        backgroundColor: 'rgba(7,9,16,0.85)',
        padding: { x: 8, y: 4 }
      })
      .setDepth(DEPTH.CURSOR - 1)
      .setOrigin(0, 1)
      .setScrollFactor(0)
      .setVisible(false);

    scene.input.setDefaultCursor('none');
    scene.input.on('pointermove', this.onMove, this);

    EventBus.on(EVT.HOTSPOT_HOVER, this.showLabel, this);
    EventBus.on(EVT.HOTSPOT_BLUR, this.hideLabel, this);
    EventBus.on(EVT.CURSOR_SET, this.setKind, this);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(EVT.HOTSPOT_HOVER, this.showLabel, this);
      EventBus.off(EVT.HOTSPOT_BLUR, this.hideLabel, this);
      EventBus.off(EVT.CURSOR_SET, this.setKind, this);
      scene.input.setDefaultCursor('default');
    });
  }

  private onMove(pointer: Phaser.Input.Pointer): void {
    this.setPosition(pointer.worldX, pointer.worldY);
    this.label.setPosition(pointer.worldX + 24, pointer.worldY - 8);
  }

  private setKind(kind: CursorKind): void {
    if (this.currentKind === kind) return;
    this.currentKind = kind;
    const tex = {
      normal: TEX.CURSOR_NORMAL,
      interact: TEX.CURSOR_INTERACT,
      exit: TEX.CURSOR_EXIT
    }[kind];
    this.setTexture(tex);
  }

  private showLabel(text: string): void {
    this.label.setText(text);
    this.label.setVisible(true);
  }

  private hideLabel(): void {
    this.label.setVisible(false);
  }
}
