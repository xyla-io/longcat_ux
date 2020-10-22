export interface URLProvider {
  getURL(key: string): Promise<string>;
  getResourceName(key: string): string;
  getDisplayName(key: string): string;
}
