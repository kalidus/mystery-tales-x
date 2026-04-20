import * as Phaser from 'phaser';
import { GAME_BACKGROUND_COLOR, GAME_HEIGHT, GAME_WIDTH } from './config/gameConfig';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { TitleScene } from './scenes/TitleScene';
import { UIScene } from './scenes/UIScene';
import { MuelleScene } from './scenes/rooms/MuelleScene';
import { TabernaScene } from './scenes/rooms/TabernaScene';
import { CallejonScene } from './scenes/rooms/CallejonScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: GAME_BACKGROUND_COLOR,
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  render: {
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    antialiasGL: false
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game-root',
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  input: {
    activePointers: 1,
    smoothFactor: 0
  },
  fps: {
    target: 60,
    smoothStep: true
  },
  dom: { createContainer: false },
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    UIScene,
    MuelleScene,
    TabernaScene,
    CallejonScene
  ]
};

const game = new Phaser.Game(config);

window.addEventListener('load', () => {
  const loading = document.getElementById('loading');
  if (loading) loading.classList.add('hidden');
});

if (typeof window !== 'undefined') {
  (window as unknown as { __MTX__?: Phaser.Game }).__MTX__ = game;
}
