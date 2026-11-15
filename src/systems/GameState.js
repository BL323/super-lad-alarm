// Run state for one play of a level. A plain, serialisable object so it can be
// saved later (saved progress is out of scope for v1).
export function createGameState(levelId) {
  return {
    levelId,
    score: 0,
    coins: 0, // pints collected
    coinsTotal: 0,
    bonuses: 0, // espresso martinis found
    checkpoint: null, // { name, x, y } feet position of the last activated checkpoint
    completed: false,
  };
}
