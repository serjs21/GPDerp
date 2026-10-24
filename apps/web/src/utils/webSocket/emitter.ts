/** Minimal listener set: `add` returns its own unsubscribe. */
export function createEmitter<Args extends unknown[]>() {
  const listeners = new Set<(...args: Args) => void>();
  return {
    add(listener: (...args: Args) => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    emit(...args: Args) {
      listeners.forEach((listener) => listener(...args));
    },
  };
}
