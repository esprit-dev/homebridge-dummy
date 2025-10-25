export class Fader {

  public value: number | undefined;
  private intervalTimeout?: NodeJS.Timeout;

  public get isFading(): boolean {
    return this.value !== undefined;
  }

  public start(startingValue: number, delay: number, tick: (value: number) => void) {

    this.clearTimeout();

    const interval = delay / startingValue;
    this.value = startingValue;

    this.intervalTimeout = setInterval( () => {

      if (this.value === undefined) {
        return;
      }

      tick(--this.value);

      if (this.value <= 0) {
        this.clearTimeout();
      }

    }, interval);
  }

  public cancel() {
    this.clearTimeout();
  }

  public teardown(): void {
    this.clearTimeout();
  }

  private clearTimeout() {
    this.value = undefined;

    clearInterval(this.intervalTimeout);
    this.intervalTimeout = undefined;
  }
}