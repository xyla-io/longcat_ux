import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Daterange } from 'src/app/dashboard/interfaces/query';
import { KPIEnum, MetricOps } from 'src/app/grid/models/metric';
import { OptionConfig, Options } from 'src/app/iomap/util/options';
import { CompanyReportSettingsKeys } from 'src/app/reports/models/report';
import { OrderedSelectionChange } from 'src/app/shared/components/option-ordered-multi-select/option-ordered-multi-select.component';
import { LocalSettings } from 'src/app/util/local-settings';
import { ColumnFlagEnum, PerformanceColumnOps } from 'src/app/util/ops/performance-column';
import { CategoryOps } from '../../../grid/models/category';

@Component({
  selector: 'app-performance-grid-settings',
  templateUrl: './performance-grid-settings.component.html',
  styleUrls: ['./performance-grid-settings.component.scss']
})
export class PerformanceGridSettingsComponent implements OnInit {
  Options = Options;

  @Input() columns: string[];
  @Input() categories: string[];
  @Input() metrics: string[];
  @Input() daterange: Daterange;
  @Output('categories') categoryChange = new EventEmitter<string[]>();
  @Output('metrics') kpiChange = new EventEmitter<string[]>();
  @Output('daterange') daterangeChange = new EventEmitter<Daterange>();

  categoryOptions: Record<string, OptionConfig<any>>;
  kpiOptions: Record<string, OptionConfig<any>> = MetricOps.kpiOptions;
  categorySelections: string[] = [];
  kpiModel: Partial<Record<string, boolean>> = {};

  ready = false;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['columns']) {
      const categoryColumns = PerformanceColumnOps.filterColumnNames(this.columns, ColumnFlagEnum.Category);
      this.categoryOptions = Options.from(categoryColumns, { makeDisplayName: CategoryOps.makeDisplayName });
      this.setSelectedCategories(this.categories);
      this.kpiOptions = MetricOps.makeCustomOptionsWithDefaults(this.columns);
    } else if (changes['categories']) {
      this.setSelectedCategories(this.categories);
    }
    if (changes['metrics']) {
      this.kpiModel = changes.metrics.currentValue.reduce((model, kpi) => {
        model[kpi] = true;
        return model;
      }, {});
    }
    this.ready = !!(this.categoryOptions && Object.keys(this.categoryOptions).length);
  }

  private setSelectedCategories(categories: string[]) {
    this.categorySelections = [...categories];
  }

  onSelectCategoryChange({ selections }: OrderedSelectionChange) {
    this.categorySelections = [...selections];
    this.categoryChange.emit(this.categorySelections);
    LocalSettings.save(CompanyReportSettingsKeys.Categories, this.categorySelections);
  }

  onKPIChange(kpis: string[]) {
    this.kpiChange.emit(kpis);
    LocalSettings.save(CompanyReportSettingsKeys.Metrics, kpis);
  }

  async onDaterangeChange(daterange: Daterange) {
    console.log('daterange settings', daterange);
    this.daterangeChange.emit(daterange);
    LocalSettings.save(CompanyReportSettingsKeys.Daterange, daterange);
  }

}
