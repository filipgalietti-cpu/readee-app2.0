// Deterministic seeded shuffle — SSR-safe (no Math.random at render time).
// ROOT FIX for "the first tile is always the answer": renderers shuffle their
// display order from a content-derived seed, so the order authors write options
// in (correct-first is natural when authoring) never leaks into the UI.
// Same seed → same order (stable hydration); different scene → different order.

function fnv(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = fnv(seed);
  const rand = () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** No correct partner starts directly opposite its source row. */
export function shuffledPartners<T>(original:T[],seed:string):T[] {
  if(original.length<2)return [...original];
  for(let attempt=0;attempt<32;attempt++) {
    const shuffled=seededShuffle(original,seed+":"+attempt);
    if(shuffled.every((value,index)=>value!==original[index]))return shuffled;
  }
  return [...original.slice(1),original[0]];
}

/** Spread equal destination groups through the source tray instead of pre-grouping answers. */
export function interleavedSortOrder(items:readonly {bucket:string}[],seed:string):number[] {
 const buckets=seededShuffle([...new Set(items.map(item=>item.bucket))],seed);
 const groups=buckets.map(bucket=>seededShuffle(items.flatMap((item,index)=>item.bucket===bucket?[index]:[]),seed+bucket));
 const result:number[]=[];
 for(let row=0;groups.some(group=>row<group.length);row++)for(const group of groups)if(row<group.length)result.push(group[row]);
 return result;
}
