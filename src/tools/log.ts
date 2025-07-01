/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from 'homebridge';

export enum LogType {
  ALWAYS,
  WARNING,
  ERROR,
}

export class Log {

  constructor(
    private readonly logger: Logger,
  ) {}

  public always(message: string, ...parameters: any[]) {
    this.logger.info(message, ...parameters);
  }

  public warning(message: string, ...parameters: any[]) {
    this.logger.warn(message, ...parameters);
  }

  public error(message: string, ...parameters: any[]) {
    this.logger.error(message, ...parameters);
  }

  public success(message: string, ...parameters: any[]) {
    this.logger.success(message, ...parameters);
  }
}