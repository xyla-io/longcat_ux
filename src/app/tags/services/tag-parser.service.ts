import { Injectable } from '@angular/core';
import { APIService, APIResponse } from 'src/app/services/api/api.service';
import { IOParser, ParserOps, CreateParserEvent, IOSequenceParser } from '../models/parser';
import { APILoaders, ObservableResult } from 'src/app/util/request-loaders/api-loaders';
import { SessionService } from 'src/app/services/api/session.service';
import { UserAlertService, UserAlertType } from 'src/app/services/alerts/user-alert.service';
import { Observable, Subject } from 'rxjs';
import { TemplateTagParserStructure } from 'src/app/grid/node-ops/parser.node';

export interface ListParsersResponse extends APIResponse {
  parsers: IOParser[];
}

type EntityName = string;
type TagCategory = string;
type TagValue = string;
export interface IdentifierParseNamesResponse extends APIResponse {
  name_tags: Record<EntityName, { parser_identifier: string }>;
}

export interface TagParseNamesResponse extends APIResponse {
  name_tags: Record<EntityName, Record<TagCategory, TagValue>>;
}

@Injectable({
  providedIn: 'root'
})
export class TagParserService {

  private apiLoaders: APILoaders;
  private static tagParsersLoaderKey = 'tagparsers';

  parserMutation$ = new Subject<IOParser>();
  parserDeletion$ = new Subject<string>();

  tagParsers: IOParser[];

  get tagParsers$(): Observable<ObservableResult<IOParser[]>> {
    return this.apiLoaders.getSharedObservable(TagParserService.tagParsersLoaderKey);
  }

  constructor(
    private api: APIService,
    private sessionService: SessionService,
    private userAlertService: UserAlertService,
  ) {

    this.apiLoaders = new APILoaders(this.sessionService);
    this.apiLoaders.createSharedObservable<IOParser[]>({
      loaderKey: TagParserService.tagParsersLoaderKey,
      callFunction: (companyIdentifier) => this.api.client.get(TagParserService.parsersURL(companyIdentifier)),
      responseHandler: (response: ListParsersResponse) => {
        this.tagParsers = response.parsers;
        return { result: response.parsers };
      },
      errorHandler: (error) => {
        console.error(error);
        this.userAlertService.postAlert({
          alertType: UserAlertType.error,
          header: 'Request Failed',
          body: 'There was a problem retrieving the list of tag parsers',
          autoCloseSeconds: 8,
        });
        return { result: [] };
      }
    });
  }

  refreshTagParsers() {
    this.apiLoaders.refreshLoader(TagParserService.tagParsersLoaderKey);
  }

  listParsers(): Promise<IOParser[]> {
    return this.api.client.get(TagParserService.parsersURL(this.sessionService.currentCompanyIdentifier))
      .toPromise()
      .then((response: ListParsersResponse) => {
        return response.parsers;
      })
  }

  async updateIdentifierParserName(sequenceParserName: string, structure: TemplateTagParserStructure) {
    const identifierParser = ParserOps.findOrMakeIdentifierRegexParser(this.tagParsers, structure);
    const updatedIdentifierParser = ParserOps.copyAndUpdateIdentifierRegexParser(
      identifierParser,
      ParserOps.makeIdentifierParserTarget({
        matchPattern: structure.parserKey,
        patternPosition: structure.parserKeyPatternPosition,
        replacementParserName: sequenceParserName,
        delimiter: structure.delimiter,
      })
    )
    const identifierParserName = ParserOps.makeIdentifierParserName(structure);
    await this.setParser(identifierParserName, updatedIdentifierParser);
    return identifierParserName;
  }

  async updateTagParser(structure: TemplateTagParserStructure) {
    const parserName = ParserOps.makeTagParserName(structure);
    await this.updateIdentifierParserName(parserName, structure);
    return await this.setParser(parserName, ParserOps.makeSequenceParser({
      delimiter: structure.delimiter,
      sequentialCategoryNames: structure.sequentialCategoryNames || [],
    }));
  }

  async createTagParser(event: CreateParserEvent) {
    const sequenceParserName = ParserOps.makeTagParserName(event);
    const identifierParserName = await this.updateIdentifierParserName(sequenceParserName, {
      delimiter: ParserOps.defaultDelimiter,
      ...event
    });
    await this.setParser(
      ParserOps.makeSwitchParserName(event),
      ParserOps.makeSwitchParser({ identifierParserName })
    );
    return await this.setParser(sequenceParserName, ParserOps.makeSequenceParser({
      delimiter: ParserOps.defaultDelimiter,
      sequentialCategoryNames: [],
    }));
  }

  async deleteTagParser(tagParser: IOSequenceParser) {
    const identifierParser = ParserOps.findOrMakeIdentifierRegexParser(this.tagParsers, {
      channel: ParserOps.sequenceParserChannel(tagParser),
      entityLevel: ParserOps.sequenceParserEntityLevel(tagParser),
    })
    await this.setParser(identifierParser.name, ParserOps.copyAndUpdateIdentifierRegexParser(
      identifierParser, 
      ParserOps.findIdentifierParserTarget(identifierParser, tagParser.name),
      true
    ));
    await this.deleteParser(tagParser.name);
  }

  runStandard(): Promise<boolean> {
    return this.api.client.post(TagParserService.standardURL(this.sessionService.currentCompanyIdentifier), {})
      .toPromise()
      .then((response: APIResponse) => {
        return response.success;
      });
  }

  parseNames(parserName: string, names: string[]): Promise<IdentifierParseNamesResponse> {
    return this.api.client.post(`${TagParserService.parsersURL(this.sessionService.currentCompanyIdentifier)}/${parserName}/parse`, {
      names
    })
      .toPromise()
      .then((response: IdentifierParseNamesResponse) => {
        return response;
      });
  }

  private deleteParser(parserName: string): Promise<boolean> {
    return this.api.client.delete(`${TagParserService.parsersURL(this.sessionService.currentCompanyIdentifier)}/${parserName}`)
      .toPromise()
      .then((response: APIResponse) => {
        this.parserDeletion$.next(parserName);
        return response.success;
      });
  }

  private setParser(parserName: string, parser: IOParser): Promise<boolean> {
    return this.api.client.put(`${TagParserService.parsersURL(this.sessionService.currentCompanyIdentifier)}/${parserName}`, parser)
      .toPromise()
      .then((response: APIResponse) => {
        this.parserMutation$.next({ ...parser, name: parserName });
        return response.success;
      });
  }

  private static parsersURL(companyIdentifier: string) {
    return `${APIService.baseURL}/companies/${companyIdentifier}/tags/parsers`;
  }

  private static standardURL(companyIdentifier: string) {
    return `${APIService.baseURL}/companies/${companyIdentifier}/tags/standard`;
  }
}