import { TEX, ANIM, PLAYER_FRAMES, COIN_FRAME } from '../assets.js';

// Every animation is defined here and referenced elsewhere by name (src/assets.js ANIM).
const DEFS = [
  { key: ANIM.PLAYER_IDLE, texture: TEX.PLAYER, frames: PLAYER_FRAMES.idle, frameRate: 2, repeat: -1 },
  { key: ANIM.PLAYER_RUN, texture: TEX.PLAYER, frames: PLAYER_FRAMES.run, frameRate: 12, repeat: -1 },
  { key: ANIM.PLAYER_JUMP, texture: TEX.PLAYER, frames: PLAYER_FRAMES.jump, frameRate: 1, repeat: 0 },
  { key: ANIM.PLAYER_FALL, texture: TEX.PLAYER, frames: PLAYER_FRAMES.fall, frameRate: 1, repeat: 0 },
  {
    key: ANIM.COIN_SPIN,
    texture: TEX.COIN,
    frames: [...Array(COIN_FRAME.count).keys()],
    frameRate: 8,
    repeat: -1,
  },
];

export function registerAnimations(scene) {
  for (const { key, texture, frames, frameRate, repeat } of DEFS) {
    if (scene.anims.exists(key)) continue;
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(texture, { frames }),
      frameRate,
      repeat,
    });
  }
}
