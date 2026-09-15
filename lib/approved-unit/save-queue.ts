/** Preserve the exact in-flight payload on an ambiguous failure. Retry it before newer state. */
export class SaveQueue {
  revision: number;
  private pending: string | null = null;
  private uncertain: { state: string; revision: number } | null = null;
  private running: Promise<void> | null = null;
  constructor(
    revision: number,
    private send: (state: string, revision: number) => Promise<number>,
  ) {
    this.revision = revision;
  }
  enqueue(state: unknown) {
    this.pending = JSON.stringify(state);
  }
  get dirty() {
    return this.pending !== null || this.uncertain !== null || this.running !== null;
  }
  flush(): Promise<void> {
    if (this.running) return this.running;
    const job = async () => {
      while (this.pending !== null || this.uncertain) {
        const request = this.uncertain ?? { state: this.pending!, revision: this.revision };
        this.uncertain = request;
        this.revision = await this.send(request.state, request.revision);
        if (this.pending === request.state) this.pending = null;
        this.uncertain = null;
      }
    };
    this.running = job().finally(() => {
      this.running = null;
    });
    return this.running;
  }
}
