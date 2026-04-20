import { SAVE_STORAGE_KEY, SAVE_VERSION } from '../config/gameConfig';
import { EVT } from '../config/constants';
import { EventBus } from './EventBus';
import type { FlagId, ItemId, RoomId, SaveData } from '../types/game';

const DEFAULT_SAVE: SaveData = {
  version: SAVE_VERSION,
  roomId: 'muelle',
  xavier: { x: 340, y: 780 },
  inventory: [],
  flags: [],
  timestamp: 0
};

export class SaveSystem {
  private static _instance: SaveSystem | null = null;

  static get instance(): SaveSystem {
    if (!this._instance) this._instance = new SaveSystem();
    return this._instance;
  }

  private data: SaveData;

  private constructor() {
    this.data = this.loadFromStorage() ?? { ...DEFAULT_SAVE };
  }

  /** Intenta leer el save del localStorage. Devuelve null si no existe o es inválido. */
  loadFromStorage(): SaveData | null {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SaveData;
      if (!parsed || parsed.version !== SAVE_VERSION) return null;
      if (!parsed.roomId || !parsed.xavier) return null;
      return {
        version: parsed.version,
        roomId: parsed.roomId,
        xavier: { x: parsed.xavier.x ?? 340, y: parsed.xavier.y ?? 780 },
        inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
        flags: Array.isArray(parsed.flags) ? parsed.flags : [],
        timestamp: parsed.timestamp ?? 0
      };
    } catch (e) {
      console.warn('[SaveSystem] no se pudo parsear el save', e);
      return null;
    }
  }

  /** Devuelve true si hay partida guardada válida en disco. */
  hasSaveOnDisk(): boolean {
    return this.loadFromStorage() !== null;
  }

  getData(): SaveData {
    return this.data;
  }

  setRoom(roomId: RoomId, x: number, y: number): void {
    this.data.roomId = roomId;
    this.data.xavier = { x, y };
    this.persist();
  }

  updateXavierPos(x: number, y: number): void {
    this.data.xavier = { x, y };
  }

  addItem(item: ItemId): void {
    if (!this.data.inventory.includes(item)) {
      this.data.inventory.push(item);
      this.persist();
    }
  }

  removeItem(item: ItemId): void {
    this.data.inventory = this.data.inventory.filter((i) => i !== item);
    this.persist();
  }

  hasItem(item: ItemId): boolean {
    return this.data.inventory.includes(item);
  }

  setFlag(flag: FlagId): void {
    if (!this.data.flags.includes(flag)) {
      this.data.flags.push(flag);
      EventBus.emit(EVT.FLAG_SET, flag);
      this.persist();
    }
  }

  hasFlag(flag: FlagId): boolean {
    return this.data.flags.includes(flag);
  }

  /** Reinicia el save actual en memoria al estado inicial y persiste. */
  newGame(): void {
    this.data = { ...DEFAULT_SAVE, inventory: [], flags: [], timestamp: Date.now() };
    this.persist();
  }

  /** Guarda al localStorage actualizando timestamp. */
  persist(): void {
    try {
      this.data.timestamp = Date.now();
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(this.data));
      EventBus.emit(EVT.SAVE_WRITE, this.data);
    } catch (e) {
      console.warn('[SaveSystem] no se pudo persistir', e);
    }
  }

  /** Elimina el save del disco (útil para debug). */
  wipe(): void {
    try {
      localStorage.removeItem(SAVE_STORAGE_KEY);
    } catch {
      /* noop */
    }
    this.data = { ...DEFAULT_SAVE, inventory: [], flags: [] };
  }
}
