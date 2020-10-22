import { OptionConfig } from "../util/options";

export enum PlatformEnum {
  IOS = 'ios',
  Android = 'android',
}

export interface PlatformOptionConfig extends OptionConfig<any> {
  displayName: string;
}

export class PlatformOps {
  static platformOptions: Record<PlatformEnum, PlatformOptionConfig> = Object.freeze({
    [PlatformEnum.IOS]: {
      displayName: 'iOS',
    },
    [PlatformEnum.Android]: {
      displayName: 'Android',
    },
  });
}