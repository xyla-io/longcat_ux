import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ChannelOps, ChannelEnum } from 'src/app/iomap/models/channel';
import { ChannelIconService } from 'src/app/services/assets/channel-icon.service';
import { EntityEnum, EntityOps } from 'src/app/iomap/models/entity';
import { IOParser, ParserOps, CreateParserEvent } from '../../models/parser';
import { SessionService } from 'src/app/services/api/session.service';
import { PatternPosition } from 'src/app/util/pattern-matching';

@Component({
  selector: 'app-create-parser',
  templateUrl: './create-parser.component.html',
  styleUrls: ['./create-parser.component.scss']
})
export class CreateParserComponent implements OnInit, OnChanges {
  ChannelOps = ChannelOps;
  ChannelIconService = ChannelIconService;
  EntityEnum = EntityEnum;
  EntityOps = EntityOps;
  PatternPosition = PatternPosition;
  
  @Input() channel: ChannelEnum;
  @Input() existingParsers: IOParser[];
  @Output() continue = new EventEmitter<CreateParserEvent>();

  get entityLevelOptions() {
    return ChannelOps.channelOptions[this.channel].taggableEntities;
  }

  saving = false;
  generatedParserKey: string;
  customParserKey?: string = undefined;
  customParserKeyCollision: boolean = false;
  patternPosition: PatternPosition = PatternPosition.Suffix;

  _entityLevel: EntityEnum = EntityEnum.Campaign;
  get entityLevel() { return this._entityLevel; }
  set entityLevel(level: EntityEnum) {
    this._entityLevel = level;
    this.updateParserKey();
  }
  get parserKey(): string {
    if (this.customParserKey && !this.customParserKeyCollision) {
      return this.customParserKey
    }
    return this.generatedParserKey;
  }


  constructor(
    private sessionService: SessionService,
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateParserKey();
    this.customParserKey = undefined;
    this.patternPosition = PatternPosition.Suffix;
    if (changes.entityLevel && changes.entityLevel.previousValue !== changes.entityLevel.currentValue) {
      this.entityLevel = this.entityLevelOptions[0];
    }
  }

  onEntityLevelChange(event) {
    this.entityLevel = event.target.value;
    this.checkCustomParserKeyCollision();
  }

  onClickContinue(event: MouseEvent) {
    this.saving = true;
    this.continue.emit({
      channel: this.channel,
      entityLevel: this.entityLevel,
      parserKey: this.parserKey,
      parserKeyPatternPosition: this.patternPosition,
    });
  }

  updateParserKey() {
    const nextParserKey = ParserOps.nextParserKey(this.existingParsers, {
      channel: this.channel,
      entityLevel: this.entityLevel,
      parserKey: '',
    }, this.sessionService.currentCompanyIdentifier);
    this.generatedParserKey = nextParserKey;
  }

  onCustomParserKeyChange(event) {
    this.customParserKey = (event.target.value as string).replace(/[^0-9a-zA-Z.]/g, '');
    event.target.value = this.customParserKey;
    this.checkCustomParserKeyCollision();
  }

  checkCustomParserKeyCollision() {
    this.customParserKeyCollision = ParserOps.checkParserKeyCollision(this.existingParsers, {
      channel: this.channel,
      entityLevel: this.entityLevel,
      parserKey: this.customParserKey,
    });
  }

  onToggleParserKeyType(event) {
    if (this.customParserKey === undefined) {
      this.customParserKey = '';
      this.customParserKeyCollision = false;
    } else {
      this.customParserKey = undefined;
      this.customParserKeyCollision = false;
    }
  }

  onPatternPositionChange(event) {
    this.patternPosition = event.target.value;
  }

}
