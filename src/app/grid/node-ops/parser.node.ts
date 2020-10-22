import { ChannelEnum } from "src/app/iomap/models/channel";
import { IOParser, IOSequenceParser, ParserOps, IOSequenceParserDelimiterEnum, CreateParserEvent } from "src/app/tags/models/parser";
import { cloneDeep } from "lodash-es";
import { EntityEnum } from "src/app/iomap/models/entity";
import { InternalTemplate, TemplateType } from "src/app/dashboard/interfaces/template";
import { RowNode } from "ag-grid-community";
import { PatternPosition } from "src/app/util/pattern-matching";

export type NodeableParser = IOSequenceParser;

export interface ParserNode extends NodeableParser {
  _id: string;
  isPlaceholder: boolean;
  parserName: string;
  channel: ChannelEnum;
  entityLevel: EntityEnum;
}

export interface TemplateTagParser extends InternalTemplate {
  metadata: {
    identifier: string,
    templateType: TemplateType.TagParser,
  };
  structure: TemplateTagParserStructure,
}

export interface TemplateTagParserStructure {
  delimiter: IOSequenceParserDelimiterEnum,
  channel: ChannelEnum,
  entityLevel: EntityEnum,
  parserKey: string,
  parserKeyPatternPosition: PatternPosition,
  sequentialCategoryNames?: string[]
}

export class ParserNodeOps {

  static parserIdPrefix = 'parser://';
  static isSibling(node: RowNode) {
    return typeof node.id === 'string' && node.id.startsWith(ParserNodeOps.parserIdPrefix);
  }
  static parserGroupId(parserName: string) { return `${ParserNodeOps.parserIdPrefix}${parserName}`; }
  static parserGroupIdFromNode(node: ParserNode) { return `${ParserNodeOps.parserIdPrefix}${node.parserName}`; }

  static makeNodesForTagParsers(parsers: IOParser[]) {
    return parsers
      // Only tag parsers
      .filter(p => ParserOps.isTagParserName(p.name))
      // Filter out if there isn't an identifier parser that targets it
      .filter(p => ParserOps.hasIdentifierRegexParserTarget(parsers, p as IOSequenceParser))
      .map((p: any) => ParserNodeOps.makeNodeFromParser(p));
  }

  static makeNodeFromParser(parser: NodeableParser): ParserNode {
    const nodeData: ParserNode = {
      ...cloneDeep(parser),
      _id: this.parserGroupId(parser.name),
      isPlaceholder: true,
      parserName: parser.name,
      channel: ParserOps.sequenceParserChannel(parser.name),
      entityLevel: ParserOps.sequenceParserEntityLevel(parser.name),
    };
    return nodeData;
  }

  /**
   * Make a Template for a parser from CreateParserEvent info
   * 
   * @param event - info about the parser being created
   */
  static makeTemplateFromCreateParserEvent(event: CreateParserEvent): TemplateTagParser {
    return {
      metadata: {
        identifier: ParserOps.makeTagParserName(event),
        templateType: TemplateType.TagParser,
      },
      structure: {
        delimiter: ParserOps.defaultDelimiter,
        channel: event.channel,
        entityLevel: event.entityLevel,
        parserKey: event.parserKey,
        parserKeyPatternPosition: event.parserKeyPatternPosition,
        sequentialCategoryNames: undefined,
      }
    }
  }

  /**
   * Make a Template for a parser combining information from a IOSequenceParser and any related parsers=
   * from the complete parser list
   * 
   * @param parsers - the list of parser to look in for parsers related to the main parser
   * @param parser - the main parser to build the template for
   */
  static makeTemplateFromParser(parsers: IOParser[], parser: IOSequenceParser): TemplateTagParser {

    const channel = ParserOps.sequenceParserChannel(parser);
    const entityLevel = ParserOps.sequenceParserEntityLevel(parser);

    return {
      metadata: {
        identifier: parser.name,
        templateType: TemplateType.TagParser,
      },
      structure: {
        delimiter: ParserOps.sequenceParserDelimiter(parser),
        channel: ParserOps.sequenceParserChannel(parser),
        entityLevel: ParserOps.sequenceParserEntityLevel(parser),
        parserKey: ParserOps.sequenceParserKey(parser),
        parserKeyPatternPosition: ParserOps.sequenceParserPatternPosition(parsers, parser),
        sequentialCategoryNames: ParserOps.sequenceParserCategoryNames(parser),
      }
    }

  }


}