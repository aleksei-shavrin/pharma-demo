/**
 * Synchronous monotonic sequence allocator.
 * Independent of React state/render timing — safe for concurrent runLoad.
 */
export type SeqAllocator = () => number;

export function createMonotonicSeq(start = 0): SeqAllocator {
  let current = start;
  return () => {
    current += 1;
    return current;
  };
}
