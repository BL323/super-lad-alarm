// Level registry. GameScene takes a level id; the Complete screen offers
// `next` when it is set.
export const LEVELS = [
  {
    id: 'level-01',
    name: 'Dorchester to Parkstone',
    mapKey: 'level-01',
    file: 'assets/levels/level-01.json',
    theme: 'train-crawl',
    next: null,
  },
];

export const getLevel = (id) => LEVELS.find((l) => l.id === id) ?? LEVELS[0];
