import * as Phaser from 'phaser';
import { SCENE } from '../config/constants';
import { DialogueBox } from '../ui/DialogueBox';
import { InventoryBar } from '../ui/InventoryBar';
import { Cursor } from '../ui/Cursor';

export class UIScene extends Phaser.Scene {
  private dialogueBox!: DialogueBox;
  private inventoryBar!: InventoryBar;
  private cursor!: Cursor;

  constructor() {
    super({ key: SCENE.UI, active: false });
  }

  create(): void {
    this.inventoryBar = new InventoryBar(this);
    this.dialogueBox = new DialogueBox(this);
    this.cursor = new Cursor(this);

    // La UI siempre queda por encima.
    this.scene.bringToTop();
  }
}
