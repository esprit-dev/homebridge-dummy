import ping from 'ping';

import { strings } from '../i18n/i18n.js';

import { TimeUnits } from '../model/enums.js';

import { getDelay } from '../timeout/timeout.js';

import { Log } from '../tools/log.js';

type ReachabilityCallback = (reachable: boolean) => (void);

export class Reachability {

  private host: string;

  protected timeout?: NodeJS.Timeout;

  private _alive?: boolean;

  constructor(
    private readonly log: Log,
    host: string,
    interval: number | undefined,
    units: TimeUnits | undefined,
    private readonly callback: ReachabilityCallback,
  ) {

    this.host = this.normalizeHost(host);

    const delay = getDelay(interval ?? 60, units ?? TimeUnits.SECONDS);
    this.timeout = setInterval(() => {
      this.ping();
    }, delay);

    this.ping();
  }

  public teardown() {
    clearInterval(this.timeout);
    this.timeout = undefined;
  }

  private set alive(value: boolean) {

    if (this._alive !== value) {
      this.log.ifVerbose(value ? strings.reachability.reachable : strings.reachability.unreachable, `'${this.host}'`);
      this.callback(value);
    }

    this._alive = value;
  }

  private async ping() {
    try {
      const response = await ping.promise.probe(this.host);
      this.alive = response.alive;
    } catch (err) {
      this.log.error(strings.reachability.pingError, err);
      this.teardown();
    }
  }

  private normalizeHost(input: string) {
    try {
      const url = new URL(input.includes('://') ? input : `http://${input}`);
      return url.hostname;
    } catch {
      return input;
    }
  }
}
