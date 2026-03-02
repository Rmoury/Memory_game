# Memory_game
It's a card memory games where two similar character are present on the other side we have to choose it in row so that we can win 😊

# 🃏 Memory Card Game
###  HTML, CSS, JavaScript

---

## 📁 Project Structure

```
memory-card-game/
│
├── index.html          ← Main game page (all HTML)
│
├── css/
│   └── style.css       ← Neon retro theme, card flip 3D, animations, responsive
│
├── js/
│   ├── cards.js        ← Card sets per difficulty + shuffle algorithm
│   └── game.js         ← MemoryGame class: all game logic
│
└── README.md           ← This file
```

---

## 🚀 How to Run

No build tools or installs needed — just open in any browser.

```bash
# Option 1: Direct
open index.html

# Option 2: Local server (recommended)
npx serve .
# or
python3 -m http.server 3000
```

---

## 🎮 How to Play

1. Click any card to flip it and reveal its emoji
2. Click a second card to try to find its match
3. If both cards match — they stay face up ✅
4. If they don't match — they flip back face down after a brief pause ❌
5. Match all pairs to win!
6. Press **New Game** at any time to shuffle and restart

---

## 🏆 Difficulty Levels

| Level | Grid | Pairs | Card Set |
|-------|------|-------|----------|
| Easy | 4×4 | 8 | Animal emojis |
| Medium | 4×6 | 12 | Food & nature emojis |
| Hard | 6×6 | 18 | Space & instruments emojis |

---

## 📊 Scoring System

Score starts high and decreases with time and extra moves:

```
Score = (Pairs × 100) - (Seconds × 2) - (Extra Moves × 5)
Minimum score: 0
```

A perfect game (minimum moves, fast time) scores close to the base maximum.

**Star Rating:**
- ⭐⭐⭐ — Score > 70% of max
- ⭐⭐ — Score > 40% of max
- ⭐ — Any completed game

---

## ✅ Requirements Checklist

- [x] Grid of face-down cards (4×4 Easy / 4×6 Medium / 6×6 Hard)
- [x] Hidden emoji revealed on click
- [x] Match logic — matched cards stay face up
- [x] Mismatch — cards flip back with shake animation
- [x] Move counter
- [x] Timer (starts on first click)
- [x] "New Game" button with card shuffle
- [x] "Congratulations" win modal
- [x] ⭐ BONUS: Scoring system (time + moves based)
- [x] ⭐ BONUS: 3 difficulty levels
- [x] Responsive (mobile + desktop)
- [x] Well-commented code

---

## 🏗️ Technical Architecture

### `cards.js`
- `CARD_SETS` object defines grid dimensions and emoji symbols per difficulty
- `buildDeck(difficulty)` creates pairs and shuffles using Fisher-Yates algorithm

### `game.js` — `MemoryGame` class
| Method | Purpose |
|--------|---------|
| `newGame(difficulty)` | Resets all state, renders fresh board |
| `_handleCardClick(id)` | Flips card, starts timer on first click |
| `_checkMatch()` | Compares two flipped cards |
| `_onWin()` | Stops timer, calculates score, shows modal |
| `_calculateScore()` | Score formula (base - time - move penalties) |
| `_renderBoard()` | Builds card grid DOM from deck data |
| `_flipCardElement()` | Adds/removes `.flipped` CSS class |
| `_markMatched()` | Adds `.matched` class for permanent reveal |

### `style.css`
- CSS 3D `transform: rotateY(180deg)` for card flips
- `backface-visibility: hidden` on front/back faces
- CRT scanline texture via `repeating-linear-gradient`
- Neon glow effects via `text-shadow` and `box-shadow`
- Responsive grid using `grid-template-columns: repeat(N, 1fr)`

---

*Built for  Mentor — Memory Card Game Project*
