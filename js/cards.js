/**
 * cards.js
 * Defines emoji card sets for each difficulty level.
 * Each set contains unique symbols — the game engine
 * will duplicate them to create pairs.
 *
 * Easy:   4x4 grid = 8 pairs
 * Medium: 4x6 grid = 12 pairs
 * Hard:   6x6 grid = 18 pairs
 */

const CARD_SETS = {

  easy: {
    label: "Easy",
    cols: 4,
    rows: 4,
    totalCards: 16,  // 8 pairs
    symbols: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼"]
  },

  medium: {
    label: "Medium",
    cols: 6,
    rows: 4,
    totalCards: 24, // 12 pairs
    symbols: [
      "🍎","🍊","🍋","🍇","🍓","🍒",
      "🌸","🌻","🌈","⚡","🔥","❄️"
    ]
  },

  hard: {
    label: "Hard",
    cols: 6,
    rows: 6,
    totalCards: 36, // 18 pairs
    symbols: [
      "🚀","🛸","🌙","⭐","🪐","🌌",
      "🎯","🎲","🎸","🎺","🎻","🥁",
      "💎","🔮","🗝️","🧲","⚗️","🔭"
    ]
  }
};

/**
 * Builds and shuffles the card deck for a given difficulty.
 * Returns an array of card objects, each with:
 *   { id, symbol, isFlipped, isMatched }
 */
function buildDeck(difficulty) {
  const set = CARD_SETS[difficulty];
  if (!set) throw new Error(`Unknown difficulty: ${difficulty}`);

  // Create pairs
  const pairs = [...set.symbols, ...set.symbols];

  // Fisher-Yates shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  // Return card objects
  return pairs.map((symbol, index) => ({
    id: index,
    symbol,
    isFlipped: false,
    isMatched: false
  }));
}
