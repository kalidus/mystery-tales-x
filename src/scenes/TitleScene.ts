import * as Phaser from 'phaser';
import { DEPTH, GAME_HEIGHT, GAME_WIDTH, PALETTE, TEX } from '../config/gameConfig';
import { SCENE } from '../config/constants';
import { DIALOGUES } from '../data/dialogues';
import { AudioManager } from '../systems/AudioManager';
import { SaveSystem } from '../systems/SaveSystem';

export class TitleScene extends Phaser.Scene {
  private newGameText!: Phaser.GameObjects.Text;
  private continueText!: Phaser.GameObjects.Text;
  private musicToggleText!: Phaser.GameObjects.Text;
  private hasSave = false;

  constructor() {
    super(SCENE.TITLE);
  }

  create(): void {
    this.hasSave = SaveSystem.instance.hasSaveOnDisk();
    this.cameras.main.fadeIn(400, 0, 0, 0);
    AudioManager.instance.registerGeneratedTitleTheme();
    AudioManager.instance.playMusic('title_theme');

    // Fondo pintado (pixel art 1024x576 estirado a 1920x1080 con filtro lineal).
    this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, TEX.TITLE_BG)
      .setDepth(DEPTH.BG)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // Niebla animada inferior
    const fog1 = this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT - 200, TEX.NIEBLA)
      .setDepth(DEPTH.FOG)
      .setAlpha(0.5)
      .setScale(1.3, 1);
    this.tweens.add({
      targets: fog1,
      x: GAME_WIDTH / 2 + 200,
      duration: 18000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Título
    const title = this.add
      .text(GAME_WIDTH / 2, 220, 'MYSTERY TALES X', {
        fontFamily: 'Courier New, monospace',
        fontSize: '96px',
        color: '#eef1f4',
        stroke: '#000000',
        strokeThickness: 8
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.UI);

    // Glow verde pulsante detrás del título
    const titleGlow = this.add
      .text(GAME_WIDTH / 2, 220, 'MYSTERY TALES X', {
        fontFamily: 'Courier New, monospace',
        fontSize: '96px',
        color: '#7cff8a'
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.UI - 1)
      .setAlpha(0.3);
    this.tweens.add({
      targets: titleGlow,
      alpha: 0.1,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add
      .text(GAME_WIDTH / 2, 310, DIALOGUES.title.subtitle, {
        fontFamily: 'Courier New, monospace',
        fontSize: '28px',
        color: '#cfe9d4',
        fontStyle: 'italic'
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.UI);

    // Menú
    const menuY = GAME_HEIGHT - 340;
    const gap = 80;

    this.newGameText = this.makeMenuText(GAME_WIDTH / 2, menuY, DIALOGUES.title.newGame, () => {
      SaveSystem.instance.newGame();
      this.startGame(false);
    });

    this.continueText = this.makeMenuText(
      GAME_WIDTH / 2,
      menuY + gap,
      DIALOGUES.title.continue,
      () => {
        if (!this.hasSave) return;
        this.startGame(true);
      }
    );

    if (!this.hasSave) {
      this.continueText.setAlpha(0.3);
      this.continueText.disableInteractive();
    }

    this.musicToggleText = this.makeMenuText(
      GAME_WIDTH / 2,
      menuY + gap * 2,
      this.getMusicToggleLabel(),
      () => {
        const nextEnabled = !AudioManager.instance.isMusicEnabled();
        AudioManager.instance.setMusicEnabled(nextEnabled);
        if (nextEnabled) AudioManager.instance.playMusic('title_theme');
        this.musicToggleText.setText(this.getMusicToggleLabel());
      }
    );

    // Hint
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'v0.1 - Acto 1 demo', {
        fontFamily: 'Courier New, monospace',
        fontSize: '16px',
        color: '#4a6a54'
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.UI);

    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.hasSave) this.startGame(true);
      else {
        SaveSystem.instance.newGame();
        this.startGame(false);
      }
    });
    this.input.once('pointerdown', () => {
      if (AudioManager.instance.isMusicEnabled()) AudioManager.instance.playMusic('title_theme');
    });
    this.input.keyboard?.once('keydown', () => {
      if (AudioManager.instance.isMusicEnabled()) AudioManager.instance.playMusic('title_theme');
    });

    // Silueta de Xavier pequeña a la izquierda (pixel art real recortado).
    if (this.textures.exists(TEX.XAVIER_IDLE_1)) {
      this.add
        .image(340, GAME_HEIGHT - 240, TEX.XAVIER_IDLE_1)
        .setScale(0.42)
        .setDepth(DEPTH.UI)
        .setOrigin(0.5, 1);
    }
  }

  private makeMenuText(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const t = this.add
      .text(x, y, label, {
        fontFamily: 'Courier New, monospace',
        fontSize: '42px',
        color: '#cfe9d4',
        padding: { x: 24, y: 10 }
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.UI)
      .setInteractive({ useHandCursor: true });

    t.on('pointerover', () => {
      t.setColor('#7cff8a');
      this.tweens.add({ targets: t, scale: 1.08, duration: 120 });
    });
    t.on('pointerout', () => {
      t.setColor('#cfe9d4');
      this.tweens.add({ targets: t, scale: 1, duration: 120 });
    });
    t.on('pointerdown', () => {
      onClick();
    });
    return t;
  }

  private getMusicToggleLabel(): string {
    return AudioManager.instance.isMusicEnabled() ? 'Música: ON' : 'Música: OFF';
  }

  private startGame(fromSave: boolean): void {
    AudioManager.instance.stopMusic();
    const cam = this.cameras.main;
    cam.fadeOut(400, 0, 0, 0);
    cam.once('camerafadeoutcomplete', () => {
      const data = fromSave ? SaveSystem.instance.getData() : null;
      if (fromSave && data) {
        const key = {
          muelle: SCENE.MUELLE,
          taberna: SCENE.TABERNA,
          callejon: SCENE.CALLEJON
        }[data.roomId];
        this.scene.start(key, { fromSave: true });
      } else {
        this.scene.start(SCENE.MUELLE, {});
      }
    });
  }
}
