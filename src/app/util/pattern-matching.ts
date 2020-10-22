import { OptionConfig } from "../iomap/util/options";

export enum PatternPosition {
  Prefix = 'prefix',
  Suffix = 'suffix',
}

export interface PatternPositionConfig extends OptionConfig<any> {
  displayName: string;
  isMatch: (pattern: string, value: string, caseSensitive?: boolean) => boolean;
}

export class PatternOps {
  static patternPositionOptions: Record<PatternPosition, PatternPositionConfig> = Object.freeze({
    [PatternPosition.Prefix]: {
      displayName: 'starts with',
      isMatch: (pattern: string, value: string, caseSensitive=true) => {
        return PatternOps.caseify(value, caseSensitive)
          .startsWith(PatternOps.caseify(pattern, caseSensitive));
      },
    },
    [PatternPosition.Suffix]: {
      displayName: 'ends with',
      isMatch: (pattern: string, value: string, caseSensitive=true) => {
        return PatternOps.caseify(value, caseSensitive)
          .endsWith(PatternOps.caseify(pattern, caseSensitive));
      },
    },
  });

  private static caseify(value: string, caseSensitive: boolean) {
    return caseSensitive ? value : value.toLowerCase();
  }
}
