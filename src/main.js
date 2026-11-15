import Phaser from 'phaser';
import './style.css';
import { GAME_WIDTH, GAME_HEIGHT, PHYSICS, INPUT, COLORS, GAME_TITLE } from './config.js';
import { setupScaling } from './systems/Scaling.js';
import Audio from './systems/Audio.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import CompleteScene from './scenes/CompleteScene.js';

document.title = GAME_TITLE;

const scaling = setupScaling(document.getElementById('app'), document.getElementById('game'));

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  title: GAME_TITLE,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: COLORS.background,
  pixelArt: true, // nearest-neighbour sampling, no antialiasing, rounded pixels
  banner: false,
  disableContextMenu: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: PHYSICS.gravity },
      debug: PHYSICS.debug,
    },
  },
  input: {
    activePointers: INPUT.maxPointers,
  },
  scene: [BootScene, MenuScene, GameScene, UIScene, CompleteScene],
});

scaling.attach(game);
Audio.init(game);

if (import.meta.env.DEV) {
  window.__game = game; // handy for poking at state from the console
}
