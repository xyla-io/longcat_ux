export interface RuleHistory {
  historyCreationDate: Date;
  lastDataCheckedDate: Date;
  historyType?: string;
  errorDescriptions: string[];
  actionCount: number;
  targetID: number;
  targetType: string;
  targetDescription: string;
  actionDescription: string;
  ruleID: string;
  ruleDescription: string;
  dryRun: boolean;
}
export enum RuleHistoryType {
  Action = 'action',
  Edited = 'edited',
  Execute = 'execute',
  Failed = 'failed',
  Error = 'error'
}