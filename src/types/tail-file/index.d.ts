declare module 'tail-file' {

  class TailFile {

    constructor(filePath: string, options?: { startPos?: 'start' | 'end' } | ((line: string) => void));

    start(): Promise<void>;
    stop(): Promise<void>;

    on(event: 'line', listener: (line: string) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
  }

  export default TailFile;
}