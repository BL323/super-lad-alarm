// Run state for one play of a level. A plain, serialisable object so it can be
// saved later (saved progress is out of scope for v1). Score and pint count
// are separate numbers: score includes bonus items and the completion bonus.
export function createGameState(levelId) {
  return {
    levelId,
    score: 0,
    coins: 0, // pints collected
    coinsTotal: 0,
    bonuses: 0, // bonus items found (espresso martini)
    checkpoint: null, // { name, x, y } feet position of the last activated checkpoint
    completed: false,
  };
}

/** Apply a collectible pickup. `def` is an entry from collectibleTypes. */
export function addPickup(state, def) {
  state.score += def.points;
  if (def.counts) state.coins += 1;
  else state.bonuses += 1;
}
