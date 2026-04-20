import * as Phaser from 'phaser';
import { ANIM, DEPTH, TEX, XAVIER_WALK_SPEED } from '../config/gameConfig';

export type XavierState = 'idle' | 'walk' | 'talk' | 'grab';

/**
 * Xavier - protagonista. Se dibuja a partir de 10 frames PNG pixel-art
 * (idle x2, walk x4, talk x2, reach + grab). Todas las texturas comparten
 * canvas unificado (ver chromaKeyBatchUnifiedCrop) por lo que origin (0.5, 1)
 * siempre apunta al mismo pixel del personaje y no hay jitter al animar.
 */
export class Xavier extends Phaser.GameObjects.Sprite {
  private currentState: XavierState = 'idle';
  private walkTween: Phaser.Tweens.Tween | null = null;
  private onArriveCb: (() => void) | null = null;
  private baseScale = 0.5;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEX.XAVIER_IDLE_1);
    scene.add.existing(this);

    this.setOrigin(0.5, 1);
    this.setDepth(DEPTH.ENTITIES);

    this.baseScale = (scene.registry.get('xavierScale') as number) ?? 0.5;
    this.applyBaseScale();

    this.applyState('idle');
  }

  private applyState(state: XavierState): void {
    this.currentState = state;
    this.anims.stop();

    switch (state) {
      case 'idle':
        this.play(ANIM.XAVIER_IDLE, true);
        break;
      case 'walk':
        this.play(ANIM.XAVIER_WALK, true);
        break;
      case 'talk':
        this.play(ANIM.XAVIER_TALK, true);
        break;
      case 'grab':
        this.play(ANIM.XAVIER_GRAB, true);
        break;
    }

    this.applyBaseScale();
  }

  private applyBaseScale(): void {
    const sx = this.scaleX < 0 ? -this.baseScale : this.baseScale;
    this.setScale(sx, this.baseScale);
  }

  walkTo(tx: number, ty: number, cb?: () => void): void {
    this.cancelWalk();
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 4) {
      this.setFaceFromDx(dx);
      if (cb) cb();
      return;
    }

    this.setFaceFromDx(dx);
    this.setAnimState('walk');

    const duration = Math.max(100, (dist / XAVIER_WALK_SPEED) * 1000);
    this.onArriveCb = cb ?? null;
    this.walkTween = this.scene.tweens.add({
      targets: this,
      x: tx,
      y: ty,
      duration,
      ease: 'Linear',
      onComplete: () => {
        this.walkTween = null;
        this.setAnimState('idle');
        const cb2 = this.onArriveCb;
        this.onArriveCb = null;
        if (cb2) cb2();
      }
    });
  }

  cancelWalk(): void {
    if (this.walkTween) {
      this.walkTween.stop();
      this.walkTween = null;
    }
    this.onArriveCb = null;
  }

  isWalking(): boolean {
    return this.walkTween !== null;
  }

  walkToAsync(tx: number, ty: number): Promise<void> {
    return new Promise((resolve) => this.walkTo(tx, ty, resolve));
  }

  setAnimState(state: XavierState): void {
    if (state === this.currentState) return;
    this.applyState(state);
  }

  getAnimState(): XavierState {
    return this.currentState;
  }

  faceLeft(): void {
    this.setScale(-this.baseScale, this.baseScale);
  }

  faceRight(): void {
    this.setScale(this.baseScale, this.baseScale);
  }

  private setFaceFromDx(dx: number): void {
    if (dx < -2) this.faceLeft();
    else if (dx > 2) this.faceRight();
  }

  async performGrab(): Promise<void> {
    this.setAnimState('grab');
    return new Promise((resolve) => {
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        if (this.currentState === 'grab') this.setAnimState('idle');
        resolve();
      });
    });
  }
}
