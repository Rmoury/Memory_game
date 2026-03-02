/**
 * game.js
 * MemoryGame class — handles ALL game logic:
 *  - Card rendering and flipping (CSS 3D transform)
 *  - Matching logic
 *  - Move counter
 *  - Timer (starts on first click)
 *  - Score calculation
 *  - Difficulty switching
 *  - New Game / Reset
 *  - Win detection + congratulations modal
 */

class MemoryGame {
  constructor() {
    // ── State ─────────────────────────────────────────
    this.deck           = [];
    this.flippedCards   = [];   // Max 2 at a time
    this.matchedPairs   = 0;
    this.totalPairs     = 0;
    this.moves          = 0;
    this.locked         = false; // Prevent clicks during mismatch reveal
    this.difficulty     = "easy";

    // ── Timer ─────────────────────────────────────────
    this.timerInterval  = null;
    this.elapsedSeconds = 0;
    this.timerStarted   = false;

    // ── Score ─────────────────────────────────────────
    this.score          = 0;
    this.bestScores     = this._loadBestScores();

    this._bindUI();
    this.newGame("easy");
  }

  // ══════════════════════════════════════════════════
  //  GAME LIFECYCLE
  // ══════════════════════════════════════════════════

  /** Start a brand-new game with the given difficulty */
  newGame(difficulty = this.difficulty) {
    this.difficulty     = difficulty;
    this.deck           = buildDeck(difficulty);
    this.flippedCards   = [];
    this.matchedPairs   = 0;
    this.totalPairs     = CARD_SETS[difficulty].totalCards / 2;
    this.moves          = 0;
    this.score          = 0;
    this.locked         = false;

    this._stopTimer();
    this.elapsedSeconds = 0;
    this.timerStarted   = false;

    this._renderBoard();
    this._updateStats();
    this._updateDifficultyButtons();
    this._updateBestScore();

    // Animate header on new game
    document.getElementById("moves-display").classList.remove("pop");
    document.getElementById("timer-display").classList.remove("pop");
  }

  // ══════════════════════════════════════════════════
  //  CARD INTERACTION
  // ══════════════════════════════════════════════════

  /** Called when a card is clicked */
  _handleCardClick(cardId) {
    if (this.locked) return;

    const card = this.deck[cardId];
    if (!card || card.isFlipped || card.isMatched) return;
    if (this.flippedCards.length === 2) return;

    // Start timer on first click
    if (!this.timerStarted) {
      this._startTimer();
      this.timerStarted = true;
    }

    // Flip the card
    card.isFlipped = true;
    this.flippedCards.push(card);
    this._flipCardElement(cardId, true);

    // If two cards are flipped, check for match
    if (this.flippedCards.length === 2) {
      this.moves++;
      this._updateStats();
      this._animateStat("moves-display");
      this._checkMatch();
    }
  }

  /** Compare the two flipped cards */
  _checkMatch() {
    const [a, b] = this.flippedCards;

    if (a.symbol === b.symbol) {
      // ✅ MATCH
      setTimeout(() => {
        a.isMatched = b.isMatched = true;
        this._markMatched(a.id);
        this._markMatched(b.id);
        this.matchedPairs++;
        this.flippedCards = [];

        if (this.matchedPairs === this.totalPairs) {
          this._onWin();
        }
      }, 400);

    } else {
      // ❌ MISMATCH — lock board, flip back after delay
      this.locked = true;
      setTimeout(() => {
        a.isFlipped = b.isFlipped = false;
        this._flipCardElement(a.id, false);
        this._flipCardElement(b.id, false);
        this._shakeCards(a.id, b.id);
        this.flippedCards = [];
        this.locked = false;
      }, 900);
    }
  }

  // ══════════════════════════════════════════════════
  //  WIN
  // ══════════════════════════════════════════════════

  _onWin() {
    this._stopTimer();
    this.score = this._calculateScore();

    // Update best score
    const key = this.difficulty;
    if (!this.bestScores[key] || this.score > this.bestScores[key]) {
      this.bestScores[key] = this.score;
      this._saveBestScores();
    }

    // Show modal after brief delay
    setTimeout(() => this._showWinModal(), 600);
  }

  /** Score formula: base points minus time/move penalties */
  _calculateScore() {
    const base   = this.totalPairs * 100;
    const timePenalty = Math.floor(this.elapsedSeconds * 2);
    const movePenalty = Math.max(0, (this.moves - this.totalPairs) * 5);
    return Math.max(0, base - timePenalty - movePenalty);
  }

  // ══════════════════════════════════════════════════
  //  TIMER
  // ══════════════════════════════════════════════════

  _startTimer() {
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      this._updateTimerDisplay();
      this._animateStat("timer-display");
    }, 1000);
  }

  _stopTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }

  _formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  _updateTimerDisplay() {
    const el = document.getElementById("timer-value");
    if (el) el.textContent = this._formatTime(this.elapsedSeconds);
  }

  // ══════════════════════════════════════════════════
  //  RENDERING
  // ══════════════════════════════════════════════════

  /** Build the card grid from scratch */
  _renderBoard() {
    const board = document.getElementById("game-board");
    const config = CARD_SETS[this.difficulty];
    board.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    board.innerHTML = "";

    this.deck.forEach((card, index) => {
      const el = document.createElement("div");
      el.className = "card";
      el.dataset.id = index;
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", "Memory card — face down");
      el.setAttribute("tabindex", "0");

      el.innerHTML = `
        <div class="card-inner">
          <div class="card-front" aria-hidden="true">
            <span class="card-back-icon">?</span>
          </div>
          <div class="card-back" aria-hidden="true">
            <span class="card-symbol">${card.symbol}</span>
          </div>
        </div>
      `;

      // Click handler
      el.addEventListener("click", () => this._handleCardClick(index));

      // Keyboard handler (Enter / Space)
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this._handleCardClick(index);
        }
      });

      // Stagger entrance animation
      el.style.animationDelay = `${index * 0.03}s`;
      el.classList.add("card-entrance");

      board.appendChild(el);
    });
  }

  /** Flip a card element up or down */
  _flipCardElement(cardId, faceUp) {
    const el = document.querySelector(`.card[data-id="${cardId}"]`);
    if (!el) return;
    if (faceUp) {
      el.classList.add("flipped");
      el.setAttribute("aria-label", `Card: ${this.deck[cardId].symbol}`);
    } else {
      el.classList.remove("flipped");
      el.setAttribute("aria-label", "Memory card — face down");
    }
  }

  /** Mark a card as permanently matched */
  _markMatched(cardId) {
    const el = document.querySelector(`.card[data-id="${cardId}"]`);
    if (!el) return;
    el.classList.add("matched");
    el.setAttribute("aria-label", `Matched: ${this.deck[cardId].symbol}`);
  }

  /** Shake mismatched cards */
  _shakeCards(idA, idB) {
    [idA, idB].forEach(id => {
      const el = document.querySelector(`.card[data-id="${id}"]`);
      if (!el) return;
      el.classList.add("shake");
      el.addEventListener("animationend", () => el.classList.remove("shake"), { once: true });
    });
  }

  /** Update moves + score in the HUD */
  _updateStats() {
    const movesEl = document.getElementById("moves-value");
    const pairsEl = document.getElementById("pairs-value");
    const scoreEl = document.getElementById("score-value");

    if (movesEl) movesEl.textContent = this.moves;
    if (pairsEl) pairsEl.textContent = `${this.matchedPairs}/${this.totalPairs}`;
    if (scoreEl) scoreEl.textContent = this._calculateScore();
  }

  _animateStat(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("pop");
    void el.offsetWidth; // Reflow trick to restart animation
    el.classList.add("pop");
  }

  _updateDifficultyButtons() {
    document.querySelectorAll(".diff-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.difficulty === this.difficulty);
    });
  }

  _updateBestScore() {
    const el = document.getElementById("best-score-value");
    if (el) el.textContent = this.bestScores[this.difficulty] ?? "—";
  }

  // ══════════════════════════════════════════════════
  //  WIN MODAL
  // ══════════════════════════════════════════════════

  _showWinModal() {
    const modal = document.getElementById("win-modal");
    document.getElementById("modal-moves").textContent  = this.moves;
    document.getElementById("modal-time").textContent   = this._formatTime(this.elapsedSeconds);
    document.getElementById("modal-score").textContent  = this.score;
    document.getElementById("modal-best").textContent   = this.bestScores[this.difficulty] ?? this.score;

    // Star rating based on score vs max
    const maxScore = this.totalPairs * 100;
    const ratio = this.score / maxScore;
    const stars = ratio > 0.7 ? 3 : ratio > 0.4 ? 2 : 1;
    document.getElementById("modal-stars").textContent = "⭐".repeat(stars);

    modal.classList.add("show");
  }

  _hideWinModal() {
    document.getElementById("win-modal").classList.remove("show");
  }

  // ══════════════════════════════════════════════════
  //  PERSISTENCE
  // ══════════════════════════════════════════════════

  _loadBestScores() {
    try {
      return JSON.parse(sessionStorage.getItem("memory_best") || "{}");
    } catch { return {}; }
  }

  _saveBestScores() {
    try {
      sessionStorage.setItem("memory_best", JSON.stringify(this.bestScores));
    } catch { /* ignore */ }
  }

  // ══════════════════════════════════════════════════
  //  UI BINDING
  // ══════════════════════════════════════════════════

  _bindUI() {
    // New Game button
    document.getElementById("btn-new-game")?.addEventListener("click", () => {
      this._hideWinModal();
      this.newGame();
    });

    // Modal play again
    document.getElementById("btn-play-again")?.addEventListener("click", () => {
      this._hideWinModal();
      this.newGame();
    });

    // Difficulty buttons
    document.querySelectorAll(".diff-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const diff = btn.dataset.difficulty;
        if (diff !== this.difficulty) {
          this.newGame(diff);
        }
      });
    });
  }
}

// ── Boot ────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  window.game = new MemoryGame();
});
