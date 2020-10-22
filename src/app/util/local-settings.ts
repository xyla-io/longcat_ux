export class LocalSettings {

  static hasLoaded: string[] = [];

  static load(key: string): any {
    let value;
    if (!LocalSettings.hasLoaded.includes(key)) {
      LocalSettings.hasLoaded.push(key);
      value = localStorage.getItem(key);
    } else {
      value = sessionStorage.getItem(key);
    }
    return value ? JSON.parse(value) : value;
  }

  static save(key: string, value: any) {
    if (value !== null && value !== undefined) {
      const stringValue = JSON.stringify(value);
      sessionStorage.setItem(key, stringValue);
      localStorage.setItem(key, stringValue);
    } else {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    }
  }

  static drop() {
    localStorage.clear();
    sessionStorage.clear();
  }

}