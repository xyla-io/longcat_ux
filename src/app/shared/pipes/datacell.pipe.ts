import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datacell'
})
export class DatacellPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    const asNumber = Number(value);
    if (isNaN(asNumber)) { return value; }
    return asNumber.toLocaleString('en');
  }

}
