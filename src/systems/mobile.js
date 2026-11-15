import Phaser from 'phaser';
import { isTouchDevice } from './device.js';

// Page-level mobile behaviour: block browser gestures that fight the game, and
// the portrait "rotate your device" overlay.

/**
 * iOS Safari ignores `user-scalable=no`, so pinch and double-tap zoom are
 * blocked here as well as in CSS (`touch-action: none`). Blocking touchmove
 * on the document also stops rubber-band scrolling and pull-to-refresh.
 */
export function blockBrowserGestures() {
  const stop = (e) => {
    if (e.cancelable) e.preventDefault();
  };
  const opts = { passive: false };
  document.addEventListener('gesturestart', stop, opts);
  document.addEventListener('gesturechange', stop, opts);
  document.addEventListener('gestureend', stop, opts);
  document.addEventListener('dblclick', stop, opts);
  document.addEventListener('touchmove', stop, opts);
}

/**
 * On touch devices held in portrait, show the rotate overlay and freeze the
 * whole game (rendering, physics, the run clock) by sleeping Phaser's loop.
 * Back in landscape it wakes up exactly where it left off. There is no
 * player-facing pause feature; this is the only freeze.
 */
export function setupOrientationGuard(game, overlay) {
  let frozen = false;

  const apply = () => {
    const portrait = isTouchDevice() && window.innerHeight > window.innerWidth;
    overlay.hidden = !portrait;
    if (portrait && !frozen) {
      frozen = true;
      game.loop.sleep();
    } else if (!portrait && frozen) {
      frozen = false;
      // Keys released while frozen would otherwise read as still held.
      for (const scene of game.scene.getScenes(true)) scene.input?.keyboard?.resetKeys();
      // Reset the frame delta first, or the first frame back would add the
      // whole time spent in portrait to the run clock.
      game.loop.resetDelta();
      game.loop.wake();
    }
  };

  // The loop only starts after boot, so check once it has stepped.
  game.events.once(Phaser.Core.Events.POST_STEP, apply);
  window.addEventListener('resize', apply);
  window.addEventListener('orientationchange', apply);
  window.visualViewport?.addEventListener('resize', apply);
  return { isFrozen: () => frozen };
}
