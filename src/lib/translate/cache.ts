export class LruCache<T> {
  private entries = new Map<string, { value: T; expires: number }>();

  constructor(
    private readonly size: number,
    private readonly ttlMs: number,
  ) {}

  get(key: string, now = Date.now()) {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    this.entries.delete(key);
    if (entry.expires <= now) return undefined;
    this.entries.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T, now = Date.now()) {
    this.entries.delete(key);
    this.entries.set(key, { value, expires: now + this.ttlMs });
    while (this.entries.size > this.size) {
      const oldest = this.entries.keys().next().value;
      if (oldest === undefined) break;
      this.entries.delete(oldest);
    }
  }
}
