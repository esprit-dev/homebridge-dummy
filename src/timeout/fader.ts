export class Fader {

  public value: number | undefined;
  private intervalTimeout?: NodeJS.Timeout;

  public get isFading(): boolean {
    return this.value !== undefined;
  }

  public start(startingValue: number, endingValue: number, delay: number, tick: (value: number) => void) {

    this.clearTimeout();

    const interval = delay / Math.abs(endingValue - startingValue);
    this.value = startingValue;

    const delta = startingValue < endingValue ? 1 : -1;

    this.intervalTimeout = setInterval( () => {

      if (this.value === undefined) {
        return;
      }

      this.value += delta;
      tick(this.value);

      if (this.value === endingValue) {
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