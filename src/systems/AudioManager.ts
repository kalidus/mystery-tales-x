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
  private titleThemeRegistered = false;
  private readonly musicEnabledStorageKey = 'mtx.music.enabled.v1';
  private musicEnabled = true;

  private constructor() {
    this.musicEnabled = this.readMusicEnabledFromStorage();
  }

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

  registerGeneratedTitleTheme(): void {
    if (this.titleThemeRegistered) return;
    const dataUri = this.buildTitleThemeDataUri();
    this.register('title_theme', [dataUri], { loop: true, volume: 0.32 });
    this.titleThemeRegistered = true;
  }

  playMusic(key: string): void {
    if (!this.musicEnabled) return;
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

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    this.persistMusicEnabledToStorage(enabled);
    if (!enabled) {
      this.stopMusic();
    }
  }

  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  private buildTitleThemeDataUri(): string {
    const sampleRate = 22050;
    const seconds = 10;
    const numSamples = sampleRate * seconds;
    const pcm = new Int16Array(numSamples);

    const melody: Array<{ freq: number; duration: number }> = [
      { freq: 196.0, duration: 1.0 }, // G3
      { freq: 233.08, duration: 1.0 }, // A#3
      { freq: 174.61, duration: 1.0 }, // F3
      { freq: 196.0, duration: 1.0 }, // G3
      { freq: 146.83, duration: 2.0 }, // D3
      { freq: 174.61, duration: 2.0 }, // F3
      { freq: 130.81, duration: 2.0 } // C3
    ];

    let melodyCursor = 0;
    for (const note of melody) {
      const noteSamples = Math.floor(note.duration * sampleRate);
      for (let i = 0; i < noteSamples && melodyCursor < numSamples; i++, melodyCursor++) {
        const t = melodyCursor / sampleRate;
        const progress = i / Math.max(1, noteSamples - 1);
        const envelope = Math.min(1, progress * 6) * Math.min(1, (1 - progress) * 6);
        const pad = Math.sin(2 * Math.PI * note.freq * t) * 0.42;
        const sub = Math.sin(2 * Math.PI * (note.freq / 2) * t) * 0.22;
        const noise = (Math.random() * 2 - 1) * 0.015;
        const value = (pad + sub + noise) * envelope;
        pcm[melodyCursor] = Math.max(-1, Math.min(1, value)) * 32767;
      }
    }

    // Relleno por seguridad y fade-out final para evitar clicks en el loop.
    for (let i = 0; i < numSamples; i++) {
      const fromEnd = numSamples - 1 - i;
      if (fromEnd < sampleRate * 0.15) {
        const fade = fromEnd / (sampleRate * 0.15);
        pcm[i] = Math.floor(pcm[i] * Math.max(0, fade));
      }
    }

    const wavBuffer = this.encodeWav(pcm, sampleRate);
    return `data:audio/wav;base64,${this.arrayBufferToBase64(wavBuffer)}`;
  }

  private readMusicEnabledFromStorage(): boolean {
    try {
      const raw = localStorage.getItem(this.musicEnabledStorageKey);
      if (raw === null) return true;
      return raw === '1';
    } catch {
      return true;
    }
  }

  private persistMusicEnabledToStorage(enabled: boolean): void {
    try {
      localStorage.setItem(this.musicEnabledStorageKey, enabled ? '1' : '0');
    } catch {
      // noop
    }
  }

  private encodeWav(samples: Int16Array, sampleRate: number): ArrayBuffer {
    const bytesPerSample = 2;
    const channels = 1;
    const blockAlign = channels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = samples.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset: number, text: string): void => {
      for (let i = 0; i < text.length; i++) {
        view.setUint8(offset + i, text.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (PCM)
    view.setUint16(20, 1, true); // AudioFormat (PCM)
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // BitsPerSample
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      view.setInt16(offset, samples[i], true);
      offset += 2;
    }
    return buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
  }
}
