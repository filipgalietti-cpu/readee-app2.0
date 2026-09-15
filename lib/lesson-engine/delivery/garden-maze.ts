export type Direction = "up" | "down" | "left" | "right";
export type GardenMaze = {
  size: number;
  links: number[][];
  start: number;
  goal: number;
  carrots: number[];
};
export type MazeRun = { position: number; picked: number[]; visited: number[]; won: boolean };
export const MAZE_SIZE = 7;
export function mazeNeighbor(size: number, cell: number, direction: Direction) {
  const x = cell % size,
    y = Math.floor(cell / size);
  return direction === "up"
    ? y > 0
      ? cell - size
      : -1
    : direction === "down"
      ? y < size - 1
        ? cell + size
        : -1
      : direction === "left"
        ? x > 0
          ? cell - 1
          : -1
        : x < size - 1
          ? cell + 1
          : -1;
}
export function mazePath(maze: GardenMaze, from = maze.start, to = maze.goal): number[] {
  const queue = [from],
    parent = new Map<number, number>([[from, -1]]);
  for (let i = 0; i < queue.length; i++) {
    const cell = queue[i];
    if (cell === to) {
      const path: number[] = [];
      for (let c = to; c !== -1; c = parent.get(c)!) path.unshift(c);
      return path;
    }
    for (const next of maze.links[cell])
      if (!parent.has(next)) {
        parent.set(next, cell);
        queue.push(next);
      }
  }
  return [];
}
/** Connected garden paths with a bounded main journey and optional little detours. */
export function createGardenMaze(random: () => number = Math.random): GardenMaze {
  const size = MAZE_SIZE,
    links: number[][] = Array.from({ length: size * size }, () => []);
  const visited = new Set([0]),
    stack = [0];
  while (stack.length) {
    const cell = stack.at(-1)!;
    const options = (["up", "down", "left", "right"] as Direction[])
      .map((d) => mazeNeighbor(size, cell, d))
      .filter((n) => n >= 0 && !visited.has(n));
    if (!options.length) {
      stack.pop();
      continue;
    }
    const next = options[Math.min(options.length - 1, Math.floor(random() * options.length))];
    links[cell].push(next);
    links[next].push(cell);
    visited.add(next);
    stack.push(next);
  }
  const maze: GardenMaze = { size, links, start: 0, goal: size * size - 1, carrots: [] };
  // Choose a real reachable destination 18–26 steps away, avoiding a long adult maze.
  const candidates = links
    .map((_, i) => ({ cell: i, path: mazePath(maze, 0, i) }))
    .filter((p) => p.path.length >= 19 && p.path.length <= 27);
  maze.goal = candidates.at(-1)?.cell ?? maze.goal;
  const path = mazePath(maze);
  maze.carrots = [
    ...new Set([1, 2, 3, 4, 5].map((n) => path[Math.floor(((path.length - 1) * n) / 6)])),
  ];
  const detours = links
    .map((_, i) => i)
    .filter(
      (i) => i !== maze.start && i !== maze.goal && !path.includes(i) && links[i].length === 1,
    );
  maze.carrots.push(...detours.slice(0, 2));
  return maze;
}
export function startMaze(maze: GardenMaze): MazeRun {
  return { position: maze.start, picked: [], visited: [maze.start], won: false };
}
export function stepMaze(maze: GardenMaze, run: MazeRun, direction: Direction): MazeRun {
  if (run.won) return run;
  const next = mazeNeighbor(maze.size, run.position, direction);
  if (!maze.links[run.position].includes(next)) return run;
  return {
    position: next,
    picked:
      maze.carrots.includes(next) && !run.picked.includes(next)
        ? [...run.picked, next]
        : run.picked,
    visited: run.visited.includes(next) ? run.visited : [...run.visited, next],
    won: next === maze.goal,
  };
}
export function mazeCarrots(run: MazeRun, finished = false) {
  return run.picked.length + (run.won ? 2 : 0) + (finished ? 2 : 0);
}
