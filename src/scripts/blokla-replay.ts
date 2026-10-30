/**
 * Short scripted Blokla replay for the featured project card.
 *
 * Plays once when the preview scrolls into view: a "finger" drags pieces from
 * the tray onto the board, full rows/columns burst into particles, the score
 * counts up, combos shake the board, and once the tray is empty a fresh set of
 * pieces is dealt, as in the real game. Afterwards a "watch again" button appears.
 *
 * Everything comes from the server-rendered markup (BloklaPreview.astro):
 * board tiles carry data-r/data-c, tray pieces carry data-cells/data-paint, the
 * moves are in data-moves and the dealt pieces in data-deal. Skipped entirely
 * with reduced motion.
 */
type Cell = readonly [row: number, col: number];

interface Move {
  readonly piece: number;
  readonly at: Cell;
}

interface DealtPiece {
  readonly paint: string;
  readonly cols: number;
  /** Rows of the piece; 'x' marks a block. */
  readonly rows: readonly string[];
}

const SIZE = 8;
const POINTS_PER_LINE = 80;

const TIMING = {
  start: 500,
  lift: 250,
  drag: 950,
  settle: 260,
  clear: 420,
  between: 420,
  badge: 1100,
  deal: 420,
} as const;

const PARTICLES_PER_TILE = 3;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const easeInOut = 'cubic-bezier(0.65, 0, 0.35, 1)';
const easeSnap = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

/** Board tiles and a filled/empty model, built from the current DOM. */
class Board {
  private readonly tiles: HTMLElement[][];
  private readonly filled: boolean[][];

  constructor(boardEl: HTMLElement) {
    this.tiles = Array.from({ length: SIZE }, () => new Array<HTMLElement>(SIZE));
    this.filled = Array.from({ length: SIZE }, () => new Array<boolean>(SIZE).fill(false));
    for (const tile of boardEl.querySelectorAll<HTMLElement>('[data-r]')) {
      const r = Number(tile.dataset['r']);
      const c = Number(tile.dataset['c']);
      this.tiles[r]![c] = tile;
      this.filled[r]![c] = tile.classList.contains('tile--block');
    }
  }

  tile([r, c]: Cell): HTMLElement {
    return this.tiles[r]![c]!;
  }

  fill(cell: Cell, paint: string): void {
    const tile = this.tile(cell);
    tile.className = 'tile tile--block';
    tile.style.setProperty('--paint', paint);
    this.filled[cell[0]]![cell[1]] = true;
  }

  preview(cells: readonly Cell[], paint: string | null): void {
    for (const cell of cells) {
      const tile = this.tile(cell);
      tile.className = paint ? 'tile tile--ghost' : 'tile tile--empty';
      if (paint) tile.style.setProperty('--paint', paint);
      else tile.style.removeProperty('--paint');
    }
  }

  empty(cell: Cell): void {
    const tile = this.tile(cell);
    tile.className = 'tile tile--empty';
    tile.style.removeProperty('--paint');
    this.filled[cell[0]]![cell[1]] = false;
  }

  /** Cells of every full row and column (deduplicated), plus how many lines that is. */
  fullLines(): { cells: Cell[]; lines: number } {
    const rows = [...Array(SIZE).keys()].filter((r) => this.filled[r]!.every(Boolean));
    const cols = [...Array(SIZE).keys()].filter((c) => this.filled.every((row) => row[c]));
    const keys = new Set<string>();
    const cells: Cell[] = [];
    const add = (r: number, c: number) => {
      const key = `${r},${c}`;
      if (!keys.has(key)) {
        keys.add(key);
        cells.push([r, c]);
      }
    };
    for (const r of rows) for (let c = 0; c < SIZE; c++) add(r, c);
    for (const c of cols) for (let r = 0; r < SIZE; r++) add(r, c);
    return { cells, lines: rows.length + cols.length };
  }
}

class Replay {
  private board!: Board;
  private boardEl!: HTMLElement;
  private scoreEl!: HTMLElement;
  private pieces!: HTMLElement[];
  private score = 0;
  private combo = 0;

  constructor(
    private readonly game: HTMLElement,
    private readonly moves: readonly Move[],
    private readonly deal: readonly DealtPiece[],
  ) {}

  /** (Re)binds to the current DOM — called before every play. */
  private bind(): void {
    this.boardEl = this.game.querySelector<HTMLElement>('.blokla__board')!;
    this.scoreEl = this.game.querySelector<HTMLElement>('.blokla__score')!;
    this.pieces = [...this.game.querySelectorAll<HTMLElement>('.piece')];
    this.board = new Board(this.boardEl);
    this.score = Number(this.scoreEl.dataset['score'] ?? 0);
    this.combo = 0;
  }

  async play(): Promise<void> {
    this.bind();
    await wait(TIMING.start);
    for (const move of this.moves) {
      await this.place(move);
      await this.clearLines();
      await wait(TIMING.between);
    }
    await this.dealPieces();
  }

  /** Refills the empty tray with fresh pieces sliding up from below. */
  private async dealPieces(): Promise<void> {
    const tray = this.game.querySelector<HTMLElement>('.blokla__tray')!;
    tray.replaceChildren();
    const arrivals = this.deal.map((dealt, index) => {
      const piece = document.createElement('span');
      piece.className = 'piece';
      piece.style.setProperty('--cols', String(dealt.cols));
      piece.style.setProperty('--paint', dealt.paint);
      for (const row of dealt.rows) {
        for (const mark of row) {
          const cell = document.createElement('span');
          if (mark === 'x') cell.className = 'tile tile--block';
          piece.append(cell);
        }
      }
      tray.append(piece);
      return piece.animate(
        [
          { opacity: 0, transform: 'translateY(26px) scale(0.6)' },
          { opacity: 1, transform: 'translateY(-4px) scale(1.06)', offset: 0.7 },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ],
        { duration: TIMING.deal, delay: index * 110, easing: easeSnap, fill: 'backwards' },
      ).finished;
    });
    await Promise.all(arrivals);
  }

  /** Position of `el` relative to the game container, in px. */
  private rect(el: Element) {
    const box = el.getBoundingClientRect();
    const origin = this.game.getBoundingClientRect();
    return { x: box.left - origin.left, y: box.top - origin.top, w: box.width, h: box.height };
  }

  private async place({ piece: index, at }: Move): Promise<void> {
    const piece = this.pieces[index]!;
    const paint = piece.dataset['paint']!;
    const offsets = JSON.parse(piece.dataset['cells']!) as Cell[];
    const target = offsets.map(([r, c]) => [at[0] + r, at[1] + c] as const);

    // Lift the piece in the tray.
    piece.setAttribute('data-lifted', '');
    await wait(TIMING.lift);

    // Build a floating copy at board-cell size, starting over the tray piece.
    const cellSize = this.rect(this.board.tile([0, 0])).w;
    const cols = Math.max(...offsets.map(([, c]) => c)) + 1;
    const float = document.createElement('div');
    float.className = 'blokla__float';
    float.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    for (const [r, c] of offsets) {
      const tile = document.createElement('span');
      tile.className = 'tile tile--block';
      tile.style.setProperty('--paint', paint);
      tile.style.gridArea = `${r + 1} / ${c + 1}`;
      float.append(tile);
    }
    const finger = document.createElement('span');
    finger.className = 'blokla__finger';

    const from = this.rect(piece);
    const to = this.rect(this.board.tile(target[0]!));
    const startScale = from.w / (cols * cellSize + (cols - 1) * 3);
    piece.setAttribute('data-used', '');
    piece.removeAttribute('data-lifted');
    this.game.append(float, finger);

    const path = [
      { transform: `translate(${from.x}px, ${from.y}px) scale(${startScale})` },
      { transform: `translate(${to.x}px, ${to.y - cellSize * 0.6}px) scale(1)`, offset: 0.85 },
      { transform: `translate(${to.x}px, ${to.y}px) scale(1)` },
    ];
    const fingerPath = path.map((frame) => ({
      ...frame,
      transform: frame.transform.replace(/scale\([^)]*\)/, '').concat(` translate(${cellSize * 0.4}px, ${cellSize * 0.9}px)`),
    }));

    const drag = float.animate(path, { duration: TIMING.drag, easing: easeInOut, fill: 'forwards' });
    finger.animate(fingerPath, { duration: TIMING.drag, easing: easeInOut, fill: 'forwards' });

    // Show where it will land, like the real game does.
    await wait(TIMING.drag * 0.55);
    this.board.preview(target, paint);
    await drag.finished;

    // Drop: fill the cells with a little bounce.
    float.remove();
    finger.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }).finished.then(() => finger.remove());
    for (const cell of target) {
      this.board.fill(cell, paint);
      this.board.tile(cell).animate(
        [{ transform: 'scale(0.7)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }],
        { duration: TIMING.settle, easing: easeSnap },
      );
    }
    await this.addScore(target.length);
  }

  private async clearLines(): Promise<void> {
    const { cells, lines } = this.board.fullLines();
    if (lines === 0) {
      this.combo = 0;
      return;
    }
    this.combo += 1;

    const flashes = cells.map(([r, c]) =>
      this.board.tile([r, c]).animate(
        [
          { transform: 'scale(1)', filter: 'brightness(1)' },
          { transform: 'scale(1.06)', filter: 'brightness(2.2)', offset: 0.35 },
          { transform: 'scale(0)', filter: 'brightness(2.2)', opacity: 0 },
        ],
        { duration: TIMING.clear, delay: c * 22, easing: 'ease-in', fill: 'forwards' },
      ),
    );
    const points = lines * POINTS_PER_LINE * this.combo;
    this.burst(cells);
    this.popup(`+${points}`, cells);
    if (this.combo > 1) {
      this.badge(`COMBO ×${this.combo}${this.combo > 2 ? '!' : ''}`, this.combo);
      this.shake(this.combo);
    }

    await Promise.all(flashes.map((animation) => animation.finished));
    for (const [r, c] of cells) {
      const tile = this.board.tile([r, c]);
      tile.getAnimations().forEach((animation) => animation.cancel());
      this.board.empty([r, c]);
    }
    await this.addScore(points);
  }

  private addScore(points: number): Promise<void> {
    const start = this.score;
    const end = start + points;
    this.score = end;
    this.scoreEl.dataset['score'] = String(end);
    const duration = Math.min(500, 120 + points * 2);
    const began = performance.now();
    return new Promise((resolve) => {
      const tick = (now: number) => {
        const t = Math.min(1, (now - began) / duration);
        const value = Math.round(start + (end - start) * t);
        this.scoreEl.textContent = String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  /** Centre of the cleared cells, relative to the game container. */
  private centre(cells: readonly Cell[]) {
    const boxes = cells.map((cell) => this.rect(this.board.tile(cell)));
    const left = Math.min(...boxes.map((b) => b.x));
    const right = Math.max(...boxes.map((b) => b.x + b.w));
    const top = Math.min(...boxes.map((b) => b.y));
    const bottom = Math.max(...boxes.map((b) => b.y + b.h));
    return { x: (left + right) / 2, y: (top + bottom) / 2 };
  }

  /** Small squares in each tile's colour, flying out and falling away. */
  private burst(cells: readonly Cell[]): void {
    for (const cell of cells) {
      const tile = this.board.tile(cell);
      const box = this.rect(tile);
      const paint = tile.style.getPropertyValue('--paint');
      for (let i = 0; i < PARTICLES_PER_TILE; i++) {
        const particle = document.createElement('span');
        particle.className = 'blokla__particle';
        particle.style.setProperty('--paint', paint);
        particle.style.left = `${box.x + box.w / 2}px`;
        particle.style.top = `${box.y + box.h / 2}px`;
        this.game.append(particle);
        const angle = Math.random() * Math.PI * 2;
        const distance = 18 + Math.random() * 34;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance - 10;
        particle
          .animate(
            [
              { opacity: 1, transform: 'translate(-50%, -50%) scale(1) rotate(0deg)' },
              {
                opacity: 0,
                transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 26}px)) scale(0.4) rotate(${dx * 6}deg)`,
              },
            ],
            { duration: 520 + Math.random() * 260, delay: cell[1] * 22, easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)', fill: 'forwards' },
          )
          .finished.then(() => particle.remove());
      }
    }
  }

  /** A short shake of the board; stronger for bigger combos. */
  private shake(combo: number): void {
    const amount = Math.min(2 + combo * 1.5, 7);
    this.boardEl.animate(
      [
        { transform: 'translate(0, 0)' },
        { transform: `translate(${-amount}px, ${amount / 2}px)` },
        { transform: `translate(${amount}px, ${-amount / 2}px)` },
        { transform: `translate(${-amount / 2}px, 0)` },
        { transform: 'translate(0, 0)' },
      ],
      { duration: 320, easing: 'ease-out' },
    );
  }

  /** Floating "+points" over the cleared cells. */
  private popup(text: string, cells: readonly Cell[]): void {
    const anchor = this.centre(cells);
    const el = document.createElement('span');
    el.className = 'blokla__popup';
    el.textContent = text;
    el.style.left = `${anchor.x}px`;
    el.style.top = `${anchor.y - 10}px`;
    this.game.append(el);
    el.animate(
      [
        { opacity: 0, transform: 'translateY(6px) scale(0.8)' },
        { opacity: 1, transform: 'translateY(-6px) scale(1.1)', offset: 0.25 },
        { opacity: 0, transform: 'translateY(-34px) scale(1)' },
      ],
      { duration: TIMING.badge, easing: 'ease-out', fill: 'forwards' },
    ).finished.then(() => el.remove());
  }

  /** Big "COMBO ×n" badge in the middle of the board; grows with the combo. */
  private badge(text: string, combo: number): void {
    const el = document.createElement('span');
    el.className = 'blokla__combo';
    el.textContent = text;
    this.game.append(el);
    const peak = 1.05 + combo * 0.08;
    el.animate(
      [
        { opacity: 0, transform: 'scale(0.4) rotate(-8deg)' },
        { opacity: 1, transform: `scale(${peak}) rotate(3deg)`, offset: 0.25 },
        { opacity: 1, transform: 'scale(1) rotate(0deg)', offset: 0.7 },
        { opacity: 0, transform: 'scale(0.9) rotate(0deg)' },
      ],
      { duration: TIMING.badge + 500, easing: 'ease-out', fill: 'forwards' },
    ).finished.then(() => el.remove());
  }
}

function initOne(root: HTMLElement): void {
  const game = root.querySelector<HTMLElement>('.blokla');
  const again = root.querySelector<HTMLButtonElement>('[data-replay-again]');
  if (!game || !again) return;

  const moves = JSON.parse(game.dataset['moves'] ?? '[]') as Move[];
  const deal = JSON.parse(game.dataset['deal'] ?? '[]') as DealtPiece[];
  const initial = game.innerHTML;
  const replay = new Replay(game, moves, deal);
  let playing = false;

  const run = async () => {
    if (playing) return;
    playing = true;
    again.hidden = true;
    game.innerHTML = initial; // start from the first frame every time
    try {
      await replay.play();
    } finally {
      playing = false;
      again.hidden = false;
    }
  };

  again.addEventListener('click', () => void run());

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        void run();
      }
    },
    { threshold: 0.6 },
  );
  observer.observe(game);
}

export function initBloklaReplay(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (const root of document.querySelectorAll<HTMLElement>('[data-blokla-replay]')) initOne(root);
}
