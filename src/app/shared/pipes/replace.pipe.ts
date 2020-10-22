import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace'
})
export class ReplacePipe implements PipeTransform {

  transform(value: string, replaceText: string, withText: string='', replaceCount:number=1): any {
    if (!replaceCount) { return value.split(replaceText).join(withText); }
    let replacedValue = value;
    for (let i = 0; i < replaceCount; i++) {
      replacedValue = replacedValue.replace(replaceText, withText);
    }
    return replacedValue;
  }

}
