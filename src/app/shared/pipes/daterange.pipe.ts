import { Pipe, PipeTransform } from '@angular/core';
import { DaterangeService } from 'src/app/dashboard/services/daterange.service';
import { Daterange } from 'src/app/dashboard/interfaces/query';

@Pipe({
  name: 'daterange'
})
export class DaterangePipe implements PipeTransform {

  transform(daterange: Daterange|null|undefined, ...args: any[]): string {
    return DaterangeService.displayDaterange(daterange);
  }

}
