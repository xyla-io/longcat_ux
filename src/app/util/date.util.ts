export interface UTCScheduleEntry {
  minute: number;
  hour: number;
}

export class DateUtil {

  /**
   * Convert a UTC ISO-8601 time string to
   * a standard format to use for display in common
   * places across the app.
   */
  static formatDateAndTime(utcString: string, { hideTime }: {
    hideTime?: boolean
  } = {}) {
    if (!utcString) { return null; }
    let date = new Date(utcString);
    let dateString = date.toLocaleDateString('en-US');
    let timeString = hideTime ? '' : date.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
    if (timeString.startsWith('0')) { timeString = timeString.slice(1); }
    return `${dateString}${timeString ? ' at ' + timeString : ''}`;
  }

  /**
   * Convert UTC time values of the form
   * {
   *   minute: 16
   *   hour: 30
   * }
   * to a time string of the form '1:30 PM'
   * (in the user's local timezone)
   */
  static convertUTCScheduleEntryToFormattedLocal(utcScheduleEntry: UTCScheduleEntry) {
    let today = new Date();
    let utc = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      utcScheduleEntry.hour,
      utcScheduleEntry.minute,
      0,
    ));
    let [localH, localM, remainder]= utc.toLocaleTimeString().split(':');
    let [localS, meridian] = remainder.split(' ');
    let formatted  = `${localH}:${localM} ${meridian}`;
    return formatted;
  }

  /**
   * Get the timezone string for the user browser, e.g. 
   * '(America/Detroit)'
   */
  static userTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * Sort function to pass to Array.sort() for times in
   * the format '7:00 PM', '11:OO AM' etc.
   */
  static dailyTimesSorter(a: string, b: string): number {
    if (a.includes('AM') && b.includes('PM')) { return -1; }
    if (a.includes('PM') && b.includes('AM')) { return 1; }
    let [hourA, minuteA] = a.split(':').map(parseInt);
    let [hourB, minuteB] = b.split(':').map(parseInt);
    if (hourA === hourB) {
      if (minuteA < minuteB) { return -1; }
      if (minuteA > minuteB) { return 1; }
      return 0;
    }
    if (hourA === 12) { return -1; }
    if (hourB === 12) { return 1; }
    if (hourA > hourB) { return 1; }
    return -1;
  }
}

