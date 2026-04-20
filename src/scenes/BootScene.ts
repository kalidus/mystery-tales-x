import * as Phaser from 'phaser';
import { SCENE } from '../config/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE.BOOT);
  }

  preload(): void {
    // No cargamos nada externo en v1 (todo es placeholder generado).
  }

  create(): void {
    this.scene.start(SCENE.PRELOAD);
  }
}
