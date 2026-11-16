// Sound wrapper. Effects are synthesised at boot (src/audio/sfx.js) and
// stored in the audio cache under their keys; a real file loaded under the
// same key in BootScene.preload replaces the synth. play() does nothing for a
// key with no sound, or when Web Audio isn't available.
import { AUDIO } from '../config.js';
import { SOUNDS, SAMPLE_RATE } from '../audio/sfx.js';

let game = null;

function unlock() {
  const sound = game?.sound;
  if (sound?.locked && typeof sound.unlock === 'function') sound.unlock();
  if (sound?.context?.state === 'suspended') sound.context.resume().catch(() => {});
  window.removeEventListener('pointerdown', unlock, true);
  window.removeEventListener('keydown', unlock, true);
  window.removeEventListener('touchend', unlock, true);
}

const Audio = {
  /** Call once with the Phaser.Game. Unlocks audio on the first user input (browser autoplay rules). */
  init(phaserGame) {
    game = phaserGame;
    // iOS Safari: respect the silent switch and mix with the player's own music.
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'ambient';
    } catch {
      // not supported
    }
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);
    window.addEventListener('touchend', unlock, true);
  },

  /** Build every synthesised effect into the audio cache (call once, in BootScene.create). */
  registerSynthSounds(scene) {
    const ctx = scene.sound.context;
    if (!ctx || typeof ctx.createBuffer !== 'function') return; // no Web Audio: stay silent
    scene.sound.volume = AUDIO.volume;
    for (const [key, make] of Object.entries(SOUNDS)) {
      if (scene.cache.audio.exists(key)) continue; // real audio file loaded under this key
      const data = make();
      const buffer = ctx.createBuffer(1, data.length, SAMPLE_RATE);
      buffer.copyToChannel(data, 0);
      scene.cache.audio.add(key, buffer);
    }
  },

  play(key, config) {
    if (!game || !game.cache.audio.exists(key)) return;
    try {
      game.sound.play(key, config);
    } catch {
      // Ignore playback failures; sound is never required for play.
    }
  },
};

export default Audio;
