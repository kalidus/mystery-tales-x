import * as Phaser from 'phaser';
import { DEPTH, GAME_HEIGHT, GAME_WIDTH, PALETTE, TEX } from '../config/gameConfig';
import { EVT } from '../config/constants';
import { EventBus } from '../systems/EventBus';
import { InventorySystem } from '../systems/InventorySystem';
import { DialogueSystem } from '../systems/DialogueSystem';
import { ITEMS } from '../data/items';
import type { ItemId } from '../types/game';

export class InventoryBar extends Phaser.GameObjects.Container {
  private slots: Phaser.GameObjects.Image[] = [];
  private icons: Map<string, Phaser.GameObjects.Image> = new Map();
  private label: Phaser.GameObjects.Text;
  private bg: Phaser.GameObjects.Rectangle;
  private selectedMarker: Phaser.GameObjects.Rectangle;
  private slotSize = 96;
  private slotPadding = 16;
  private slotsCount = 6;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, GAME_HEIGHT - 110);
    scene.add.existing(this);
    this.setDepth(DEPTH.UI);

    this.bg = scene.add
      .rectangle(GAME_WIDTH / 2, 55, GAME_WIDTH, 110, PALETTE.negro, 0.6)
      .setOrigin(0.5);
    this.add(this.bg);

    // Borde verde superior
    const border = scene.add.rectangle(GAME_WIDTH / 2, 2, GAME_WIDTH, 2, PALETTE.verdeEctoSombra, 1);
    border.setOrigin(0.5, 0);
    this.add(border);

    const totalW = this.slotsCount * this.slotSize + (this.slotsCount - 1) * this.slotPadding;
    const startX = GAME_WIDTH / 2 - totalW / 2 + this.slotSize / 2;
    for (let i = 0; i < this.slotsCount; i++) {
      const x = startX + i * (this.slotSize + this.slotPadding);
      const slot = scene.add.image(x, 55, TEX.INVENTORY_SLOT).setDepth(DEPTH.UI);
      slot.setInteractive({ useHandCursor: false });
      slot.setData('slotIdx', i);
      slot.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        this.onSlotClick(i);
      });
      this.slots.push(slot);
      this.add(slot);
    }

    this.label = scene.add
      .text(GAME_WIDTH / 2, 105, '', {
        fontFamily: 'Courier New, monospace',
        fontSize: '18px',
        color: '#cfe9d4'
      })
      .setOrigin(0.5, 1);
    this.add(this.label);

    this.selectedMarker = scene.add
      .rectangle(0, 55, this.slotSize + 10, this.slotSize + 10, 0x000000, 0)
      .setStrokeStyle(3, PALETTE.verdeEcto)
      .setVisible(false);
    this.add(this.selectedMarker);

    EventBus.on(EVT.INVENTORY_CHANGED, this.render, this);
    EventBus.on(EVT.ITEM_SELECTED, this.onItemSelected, this);
    EventBus.on(EVT.ITEM_DESELECTED, this.onItemDeselected, this);

    this.render();
  }

  private onSlotClick(idx: number): void {
    if (DialogueSystem.instance.isActive) return;
    const items = InventorySystem.instance.list();
    const item = items[idx];
    if (!item) {
      InventorySystem.instance.deselect();
      return;
    }
    if (InventorySystem.instance.getSelected() === item) {
      InventorySystem.instance.deselect();
    } else {
      InventorySystem.instance.select(item);
    }
  }

  private onItemSelected(item: ItemId): void {
    const items = InventorySystem.instance.list();
    const idx = items.indexOf(item);
    if (idx < 0) return;
    const slot = this.slots[idx];
    this.selectedMarker.setPosition(slot.x, slot.y);
    this.selectedMarker.setVisible(true);
    const def = ITEMS[item];
    this.label.setText(`Usar ${def.name} con...`);
  }

  private onItemDeselected(): void {
    this.selectedMarker.setVisible(false);
    this.updateLabel();
  }

  private updateLabel(hoverText?: string): void {
    if (hoverText) {
      this.label.setText(hoverText);
    } else {
      this.label.setText('Inventario');
    }
  }

  private render(): void {
    const items = InventorySystem.instance.list();
    for (const [key, icon] of this.icons) icon.destroy();
    this.icons.clear();

    items.forEach((item, idx) => {
      if (idx >= this.slots.length) return;
      const slot = this.slots[idx];
      const def = ITEMS[item];
      const icon = this.scene.add.image(slot.x, slot.y, def.textureKey).setDepth(DEPTH.UI + 1);
      this.icons.set(item, icon);
      this.add(icon);
      icon.setInteractive({ useHandCursor: false });
      icon.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        this.onSlotClick(idx);
      });
      icon.on('pointerover', () => {
        this.updateLabel(def.name);
      });
      icon.on('pointerout', () => {
        this.updateLabel();
      });
    });

    this.updateLabel();
  }
}
