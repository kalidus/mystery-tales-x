import * as Phaser from 'phaser';
import { DEPTH, GAME_HEIGHT, PALETTE, TEX } from '../config/gameConfig';
import { EVT } from '../config/constants';
import { EventBus } from '../systems/EventBus';
import { InventorySystem } from '../systems/InventorySystem';
import { DialogueSystem } from '../systems/DialogueSystem';
import { ITEMS } from '../data/items';
import type { ItemId } from '../types/game';

const REG_EXPANDED = 'inventoryPanelExpanded';

/**
 * Inventario en columna vertical a la izquierda, desplegable / plegable
 * (se oculta casi del todo y deja una pestaña para volver a abrir).
 */
export class InventoryBar extends Phaser.GameObjects.Container {
  private panelRoot!: Phaser.GameObjects.Container;
  private slots: Phaser.GameObjects.Image[] = [];
  private icons: Map<string, Phaser.GameObjects.Image> = new Map();
  private label!: Phaser.GameObjects.Text;
  private bg!: Phaser.GameObjects.Rectangle;
  private selectedMarker!: Phaser.GameObjects.Rectangle;
  private foldHit!: Phaser.GameObjects.Rectangle;
  private foldGlyph!: Phaser.GameObjects.Text;

  private expanded: boolean;
  private readonly slotSize = 96;
  private readonly slotPadding = 14;
  private readonly slotsCount = 6;
  private readonly panelW = 118;
  /** Altura visible al estar plegado (solo flecha). */
  private readonly tabH = 30;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(DEPTH.UI);

    const saved = scene.registry.get(REG_EXPANDED) as boolean | undefined;
    this.expanded = saved !== false;

    this.panelRoot = scene.add.container(0, 0);
    this.add(this.panelRoot);

    this.bg = scene.add
      .rectangle(this.panelW / 2, GAME_HEIGHT / 2, this.panelW, GAME_HEIGHT, PALETTE.negro, 0.72)
      .setOrigin(0.5);
    this.panelRoot.add(this.bg);

    const border = scene.add
      .rectangle(this.panelW - 1, GAME_HEIGHT / 2, 2, GAME_HEIGHT, PALETTE.verdeEctoSombra, 1)
      .setOrigin(0.5);
    this.panelRoot.add(border);

    const headerH = 52;
    const stackH = this.slotsCount * this.slotSize + (this.slotsCount - 1) * this.slotPadding;
    const firstSlotCy = headerH + (GAME_HEIGHT - headerH - stackH) / 2 + this.slotSize / 2;
    const slotX = this.panelW / 2;

    this.label = scene.add
      .text(slotX, 18, 'Inventario', {
        fontFamily: 'Courier New, monospace',
        fontSize: '15px',
        color: '#cfe9d4',
        align: 'center',
        wordWrap: { width: this.panelW - 10 }
      })
      .setOrigin(0.5, 0);
    this.panelRoot.add(this.label);

    for (let i = 0; i < this.slotsCount; i++) {
      const y = firstSlotCy + i * (this.slotSize + this.slotPadding);
      const slot = scene.add.image(slotX, y, TEX.INVENTORY_SLOT).setDepth(DEPTH.UI);
      slot.setInteractive({ useHandCursor: false });
      slot.setData('slotIdx', i);
      slot.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        this.onSlotClick(i);
      });
      this.slots.push(slot);
      this.panelRoot.add(slot);
    }

    this.selectedMarker = scene.add
      .rectangle(slotX, firstSlotCy, this.slotSize + 10, this.slotSize + 10, 0x000000, 0)
      .setStrokeStyle(3, PALETTE.verdeEcto)
      .setVisible(false);
    this.panelRoot.add(this.selectedMarker);

    this.foldHit = scene.add
      .rectangle(this.panelW - 14, this.tabH / 2, 24, 24, 0x1a130e, 0.45)
      .setStrokeStyle(1, PALETTE.verdeEctoSombra, 0.8)
      .setOrigin(0.5);
    this.foldHit.setInteractive({ useHandCursor: true });
    this.foldHit.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.toggleFold();
    });
    this.add(this.foldHit);

    this.foldGlyph = scene.add
      .text(this.panelW - 14, this.tabH / 2, '^', {
        fontFamily: 'Courier New, monospace',
        fontSize: '20px',
        color: '#7cff8a'
      })
      .setOrigin(0.5);
    this.add(this.foldGlyph);

    this.applyFoldPosition(false);

    EventBus.on(EVT.INVENTORY_CHANGED, this.render, this);
    EventBus.on(EVT.ITEM_SELECTED, this.onItemSelected, this);
    EventBus.on(EVT.ITEM_DESELECTED, this.onItemDeselected, this);

    this.render();
  }

  private panelTargetY(): number {
    return this.expanded ? 0 : -(GAME_HEIGHT - this.tabH);
  }

  /** Posición del panel; si `animate`, tween suave. */
  private applyFoldPosition(animate: boolean): void {
    const ty = this.panelTargetY();
    this.foldGlyph.setText(this.expanded ? '^' : 'v');
    this.scene.registry.set(REG_EXPANDED, this.expanded);

    if (!animate) {
      this.panelRoot.setY(ty);
      return;
    }

    this.scene.tweens.killTweensOf(this.panelRoot);
    this.scene.tweens.add({
      targets: this.panelRoot,
      y: ty,
      duration: 240,
      ease: 'Cubic.easeInOut'
    });
  }

  private toggleFold(): void {
    if (DialogueSystem.instance.isActive) return;
    const next = !this.expanded;
    if (next === false) {
      InventorySystem.instance.deselect();
    }
    this.expanded = next;
    this.applyFoldPosition(true);
  }

  private onSlotClick(idx: number): void {
    if (!this.expanded) return;
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
    for (const [, icon] of this.icons) icon.destroy();
    this.icons.clear();

    items.forEach((item, idx) => {
      if (idx >= this.slots.length) return;
      const slot = this.slots[idx];
      const def = ITEMS[item];
      const icon = this.scene.add.image(slot.x, slot.y, def.textureKey).setDepth(DEPTH.UI + 1);
      this.icons.set(item, icon);
      this.panelRoot.add(icon);
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
