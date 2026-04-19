declare module 'better-sqlite3' {
  export interface Options {
    readonlyMemory?: boolean;
    fileMustExist?: boolean;
    timeout?: number;
    verbose?: (...args: unknown[]) => void;
  }

  export default class Database {
    constructor(filename?: string, options?: Options);
  }
}
