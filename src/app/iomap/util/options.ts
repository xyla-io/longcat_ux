import { ChannelEnum } from "../models/channel";

export interface OptionConfig<T> {
  displayName?: string;
  channel?: ChannelEnum[];
  complement?: any;
  key?: string;
};

export interface OptionFilters {
  channel?: ChannelEnum;
}

export class Options {

  static from(keys: string[], options?: { makeDisplayName?: (key: string) => string}) {
    return keys.reduce((optionRecord, key) => {
      optionRecord[key] = { key, displayName: options && options.makeDisplayName ? options.makeDisplayName(key) : key }
      return optionRecord;
    }, {})
  }

  static complement<T extends string>(options: Record<string, OptionConfig<any>>, key: T): T {
    return (options[key].complement || key) as T;
  }

  static values<T>(options: Record<string, OptionConfig<T>>, optionFilters?: OptionFilters): OptionConfig<T>[] {
    return Options.filter(options, optionFilters, { fullObject: true }) as OptionConfig<T>[];
  }

  static keys<T>(options: Record<string, OptionConfig<T>>, optionFilters?: OptionFilters): string[] {
    return Options.filter(options, optionFilters, { fullObject: false }) as string[];
  }

  private static filter<T>(options: Record<string, OptionConfig<T>>, optionFilters?: OptionFilters, {
    fullObject,
  }: {
    fullObject?: boolean
  }={}): string[]|OptionConfig<T>[] {
    if (!optionFilters) {
      return fullObject ? Object.entries(options).map(([k, v]) => {
        v.key = k;
        return v;
      }): Object.keys(options);
    }
    const keys = Object.keys(options).filter(key => {
      return Object.keys(optionFilters).every(filterKey => {
        let filterTargets = options[key][filterKey];
        if (filterTargets) {
          return filterTargets.includes(optionFilters[filterKey]);
        }
        return true;
      });
    })
    return fullObject ? keys.map(k => {
      return { key: k, ...options[k]};
    }) : keys;
  }

  static formatter<T>(options: Record<string, Object>, labelKey:string='displayName') {
    return ({value}) => { 
      if (options[value] && options[value][labelKey]) {
        return options[value][labelKey];
      }
      return value;
    }
  }

  static trueKeys(record: Record<string, boolean>) {
    return Object.entries(record).filter(([k, v]) => !!v).map(([k]) => k);
  }

  static booleanModel(trueProperties: string[], falseProperties: string[]=[]): Record<string, boolean> {
    return trueProperties.reduce((model, prop) => {
      model[prop] = true;
      return model;
    }, falseProperties.reduce((model, prop) => {
      model[prop] = false;
      return model;
    }, {}));
  }
}