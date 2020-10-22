// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Vendor
import { SuiModule, SuiPopupModule } from 'ng2-semantic-ui';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { LottieAnimationViewModule } from 'ng-lottie';
import {
  NbButtonModule,
  NbIconModule,
  NbTooltipModule,
} from '@nebular/theme';

// Components
import { SubmitButtonComponent } from './components/submit-button/submit-button.component';
import { MessagePresenterComponent } from './components/message-presenter/message-presenter.component';
import { AlertComponent } from './components/alert/alert.component';
import { DownloadsComponent } from './components/downloads/downloads.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { RawExportComponent } from './components/raw-export/raw-export.component';
import { AdblockModalComponent } from './components/adblock-modal/adblock-modal.component';
import { LoaderComponent } from './components/loader/loader.component';
import { ButtonBankComponent } from './components/button-bank/button-bank.component';
import { ExpandableListItemComponent } from './components/expandable-list-item/expandable-list-item.component';
import { SelectionChoicesPipe } from './pipes/selection-choices.pipe';
import { FloatingButtonComponent } from './components/floating-button/floating-button.component';
import { DaterangePipe } from './pipes/daterange.pipe';
import { DatacellPipe } from './pipes/datacell.pipe';
import { ToastComponent } from './components/toast/toast.component';
import { ButtonCircularComponent } from './components/button-circular/button-circular.component';
import { HeadingChannelComponent } from './components/heading-channel/heading-channel.component';
import { BadgeParserKeyComponent } from '../shared/components/badge-parser-key/badge-parser-key.component';
import { SequenceParserSamplePipe } from './pipes/sequence-parser-sample.pipe';
import { SequenceParserKeyPipe } from './pipes/sequence-parser-key.pipe';
import { OptionMultiSelectComponent } from '../shared/components/option-multi-select/option-multi-select.component';
import { OptionSingleSelectComponent } from './components/option-single-select/option-single-select.component';
import { OptionToggleComponent } from './components/option-toggle/option-toggle.component';
import { DisplayNamesPipe } from './pipes/display-names.pipe';
import { PluralizePipe } from './pipes/pluralize.pipe';
import { ReplacePipe } from './pipes/replace.pipe';
import { OptionOrderedMultiSelectComponent } from './components/option-ordered-multi-select/option-ordered-multi-select.component';

@NgModule({
  entryComponents: [
    LoaderComponent,
  ],
  imports: [
    SuiModule,
    NgxSmartModalModule,
    LottieAnimationViewModule.forRoot(),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    DragDropModule,
    NbButtonModule,
    NbIconModule,
    NbTooltipModule,
    SuiPopupModule,
  ],
  declarations: [
    SubmitButtonComponent,
    MessagePresenterComponent,
    AlertComponent,
    DownloadsComponent,
    FileUploadComponent,
    RawExportComponent,
    AdblockModalComponent,
    LoaderComponent,
    ButtonBankComponent,
    ExpandableListItemComponent,
    SelectionChoicesPipe,
    FloatingButtonComponent,
    DaterangePipe,
    DatacellPipe,
    SequenceParserSamplePipe,
    ToastComponent,
    ButtonCircularComponent,
    HeadingChannelComponent,
    BadgeParserKeyComponent,
    SequenceParserKeyPipe,
    OptionMultiSelectComponent,
    OptionToggleComponent,
    OptionSingleSelectComponent,
    OptionOrderedMultiSelectComponent,
    DisplayNamesPipe,
    PluralizePipe,
    ReplacePipe,
  ],
  exports: [
    SubmitButtonComponent,
    MessagePresenterComponent,
    AlertComponent,
    DownloadsComponent,
    FileUploadComponent,
    RawExportComponent,
    AdblockModalComponent,
    LoaderComponent,
    ButtonBankComponent,
    ExpandableListItemComponent,
    SelectionChoicesPipe,
    FloatingButtonComponent,
    DaterangePipe,
    DatacellPipe,
    SequenceParserSamplePipe,
    SequenceParserKeyPipe,
    ToastComponent,
    ButtonCircularComponent,
    HeadingChannelComponent,
    BadgeParserKeyComponent,
    OptionMultiSelectComponent,
    OptionToggleComponent,
    OptionSingleSelectComponent,
    OptionOrderedMultiSelectComponent,
    DisplayNamesPipe,
    PluralizePipe,
    ReplacePipe,
  ],
  providers: [
  ],
})
export class SharedModule { }
