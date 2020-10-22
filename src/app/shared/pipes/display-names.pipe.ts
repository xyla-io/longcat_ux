import { Pipe, PipeTransform } from '@angular/core';
import { OptionConfig } from 'src/app/iomap/util/options';

export interface DisplayNamesPipeOptions {
  makeDisplayName?(name: string): string;
  delimiter?: string;
  default?: string;
}

@Pipe({
  name: 'displayNames'
})
export class DisplayNamesPipe implements PipeTransform {

  transform(values: string[], optionConfigRecord: Record<string, OptionConfig<any>>|Record<string, OptionConfig<any>>[], options: DisplayNamesPipeOptions = {}): any {
    const delimiter = typeof options.delimiter === 'string' ? options.delimiter : ', ';
    if (!values || !values.length) {
      return typeof options.default === 'string' ? options.default : '';
    }

    const getOptionConfig = (key: string, recordOrRecords: Record<string, OptionConfig<any>>|Record<string, OptionConfig<any>>[]) => {
      if (Array.isArray(recordOrRecords)) {
        for (let record of recordOrRecords) {
          const optionConfig = getOptionConfig(key, record);
          if (optionConfig) { return optionConfig; }
        }
        return undefined;
      }
      return recordOrRecords && recordOrRecords[key];
    };

    return values.map(v => {
      if (options.makeDisplayName) { return options.makeDisplayName(v); }
      const optionConfig = getOptionConfig(v, optionConfigRecord);
      if (optionConfig) { return optionConfig.displayName; }
      return v;
    }).join(delimiter)
  }

}
