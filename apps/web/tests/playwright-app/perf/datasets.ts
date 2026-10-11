/**
 * Seeded, deterministic datasets for collection benchmarks. Same seed + size → identical data,
 * so before/after runs compare the same work.
 */

export const DATASET_TIERS = [100, 1_000, 10_000] as const;
export const DEFAULT_SEED = 20261012;

const BASE_TIME = Date.UTC(2026, 0, 1);
const WORDS = [
  "moon", "pine", "river", "ember", "frost", "lotus", "cedar", "dawn", "mist", "stone",
  "willow", "crane", "plum", "tide", "ash", "reed", "maple", "heron", "snow", "bloom",
];
const COLORS = ["#ffca91", "#6b8f71", "#d8d2c8", "#8fa3c9", "#c97a7a", "#e2c65b"];
const SHAPES = ["classic", "sharp", "soft", "circle", "square", "thought"];

/** mulberry32 PRNG. */
export function createRandom(seed = DEFAULT_SEED) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(random: () => number, items: readonly T[]): T {
  return items[Math.floor(random() * items.length)]!;
}

const isoAt = (index: number) => new Date(BASE_TIME + index * 3_600_000).toISOString();

/** Label names stay within COMIC_LABEL_NAME_MAX (15 chars). */
function labelName(random: () => number, index: number) {
  return `${pick(random, WORDS)}${index.toString(36)}`.slice(0, 15);
}

export function makeLabels(size: number, accountId: string, seed = DEFAULT_SEED) {
  const random = createRandom(seed);
  return Array.from({ length: size }, (_, index) => {
    const connected = Math.floor(random() * 4);
    return {
      id: `label-${index}`,
      name: labelName(random, index),
      color: pick(random, COLORS),
      shape: pick(random, SHAPES),
      accountId,
      createdAt: isoAt(index),
      connectedHaikus: {
        total: connected,
        items: Array.from({ length: Math.min(connected, 3) }, (_, h) => ({
          id: `haiku-${index}-${h}`,
          title: `${pick(random, WORDS)} ${pick(random, WORDS)}`,
          body: `${pick(random, WORDS)} ${pick(random, WORDS)}\n${pick(random, WORDS)}`,
        })),
      },
    };
  });
}

export function makeShareLinks(size: number, seed = DEFAULT_SEED) {
  const random = createRandom(seed);
  return Array.from({ length: size }, (_, index) => {
    const maxViews = random() < 0.3 ? 10 : null;
    return {
      id: `share-${index}`,
      shareHash: `hash${index.toString(36)}`,
      shareUrl: `http://localhost/share/hash${index.toString(36)}`,
      haikuSubject: `${pick(random, WORDS)} ${pick(random, WORDS)}`,
      createdAt: isoAt(index),
      expirationDate: random() < 0.2 ? isoAt(index + 720) : null,
      maxViews,
      viewCount: Math.floor(random() * 12),
      disabled: random() < 0.1,
      deactivationReason: null,
      showLabels: random() < 0.5,
    };
  });
}

export function makeHaikus(size: number, accountId: string, seed = DEFAULT_SEED) {
  const random = createRandom(seed);
  return Array.from({ length: size }, (_, index) => ({
    id: `haiku-${index}`,
    title: `${pick(random, WORDS)} ${pick(random, WORDS)}`,
    titleSuffix: 0,
    body: `${pick(random, WORDS)} ${pick(random, WORDS)}\n${pick(random, WORDS)}\n${pick(random, WORDS)}`,
    createdAt: isoAt(index),
    accountId,
    createdById: "user-1",
    labels: [],
  }));
}

/** Slice a dataset like the API's offset/pageSize pagination. */
export function pageOf<T>(items: T[], offset: number, pageSize: number) {
  return { items: items.slice(offset, offset + pageSize), total: items.length, pageSize, offset };
}
