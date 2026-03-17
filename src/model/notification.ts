import axios from 'axios';

import { NotificationAPI } from './enums.js';
import { Notification } from './types.js';

import { DummyAddonDependency } from '../accessory/base.js';

import { strings } from '../i18n/i18n.js';

import { assert, isValid, printableValues } from '../tools/validation.js';

const DEFAULT_PUSH_ICON_URL = 'https://notifyicons.pingie.com/icons/mkpu3s46-6e8wy7gh.png';

export class NotificationManager {

  public static new(dependency: DummyAddonDependency, notification?: Notification): NotificationManager | undefined {

    if (!notification || !assert(dependency.log, dependency.caller, notification, 'api', 'token', 'id', 'text')) {
      return;
    }

    if (!isValid(NotificationAPI, notification.api)) {
      dependency.log.warning(strings.notification.badAPI, this.name, `'${notification.api}'`, printableValues(NotificationAPI));
    }

    return new NotificationManager(dependency, notification);
  }

  private constructor(private readonly dependency: DummyAddonDependency, private readonly notification: Notification) {}

  public async notify(): Promise<void> {

    switch (this.notification.api) {
    case NotificationAPI.PINGIE_NOTIFY:
      await this.pingieNotify();
      break;
    }
  }

  private async pingieNotify() {
    try {

      const endpoint = `https://notifypush.pingie.com/notify-json/${this.notification.id}`;

      const payload: Record<string, string | undefined> = {
        text: this.notification.text,
        title: this.notification.title,
        groupType: this.notification.groupType,
        iconUrl: this.notification.iconURL ?? DEFAULT_PUSH_ICON_URL,
      };

      const response = await axios.post(endpoint, payload,
        {
          headers: { 'Content-Type': 'application/json' },
          params: { token: this.notification.token },
          timeout: 10000,
          maxRedirects: 0,
          validateStatus: (status) => status < 500,
        },
      );

      payload.token = this.notification.token.substring(0, Math.min(5, this.notification.token.length)) + '…';
      this.dependency.log.ifVerbose(`${endpoint}\n${JSON.stringify(payload)}\n${JSON.stringify(response.data)}`);

      if (response.status !== 200) {
        const errorMessage = `${strings.notification.pushError} - ${response?.data?.message ?? response?.data?.error ?? 'unknown error'}`;
        this.dependency.log.warning(errorMessage, this.dependency.caller);
      } else if (!this.dependency.disableLogging) {
        this.dependency.log.always(strings.notification.pushSuccess, this.dependency.caller);
      }

    } catch (error) {
      this.dependency.log.error(strings.notification.pushError, this.dependency.caller, `\n${error}`);
    }
  }
}