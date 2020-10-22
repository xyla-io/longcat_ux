import { EventEmitter } from '@angular/core';
import { BlockTemplate, TemplateGroup } from 'src/app/dashboard/interfaces/template';
import { EnhancedTemplateMaster, TemplateMaster } from 'src/app/dashboard/interfaces/master';
import { EventTemplateUpdate } from 'src/app/editing/services/editing.service';
import { EventRequestSidebar } from 'src/app/sidebar/services/sidebar.service';

interface AbstractBlock<TB extends BlockTemplate> {
  dataRefreshing: boolean;
  templateUpdate?: EventEmitter<EventTemplateUpdate<TB>>;
  editorRequest?: EventEmitter<EventRequestSidebar<TB>>;
}

export interface Block<TB extends BlockTemplate>
extends AbstractBlock<TB> {
  template: TB;
  refreshData: Function;
}

export interface BlockGroup<TG extends TemplateGroup<BlockTemplate>>
extends AbstractBlock<TG> {
  group: TG;
}
