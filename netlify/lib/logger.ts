import { randomUUID } from 'crypto';

export interface LogEntry {
  requestId: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: string;
  meta?: any;
}

class Logger {
  private requestId: string;

  constructor(requestId?: string) {
    this.requestId = requestId || randomUUID();
  }

  private log(level: LogEntry['level'], message: string, meta?: any) {
    const entry: LogEntry = {
      requestId: this.requestId,
      level,
      message,
      timestamp: new Date().toISOString(),
      meta,
    };
    
    // In production, Netlify automatically captures stdout/stderr
    // Tools like Datadog/New Relic can parse this JSON.
    console.log(JSON.stringify(entry));
  }

  public info(message: string, meta?: any) {
    this.log('INFO', message, meta);
  }

  public warn(message: string, meta?: any) {
    this.log('WARN', message, meta);
  }

  public error(message: string, error?: unknown) {
    this.log('ERROR', message, {
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error
    });
  }

  public getRequestId() {
    return this.requestId;
  }
}

export const createLogger = (requestId?: string) => new Logger(requestId);