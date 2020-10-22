import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EventTemplateEditingValidation } from 'src/app/editing/services/editing.service';
import { EntityOps } from 'src/app/iomap/models/entity';
import { cloneDeep } from 'lodash-es';
import { Options } from 'src/app/iomap/util/options';
import { ParserOps, IOSequenceParserDelimiterEnum } from '../../models/parser';
import { ChannelOps } from 'src/app/iomap/models/channel';
import { SessionService } from 'src/app/services/api/session.service';
import { TrackingService, TrackingEvents } from 'src/app/services/integration/tracking.service';
import { TemplateTagParser } from 'src/app/grid/node-ops/parser.node';
import { PatternPosition } from 'src/app/util/pattern-matching';

enum CopyPatternTooltipText {
  Hint = 'Click to Copy',
  Done = 'Copied',
}

@Component({
  selector: 'app-edit-tag-parser',
  templateUrl: './edit-tag-parser.component.html',
  styleUrls: ['./edit-tag-parser.component.scss']
})
export class EditTagParserComponent implements OnInit {
  EntityOps = EntityOps;
  PatternPosition = PatternPosition;
  CopyPatternTooltipText = CopyPatternTooltipText;

  @Input() inputTemplate: TemplateTagParser;
  @Input() masterTemplate = null;
  @Output() templateUpdate = new EventEmitter<TemplateTagParser>();
  @Output() validationChange = new EventEmitter<EventTemplateEditingValidation>();

  delimiterOptions = Options.values(ParserOps.delimiterOptions)
  selectedDelimiter: IOSequenceParserDelimiterEnum;
  entitySample: string = '';
  isParsingSample = false;
  sampleEntityValues: string[];
  categoryNames: string[];
  manualDefinitionMode = false;
  identifierPatternPosition: PatternPosition = PatternPosition.Suffix;
  copyPatternTooltip = CopyPatternTooltipText.Hint;

  get channel() { return this.inputTemplate.structure.channel; }
  get entityLevel() { return this.inputTemplate.structure.entityLevel; }
  get parserKey() { return this.inputTemplate.structure.parserKey; }
  get parserKeyPatternPosition() { return this.inputTemplate.structure.parserKeyPatternPosition; }
  get entityDisplayName() { return ChannelOps.getEntityDisplayName({ channel: this.channel, entity: this.entityLevel }); }
  get parserKeyIndex() {
    return this.parserKeyPatternPosition === PatternPosition.Prefix ? 0 : this.categoryNames.length -1;
  }

  constructor(
    private sessionService: SessionService,
    private trackingService: TrackingService,
  ) { }

  ngOnInit() {
    this.selectedDelimiter = this.inputTemplate.structure.delimiter;
    if (this.inputTemplate.structure.sequentialCategoryNames) {
      this.categoryNames = this.inputTemplate.structure.sequentialCategoryNames.map(name => name ? name : '');
      this.sampleEntityValues = this.categoryNames.slice();
      this.manualDefinitionMode = true;
      if (this.parserKeyPatternPosition === PatternPosition.Prefix) {
        this.categoryNames[0] = this.parserKey;
        if (this.categoryNames.length === 1) {
          this.categoryNames.push('');
        }
      } else {
        this.categoryNames.push(this.parserKey);
        if (this.categoryNames.length === 1) {
          this.categoryNames.unshift('');
        }
      }
      this.sampleEntityValues = this.categoryNames.slice();
    }
  }

  emitTemplateUpdate() {
    const sequentialCategoryNames = this.categoryNames ? this.categoryNames.slice() : [];
    if (this.parserKeyPatternPosition === PatternPosition.Prefix) {
      sequentialCategoryNames[0] = '';
    } else {
      sequentialCategoryNames.pop();
    }

    const outputTemplate = cloneDeep({
      ...this.inputTemplate,
      structure: {
        ...this.inputTemplate.structure,
        delimiter: this.selectedDelimiter,
        sequentialCategoryNames,
      }
    });
    this.templateUpdate.emit(outputTemplate);
    this.validationChange.emit({
      isValid: !!this.categoryNames,
    });
    // Ensure change detection marks categoryNames as dirty
    if (this.categoryNames) {
      this.categoryNames = this.categoryNames.slice();
    }
  }

  onDelimiterChange(event) {
    const newDelimiter = event.target.value;
    if (this.entitySample) {
      this.entitySample = this.entitySample.split(this.selectedDelimiter).join(newDelimiter);
    }
    this.selectedDelimiter = newDelimiter;
    this.emitTemplateUpdate();
  }

  longExampleName(delimiter: string) {
    return this.generateExampleName(
      delimiter,
      [ 'DoorDash', ChannelOps.channelOptions[this.channel].abbreviation, 'iOS', 'x', 'y', 'z' ]
    );
  }

  basicExampleName(delimiter: string) {
    return this.generateExampleName(delimiter, [ 'x', 'y', 'z' ]);
  }

  private generateExampleName(delimiter: string, exampleValues: string[]) {
    if (this.parserKeyPatternPosition === PatternPosition.Prefix) {
      exampleValues.unshift(this.parserKey);
    } else {
      exampleValues.push(this.parserKey);
    }
    return exampleValues.join(delimiter);
  }

  onEntitySampleChange(event) {
    this.entitySample = event.target.value;
  }

  onClickSkipParsingSample(event: MouseEvent) {
    if (this.sampleEntityValues) {
      this.sampleEntityValues = undefined;
      this.categoryNames = undefined;
      this.entitySample = '';
      this.emitTemplateUpdate();
      return;
    }
    this.manualDefinitionMode = true;
    this.categoryNames = this.parserKeyPatternPosition === PatternPosition.Prefix ? [this.parserKey, ''] : ['', this.parserKey];
    this.sampleEntityValues = this.categoryNames.slice();
    this.emitTemplateUpdate();
    this.trackParserManuallyDefined(this.sessionService.currentCompanyIdentifier);
  }

  onClickParseSample(event: MouseEvent) {
    if (!this.entitySample) { return; }
    this.manualDefinitionMode = false;
    this.isParsingSample = true;
    this.sampleEntityValues = this.entitySample.split(this.selectedDelimiter);
    const sampleParserKeyIndex = this.parserKeyPatternPosition === PatternPosition.Prefix ? 0 : this.sampleEntityValues.length - 1;
    if (this.sampleEntityValues[sampleParserKeyIndex] !== this.parserKey) {
      if (this.parserKeyPatternPosition === PatternPosition.Prefix) {
        this.sampleEntityValues.unshift(this.parserKey);
      } else {
        this.sampleEntityValues.push(this.parserKey);
      }
      this.entitySample = this.sampleEntityValues.join(this.selectedDelimiter);
    }
    this.categoryNames = this.sampleEntityValues.map((_, i) => this.categoryNames && this.categoryNames[i] !== this.parserKey ? this.categoryNames[i] || '' : '');
    this.isParsingSample = false;
    this.emitTemplateUpdate();
    this.trackParserSampleEntered(this.sessionService.currentCompanyIdentifier);
  }

  onCategoryChange(event, i) {
    this.categoryNames[i] = event.target.value;
    this.emitTemplateUpdate();
  }

  allowDeleteField(i: number) {
    return this.categoryNames.length > 2;
  }

  allowAddField(i: number) {
    return true;
  }

  onDeleteFieldClick(i) {
    this.categoryNames.splice(i, 1);
    this.sampleEntityValues.splice(i, 1);
    this.emitTemplateUpdate();
  }

  onAddFieldClick(i) {
    this.categoryNames.splice(i+1, 0, '');
    this.sampleEntityValues.splice(i+1, 0, '');
    this.emitTemplateUpdate();
  }

  onClickCopyPattern(event) {
    console.log(event);
    event.target.select();
    document.execCommand('copy');
    this.copyPatternTooltip = CopyPatternTooltipText.Done;
    setTimeout(() => this.copyPatternTooltip = CopyPatternTooltipText.Hint, 1000);
  }

  trackParserManuallyDefined(companyIdentifier: string) {
    if (!companyIdentifier) { return; }
    this.trackingService.track(TrackingEvents.TagParsersManuallyDefined, {
      company: companyIdentifier,
    });
  }

  trackParserSampleEntered(companyIdentifier: string) {
    if (!companyIdentifier) { return; }
    this.trackingService.track(TrackingEvents.TagParsersSampleEntered, {
      company: companyIdentifier,
    });
  }
}
