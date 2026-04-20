import { EVT } from '../config/constants';
import type { ItemId } from '../types/game';
import { EventBus } from './EventBus';
import { SaveSystem } from './SaveSystem';

/**
 * Estado del inventario. Fuente de verdad: SaveSystem.
 * Este sistema sólo añade lógica de selección de item para "usar con".
 */
export class InventorySystem {
  private static _instance: InventorySystem | null = null;
  static get instance(): InventorySystem {
    if (!this._instance) this._instance = new InventorySystem();
    return this._instance;
  }

  private selected: ItemId | null = null;

  private constructor() {}

  list(): ItemId[] {
    return [...SaveSystem.instance.getData().inventory];
  }

  has(item: ItemId): boolean {
    return SaveSystem.instance.hasItem(item);
  }

  add(item: ItemId): void {
    SaveSystem.instance.addItem(item);
    EventBus.emit(EVT.INVENTORY_CHANGED, this.list());
  }

  remove(item: ItemId): void {
    SaveSystem.instance.removeItem(item);
    if (this.selected === item) this.deselect();
    EventBus.emit(EVT.INVENTORY_CHANGED, this.list());
  }

  select(item: ItemId): void {
    if (!this.has(item)) return;
    this.selected = item;
    EventBus.emit(EVT.ITEM_SELECTED, item);
  }

  deselect(): void {
    if (this.selected === null) return;
    this.selected = null;
    EventBus.emit(EVT.ITEM_DESELECTED);
  }

  getSelected(): ItemId | null {
    return this.selected;
  }
}
