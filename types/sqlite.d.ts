declare module 'sqlite3' {
  export interface Database {
    run(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }>;
    get(sql: string, params?: any[]): Promise<any>;
    all(sql: string, params?: any[]): Promise<any[]>;
    exec(sql: string): Promise<void>;
    close(): Promise<void>;
  }
}

declare module 'sqlite' {
  export interface OpenConfig {
    filename: string;
    driver: any;
  }
  
  export function open(config: OpenConfig): Promise<Database>;
}
