// Sound wrapper. No sound assets exist in v1, so play() does nothing until a
// sound is loaded under the matching key (e.g. 'jump', 'coin', 'death',
// 'finish'). Gameplay code calls Audio.play() at the right moments already.

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
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);
    window.addEventListener('touchend', unlock, true);
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
