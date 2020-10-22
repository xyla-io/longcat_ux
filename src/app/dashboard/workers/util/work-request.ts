export type WorkRequest = object;

export interface WorkResult {
  uuid: string;
  success: boolean;
  result?: any;
  error?: Error;
}
