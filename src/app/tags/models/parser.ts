import { ChannelEnum } from "src/app/iomap/models/channel";
import { EntityEnum, EntityOps } from "src/app/iomap/models/entity";
import { OptionConfig } from "src/app/iomap/util/options";
import { cloneDeep } from "lodash-es";
import { PatternPosition } from "src/app/util/pattern-matching";

export enum IOParserTypeEnum {
  Switch = 'iomap.io_channel.parse/IOSwitchParser',
  Sequence = 'iomap.io_channel.parse/IOSequenceParser',
  Regex = 'iomap.io_channel.parse/IORegexParser',
}

export interface IOParser {
  key_map: {
    construct: any;
    map: IOParserTypeEnum;
  };
  name?: string;
  url?: string;
}

export interface IOSequenceParser extends IOParser {
  key_map: {
    construct: {
      delimiter: string;
      targets: IOSequenceParserTarget[];
    };
    map: IOParserTypeEnum.Sequence;
  };
}

export interface IORegexParser extends IOParser {
  key_map: {
    construct: {
      targets: IORegexParserTarget[];
    };
    map: IOParserTypeEnum.Regex;
  }
}

export interface IOSwitchParser extends IOParser {
  key_map: {
    construct: {
      parser_identifier_key_map: {
        iokeymap: string;
        output: {
          parser_identifier: string;
        }
      };
      parser_provider_key_map: string;
    }
    map: IOParserTypeEnum.Switch;
  }
}

export interface IdentifierParser extends IORegexParser {
  key_map: {
    construct: {
      targets: {
        pattern: string;
        label: 'str.parser_identifier';
      }[];
    };
    map: IOParserTypeEnum.Regex;
  }
}

export enum IOSequenceParserDelimiterEnum {
  Underscore = '_',
  Hyphen = '-',
  Comma = ',',
  Period = '.',
  Pipe = '|',
  Space = ' ',
  Colon = ':',
}
export interface IOSequenceParserTarget {
  index: number;
  label: string;
}

export interface IORegexParserTarget {
  pattern: string;
  label: string;
  replacement?: string;
}

export interface MakeTagParserName {
  channel: ChannelEnum;
  entityLevel: EntityEnum;
  parserKey: string;
}

export interface MakeIdentifierParserName {
  channel: ChannelEnum;
  entityLevel: EntityEnum;
}

export interface MakeSwitchParserName {
  channel: ChannelEnum;
  entityLevel: EntityEnum;
}

export interface MakeSequenceParser {
  delimiter: IOSequenceParserDelimiterEnum,
  sequentialCategoryNames: string[],
}

export interface MakeRegexParser {
  targets: IORegexParserTarget[];
}

export interface MakeSwitchParser {
  identifierParserName: string;
}

export interface CreateParserEvent {
  channel: ChannelEnum;
  entityLevel: EntityEnum;
  parserKey: string;
  parserKeyPatternPosition: PatternPosition;
}

export class ParserOps {

  static delimiterOptions: Record<IOSequenceParserDelimiterEnum, OptionConfig<any>> = {
    [IOSequenceParserDelimiterEnum.Underscore]: { displayName: 'underscore' },
    [IOSequenceParserDelimiterEnum.Hyphen]: { displayName: 'hyphen' },
    [IOSequenceParserDelimiterEnum.Comma]: { displayName: 'comma' },
    [IOSequenceParserDelimiterEnum.Period]: { displayName: 'period' },
    [IOSequenceParserDelimiterEnum.Pipe]: { displayName: 'pipe' },
    [IOSequenceParserDelimiterEnum.Space]: { displayName: 'space' },
    [IOSequenceParserDelimiterEnum.Colon]: { displayName: 'colon' },
  };

  static get defaultDelimiter() {
    return IOSequenceParserDelimiterEnum.Underscore;
  }

  static get parserNameSeparator() {
    return '-';
  }

  static sequenceParserKey(parserOrName: IOSequenceParser) {
    let parserName: string = typeof parserOrName === 'object' ? parserOrName.name : parserOrName;
    return parserName.split(ParserOps.parserNameSeparator).slice(-1)[0];
  }

  static sequenceParserChannel(parser: string|IOSequenceParser): ChannelEnum {
    let parserName: string = typeof parser === 'object' ? parser.name : parser;
    return parserName.split(ParserOps.parserNameSeparator)[0] as ChannelEnum;
  }

  static sequenceParserEntityLevel(parserOrName: string|IOSequenceParser): EntityEnum {
    let parserName: string = typeof parserOrName === 'object' ? parserOrName.name : parserOrName;
    return parserName.split(ParserOps.parserNameSeparator)[1] as EntityEnum;
  }

  static sequenceParserDelimiter(parser: IOSequenceParser): IOSequenceParserDelimiterEnum {
    return parser.key_map.construct.delimiter.replace('str.', '') as IOSequenceParserDelimiterEnum;
  }

  static sequenceParserPatternPosition(parsers: IOParser[], parser: IOSequenceParser) {
    const channel = ParserOps.sequenceParserChannel(parser);
    const entityLevel = ParserOps.sequenceParserEntityLevel(parser);
    const identifierParser = ParserOps.findOrMakeIdentifierRegexParser(parsers, {
      channel,
      entityLevel
    })
    const identifierParserTarget = ParserOps.findIdentifierParserTarget(identifierParser, parser.name);
    if (identifierParserTarget.pattern.replace('str.', '').startsWith('^')) {
      return PatternPosition.Prefix;
    }
    return PatternPosition.Suffix;
  }

  static sequenceParserCategoryNames(parser: IOSequenceParser) {
    return parser.key_map.construct.targets.reduce((categories, t) => {
      categories[t.index] = t.label.replace('str.', '');
      return categories;
    }, []);
  }
 
  static sequenceParserSample(sequenceParser: IOSequenceParser, parsers: IOParser[]): {
    categoryNames: string[]
    delimiter: string;
    parserKeyIndex: number;
  } {
    const emptySample = () => {
      return {
        categoryNames: [],
        delimiter: '',
        parserKeyIndex: 0,
      }
    }
    if (!sequenceParser || !sequenceParser.key_map) {
      // console.error('Invalid sequence parser', sequenceParser);
      return emptySample();
    }
    const categoryNames = sequenceParser.key_map.construct.targets.reduce((arr, target) => {
      arr[target.index] = target.label.replace('str.', '');
      return arr;
    }, [])

    const channel = ParserOps.sequenceParserChannel(sequenceParser);
    const entityLevel = ParserOps.sequenceParserEntityLevel(sequenceParser);
    const regexParser = ParserOps.findOrMakeIdentifierRegexParser(parsers, {
      channel, entityLevel
    })
    const regexParserTarget = ParserOps.findIdentifierParserTarget(regexParser, sequenceParser.name);
    if (!regexParserTarget) {
      // console.error('No identifier parser target found for sequence parser:', sequenceParser.name);
      return emptySample();
    }
    const pattern = regexParserTarget.pattern.replace('str.', '');
    const delimiter = sequenceParser.key_map.construct.delimiter.replace('str.', '')
    let parserKeyIndex = 0;
    if (pattern.startsWith('^')) {
      categoryNames[0] = pattern.replace('^', '').replace(ParserOps.escapeDelimiter(delimiter), '');
    } else if (pattern.endsWith('$')) {
      categoryNames.push(pattern.replace('$', '').replace(ParserOps.escapeDelimiter(delimiter), ''));
      parserKeyIndex = categoryNames.length - 1;
    }
    return {
      categoryNames,
      delimiter,
      parserKeyIndex,
    };
  }

  static makeSwitchParserName(args: MakeSwitchParserName) {
    return [args.channel, args.entityLevel].join(ParserOps.parserNameSeparator);
  }

  static makeIdentifierParserName(args: MakeIdentifierParserName) {
    return [args.channel, args.entityLevel, 'identifier'].join(ParserOps.parserNameSeparator);
  }

  static makeTagParserName(args: MakeTagParserName) {
    return [args.channel, args.entityLevel, 'tag', args.parserKey].join(ParserOps.parserNameSeparator);
  }

  static isTagParserName(name: string) {
    return name.split(ParserOps.parserNameSeparator).slice(-2)[0] === 'tag';
  }

  static makeSequenceParser(args: MakeSequenceParser): IOSequenceParser {
    return {
      key_map: {
        map: IOParserTypeEnum.Sequence,
        construct: {
          delimiter: `str.${args.delimiter}`,
          targets: (args.sequentialCategoryNames || [])
            .map((name, i) => ( name ? { index: i, label: `str.${name}` } : null))
            .filter(Boolean),
        },
      },
    };
  }

  static checkParserKeyCollision(parsers: IOParser[], nameArgs: MakeTagParserName) {
    const parserName = ParserOps.makeTagParserName(nameArgs);
    return !!parsers.find(p => p.name === parserName);
    
  }

  /**
   * Look throught an existing parsers array and find the next available parser key name
   * within a given keyspace. Parser key names are assemebled by joining the keyspace and the
   * next available index.
   * 
   * @param parsers - the array of parsers to find the next key from
   * @param nameArgs - arguments that specify how the parser key should be constructed
   */
  static nextParserKey(parsers: IOParser[], nameArgs: MakeTagParserName, companyIdentifier: string) {
    const keyspace = nameArgs.parserKey || EntityOps.entityOptions[nameArgs.entityLevel].defaultTaggingKeyspace(companyIdentifier[0]);
    const parserKeyPattern = ParserOps.makeTagParserName({
      ...nameArgs,
      parserKey: keyspace
    });
    const [ lastParserKeyIndex ] = parsers
      .filter(p => p.name.startsWith(parserKeyPattern))
      .map(p => p.name.replace(parserKeyPattern, ''))
      .map(Number)
      .filter(n => !isNaN(n))
      .sort((a, b) => a > b ? -1 : 1);
    
    return `${keyspace}${(lastParserKeyIndex === undefined) ? 1 : lastParserKeyIndex + 1}`
  }

  /**
   * Make a an identifier-style IORegexParser (pre-populated with default target)
   * 
   * @param args.targets - the targets to add to the newly made parser
   * @returns the newly made IORegexParser with the required targets included
   */
  static makeIdentifierRegexParser(args: MakeRegexParser): IORegexParser {
    return {
      key_map: {
        map: IOParserTypeEnum.Regex,
        construct: {
          targets: [
            ParserOps.makeIdentifierParserTarget({ matchPattern: '', delimiter: ParserOps.defaultDelimiter })
          ].concat(ParserOps.qualifyAllValues('str', args.targets))
        }
      }
    }
  }

  static hasIdentifierRegexParserTarget(parsers: IOParser[], parser: IOSequenceParser) {
    const channel = ParserOps.sequenceParserChannel(parser);
    const entityLevel = ParserOps.sequenceParserEntityLevel(parser);
    const identifierParser = ParserOps.findIdentifierRegexParser(parsers, { channel, entityLevel });
    if (!identifierParser) { return false; }
    const identifierParserTarget = ParserOps.findIdentifierParserTarget(identifierParser, parser.name);
    return !!identifierParserTarget;
  }

  /**
   * Look for a parser in an array of parser matching the provided name arguments
   * 
   * @param parsers - the array of parsers to search through
   * @param nameArgs - the arguments that define the name pattern to search for
   * @returns the IORegexParser that was found, or undefined if not found
   */
  static findIdentifierRegexParser(parsers: IOParser[], nameArgs: MakeIdentifierParserName): IORegexParser|undefined {
    const name = ParserOps.makeIdentifierParserName(nameArgs);
    const parser = parsers.find(p => p.name === name);
    return parser as IORegexParser;
  }

  /**
   * Look for a parser in an array of parser matching the provided name arguments, or create one if necessary
   * 
   * @param parsers - the array of parsers to search through
   * @param nameArgs - the arguments that define the name pattern to search for or create
   * @returns the IORegexParser that was found or created
   */
  static findOrMakeIdentifierRegexParser(parsers: IOParser[], nameArgs: MakeIdentifierParserName): IORegexParser {
    const parser = ParserOps.findIdentifierRegexParser(parsers, nameArgs);
    if (parser) {
      return parser as IORegexParser;
    }
    return ParserOps.makeIdentifierRegexParser({ targets: [] })
  }

  /**
   * Look for a target entry in an IORegexParser that matches the provided parser name
   * 
   * @param parser - the parser to search for the target entry
   * @param sequenceParserName - the name of the parser to search for (in each target's replacement property)
   */
  static findIdentifierParserTarget(parser: IORegexParser, sequenceParserName: string): IORegexParserTarget|undefined {
    return parser.key_map.construct.targets.find(t => t.replacement === `str.${sequenceParserName}`);
  }

  /**
   * Adjust one of the targets on an IORegexParser by copying, updating, and returning the parser
   * 
   * @param parser - the IORegexParser to return an updated version of
   * @param target - the entry in the key_map.construct.targets array to update
   * @param remove - whether the target entry should be removed instead of updated
   * @returns the updated copy of the IORegexParser
   */
  static copyAndUpdateIdentifierRegexParser(parser: IORegexParser, updatedTarget: IORegexParserTarget, remove=false): IORegexParser {
    const copiedParser = cloneDeep(parser);
    const oldTargetIndex = copiedParser.key_map.construct.targets.findIndex(t => t.replacement === updatedTarget.replacement);
    if (~oldTargetIndex) {
      if (remove === true) {
        copiedParser.key_map.construct.targets.splice(oldTargetIndex, 1);
      } else {
        copiedParser.key_map.construct.targets.splice(oldTargetIndex, 1, updatedTarget);
      }
    } else {
      copiedParser.key_map.construct.targets.push(updatedTarget);
    }
    return copiedParser;
  }

  /**
   * Make a target entry for an identifier-type IORegexParser
   * 
   * @param args.matchPattern - the string identifier pattern to match
   * @param args.delimiter - the delimiter that is used in the related sequence parser
   * @param args.patternPosition - the PatternPosition (Prefix or Suffix) where the match must occur
   * @param args.replacementParserName - the name of the IOSequenceParser to use when a match occurs
   * @returns the target entry that can be added to an IORegexParser
   */
  static makeIdentifierParserTarget(args: {
    matchPattern: string,
    delimiter: string,
    patternPosition?: PatternPosition,
    replacementParserName?: string,
  }): IORegexParserTarget {
    const escapedDelimiter = ParserOps.escapeDelimiter(args.delimiter);
    const target = {
      pattern: args.matchPattern === '' ? 'str.' : `str.${
        args.patternPosition === PatternPosition.Prefix ? '^' : escapedDelimiter
      }${args.matchPattern}${
        args.patternPosition === PatternPosition.Suffix ? '$' : escapedDelimiter
      }`,
      replacement: args.replacementParserName ? `str.${args.replacementParserName}` : undefined,
      label: `str.parser_identifier`
    };
    return target;
  }

  /**
   * Make a new IOSwitchParser object
   */
  static makeSwitchParser(args: MakeSwitchParser): IOSwitchParser {
    return {
      key_map: {
        construct: {
          parser_identifier_key_map: {
            iokeymap: `iokeymap.map://tag_parser/${args.identifierParserName}`,
            output: {
              parser_identifier: 'str.run.parser_identifier',
            }
          },
          parser_provider_key_map: 'iokeymap.parser_provider',
        },
        map: IOParserTypeEnum.Switch,
      }
    };
  }
  /**
   * Append a qualifier prefix to the beginning of each string property in an array of objects
   * 
   * @param prefix - the prefix to join with a period to the beginning of each property that is a string
   * @param records - the array of any objects that need all their string properties qualified with the prefix
   * @return a copy of the input array of objects with their top-level strings modified to use the qualifier prefix
   */
  private static qualifyAllValues<T>(prefix='str', records: T[]): T[] {
    return records.map(t => Object.entries(t).reduce((o, [k, v]) => {
      if (typeof v === 'string') {
        o[k] = `${prefix}.${v}`;
      } else {
        o[k] = v;
      }
      return o;
    }, {} as T));
  }

  private static escapeDelimiter(delimiter: string) {
    const matchPatternReplacements = [
      ['|', '\\|'],
      ['.', '\\.'],
    ];
    return matchPatternReplacements.reduce((escaped, [a, b]) => {
      return escaped.replace(a, b);
    }, delimiter);
  }

  private static unescapeDelimiter(delimiter: string) {
    const matchPatternReplacements = [
      ['\\|', '|'],
      ['\\.', '.'],
    ];
    return matchPatternReplacements.reduce((escaped, [a, b]) => {
      return escaped.replace(a, b);
    }, delimiter);
  }
}