import { Injectable } from '@angular/core';
import { Daterange, StartEnd } from 'src/app/dashboard/interfaces/query';

@Injectable({
  providedIn: 'root'
})
export class DaterangeService {

  static isStartEnd(obj: any): obj is StartEnd {
    return typeof obj === 'object' && obj.start && obj.end;
  }

  static displayDaterange(daterange: Daterange): string {
    if (!daterange) { return 'All dates'; }
    const { unit, value } = daterange;
    if (DaterangeService.isStartEnd(value)) {
      const toDateString = (date: Date): string[] => {
        const [ , month, day, year] = date.toDateString().split(' ');
        return [day, month, year];
      };
      const displayFrom = toDateString(new Date(value.start));
      const displayTo = toDateString(new Date(value.end));
      [2, 1].every(index => {
        if (displayFrom[index] === displayTo[index]) {
          displayFrom.splice(index, 1);
          return true;
        }
        return false;
      });
      return [
        displayFrom.join(' '),
        '–',
        displayTo.join(' '),
      ].join(' ');
    }
    return `Past ${value} ${unit}s`;
  }

  constructor() { }

}
