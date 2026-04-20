import { EVT } from '../config/constants';
import { EventBus } from './EventBus';

/**
 * Gestiona la cola de líneas de diálogo.
 * El `DialogueBox` (UI) escucha los eventos y renderiza.
 */
export class DialogueSystem {
  private static _instance: DialogueSystem | null = null;
  static get instance(): DialogueSystem {
    if (!this._instance) this._instance = new DialogueSystem();
    return this._instance;
  }

  private queue: string[] = [];
  private currentLine: string | null = null;
  private onDone: (() => void) | null = null;
  private _isActive = false;

  private constructor() {
    EventBus.on(EVT.DIALOGUE_ADVANCE, this.advance, this);
  }

  get isActive(): boolean {
    return this._isActive;
  }

  /**
   * Muestra las líneas secuencialmente. Resuelve la promesa al terminar.
   */
  say(lines: string[]): Promise<void> {
    return new Promise((resolve) => {
      if (!lines || lines.length === 0) {
        resolve();
        return;
      }
      this.queue = [...lines];
      this._isActive = true;
      this.onDone = resolve;
      EventBus.emit(EVT.DIALOGUE_START);
      this.nextLine();
    });
  }

  private nextLine(): void {
    const next = this.queue.shift();
    if (!next) {
      this.finish();
      return;
    }
    this.currentLine = next;
    EventBus.emit('dialogue:line', next);
  }

  private advance(): void {
    if (!this._isActive) return;
    if (this.queue.length === 0) {
      this.finish();
    } else {
      this.nextLine();
    }
  }

  private finish(): void {
    this._isActive = false;
    this.currentLine = null;
    EventBus.emit(EVT.DIALOGUE_END);
    const cb = this.onDone;
    this.onDone = null;
    if (cb) cb();
  }
}
