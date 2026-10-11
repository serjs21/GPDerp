type DefaultedProps<P, D> = Omit<P, keyof D> & {
  [K in keyof D & keyof P]-?: Exclude<P[K], undefined>;
};

/**
 * Resolve optional props against a typed defaults object with destructuring-default semantics:
 * only `undefined` falls back (`null`, `false`, `0`, `""` are kept).
 *
 * Take object/array/function props from `props` itself, not from this result: React Compiler treats
 * values read off the returned (fresh) object as mutable and skips memoizing what depends on them.
 */
export function withDefaults<P extends object, D extends Partial<P>>(
  props: P,
  defaults: D,
): DefaultedProps<P, D> {
  const resolved: Record<string, unknown> = { ...(props as Record<string, unknown>) };
  for (const [key, value] of Object.entries(defaults)) {
    if (resolved[key] === undefined) resolved[key] = value;
  }
  return resolved as DefaultedProps<P, D>;
}
