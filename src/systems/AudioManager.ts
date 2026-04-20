import { Howl } from 'howler';

/**
 * Wrapper fino sobre Howler. En v1 sólo expone la API, sin assets reales cargados.
 * Cuando haya audio real, registrar en `register()` y llamar a `playMusic`/`playSfx`.
 */
export class AudioManager {
  private static _instance: AudioManager | null = null;
  static get instance(): AudioManager {
    if (!this._instance) this._instance = new AudioManager();
    return this._instance;
  }

  private sounds: Map<string, Howl> = new Map();
  private currentMusic: Howl | null = null;
  private currentMusicKey: string | null = null;
  private masterVolume = 1;

  private constructor() {}

  /**
   * Registra un sonido (idempotente). Sólo registra si hay src válido.
   * En v1 puede llamarse sin src para dejarlo preparado (no-op silencioso).
   */
  register(key: string, src: string[] | undefined, options?: { loop?: boolean; volume?: number }): void {
    if (this.sounds.has(key)) return;
    if (!src || src.length === 0) return;
    const howl = new Howl({
      src,
      loop: options?.loop ?? false,
      volume: options?.volume ?? 1,
      preload: true,
      html5: false
    });
    this.sounds.set(key, howl);
  }

  playMusic(key: string): void {
    if (this.currentMusicKey === key && this.currentMusic?.playing()) return;
    if (this.currentMusic) {
      this.currentMusic.stop();
    }
    const next = this.sounds.get(key);
    if (!next) {
      this.currentMusic = null;
      this.currentMusicKey = null;
      return;
    }
    next.volume(this.masterVolume);
    next.play();
    this.currentMusic = next;
    this.currentMusicKey = key;
  }

  stopMusic(): void {
    if (this.currentMusic) this.currentMusic.stop();
    this.currentMusic = null;
    this.currentMusicKey = null;
  }

  playSfx(key: string): void {
    const sfx = this.sounds.get(key);
    if (sfx) sfx.play();
  }

  setVolume(v: number): void {
    this.masterVolume = Math.max(0, Math.min(1, v));
    if (this.currentMusic) this.currentMusic.volume(this.masterVolume);
  }
}
