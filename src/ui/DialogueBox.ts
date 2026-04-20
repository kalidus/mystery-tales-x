import * as Phaser from 'phaser';
import {
  DEPTH,
  DIALOGUE_CHARS_PER_SECOND,
  GAME_HEIGHT,
  GAME_WIDTH,
  TEX
} from '../config/gameConfig';
import { EVT } from '../config/constants';
import { EventBus } from '../systems/EventBus';

export class DialogueBox extends Phaser.GameObjects.Container {
  private box: Phaser.GameObjects.Image;
  private text: Phaser.GameObjects.Text;
  private hint: Phaser.GameObjects.Text;
  private fullLine = '';
  private currentIdx = 0;
  private typing = false;
  private typeTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene) {
    super(scene, GAME_WIDTH / 2, GAME_HEIGHT - 230);
    scene.add.existing(this);
    this.setDepth(DEPTH.UI);

    this.box = scene.add.image(0, 0, TEX.DIALOG_BOX).setOrigin(0.5);
    this.add(this.box);

    this.text = scene.add
      .text(-780, -60, '', {
        fontFamily: 'Courier New, monospace',
        fontSize: '28px',
        color: '#eef1f4',
        wordWrap: { width: 1560 },
        lineSpacing: 6
      })
      .setOrigin(0, 0)
      .setShadow(2, 2, '#000000', 0, true, true);
    this.add(this.text);

    this.hint = scene.add
      .text(770, 65, '▼ clic / space', {
        fontFamily: 'Courier New, monospace',
        fontSize: '16px',
        color: '#7cff8a'
      })
      .setOrigin(1, 0.5);
    this.hint.setAlpha(0);
    this.add(this.hint);

    this.setVisible(false);

    EventBus.on(EVT.DIALOGUE_START, this.onStart, this);
    EventBus.on(EVT.DIALOGUE_END, this.onEnd, this);
    EventBus.on('dialogue:line', this.onLine, this);

    scene.input.keyboard?.on('keydown-SPACE', this.advance, this);
    scene.input.keyboard?.on('keydown-ENTER', this.advance, this);
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.visible) {
        pointer.event.stopPropagation();
        this.advance();
      }
    });

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(EVT.DIALOGUE_START, this.onStart, this);
      EventBus.off(EVT.DIALOGUE_END, this.onEnd, this);
      EventBus.off('dialogue:line', this.onLine, this);
    });
  }

  private onStart(): void {
    this.setVisible(true);
    this.text.setText('');
    this.fullLine = '';
    this.currentIdx = 0;
  }

  private onEnd(): void {
    this.setVisible(false);
    this.stopTyping();
    this.text.setText('');
    this.hint.setAlpha(0);
  }

  private onLine(line: string): void {
    this.fullLine = line;
    this.currentIdx = 0;
    this.text.setText('');
    this.hint.setAlpha(0);
    this.startTyping();
  }

  private startTyping(): void {
    this.stopTyping();
    this.typing = true;
    const intervalMs = Math.max(12, Math.floor(1000 / DIALOGUE_CHARS_PER_SECOND));
    this.typeTimer = this.scene.time.addEvent({
      delay: intervalMs,
      loop: true,
      callback: () => {
        if (this.currentIdx >= this.fullLine.length) {
          this.finishLine();
          return;
        }
        this.currentIdx++;
        this.text.setText(this.fullLine.substring(0, this.currentIdx));
      }
    });
  }

  private stopTyping(): void {
    if (this.typeTimer) {
      this.typeTimer.remove(false);
      this.typeTimer = null;
    }
    this.typing = false;
  }

  private finishLine(): void {
    this.stopTyping();
    this.text.setText(this.fullLine);
    this.scene.tweens.add({
      targets: this.hint,
      alpha: 1,
      duration: 200
    });
  }

  private advance(): void {
    if (!this.visible) return;
    if (this.typing) {
      // Salta al final de la línea actual.
      this.currentIdx = this.fullLine.length;
      this.text.setText(this.fullLine);
      this.finishLine();
      return;
    }
    EventBus.emit(EVT.DIALOGUE_ADVANCE);
  }
}
