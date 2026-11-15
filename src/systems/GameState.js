import { TIMING } from '../config.js';

// Run state for one play of a level. A plain object; nothing is saved between
// sessions. The run is measured in time rather than points.
export function createGameState(levelId) {
  return {
    levelId,
    elapsedMs: 0, // clock from level start to finish, deaths included
    coins: 0, // pints collected
    coinsTotal: 0,
    bonuses: 0, // bonus items found (espresso martini)
    bonusesTotal: 0,
    timeBonusMs: 0, // time taken off by bonus items
    checkpoint: null, // { name, x, y } feet position of the last activated checkpoint
    completed: false,
  };
}

/** Apply a collectible pickup. `def` is an entry from collectibleTypes. */
export function addPickup(state, def) {
  if (def.counts) state.coins += 1;
  else state.bonuses += 1;
  state.timeBonusMs += def.timeBonusMs ?? 0;
}

/** Final time: clock + 2 s per missed pint − bonuses, never below zero. */
export function finalTime(state) {
  const missed = state.coinsTotal - state.coins;
  const penaltyMs = missed * TIMING.missedPintPenaltyMs;
  const finalMs = Math.max(0, state.elapsedMs + penaltyMs - state.timeBonusMs);
  return { elapsedMs: state.elapsedMs, missed, penaltyMs, bonusMs: state.timeBonusMs, finalMs };
}

/** Format milliseconds as m:ss.t (e.g. 1:07.4). */
export function formatTime(ms) {
  const tenths = Math.floor(ms / 100);
  const m = Math.floor(tenths / 600);
  const sec = Math.floor((tenths % 600) / 10);
  return `${m}:${String(sec).padStart(2, '0')}.${tenths % 10}`;
}

/** Format a duration in words: "1 SECOND", "58 SECONDS", "2.5 SECONDS". */
export function formatSeconds(ms) {
  const n = ms / 1000;
  const shown = Number.isInteger(n) ? String(n) : n.toFixed(1);
  return `${shown} ${n === 1 ? 'SECOND' : 'SECONDS'}`;
}
