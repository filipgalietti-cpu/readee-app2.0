export type Stone = { id: number; picture: number };
export type StoneBoard = { stones: Stone[]; open: number[]; matched: number[]; pairs: number };
/** Repeated picture pairs keep a large field playable within a short warm-up. */
export function createStoneBoard(
  count: number,
  pictures: number,
  random = Math.random,
): StoneBoard {
  if (count < 2 || count % 2 || pictures < 1)
    throw Error("Matching needs an even board and pictures");
  const deck = Array.from({ length: count / 2 }, (_, i) => i % pictures).flatMap((p) => [p, p]);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return { stones: deck.map((picture, id) => ({ id, picture })), open: [], matched: [], pairs: 0 };
}
export function flipStone(board: StoneBoard, id: number): StoneBoard {
  if (
    !board.stones[id] ||
    board.open.length === 2 ||
    board.open.includes(id) ||
    board.matched.includes(id)
  )
    return board;
  const open = [...board.open, id];
  if (open.length === 2 && board.stones[open[0]].picture === board.stones[id].picture)
    return { ...board, open: [], matched: [...board.matched, ...open], pairs: board.pairs + 1 };
  return { ...board, open };
}
export function closeStonePair(board: StoneBoard): StoneBoard {
  return board.open.length === 2 ? { ...board, open: [] } : board;
}
export const STONE_PAIR_CARROTS = 2;
export const STONE_COMPLETION_BONUS = 2;
export const stoneCarrots = (pairs: number) => STONE_COMPLETION_BONUS + pairs * STONE_PAIR_CARROTS;
