import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
} from '@angular/core';
import { BigNumberService, ModelBigNumber, TemplateBigNumber } from 'src/app/dashboard/services/big-number.service';
import { DashboardAlertService } from 'src/app/services/alerts/dashboard-alert.service';
import { Block } from 'src/app/dashboard/interfaces/block';

@Component({
  selector: 'app-block-big-number',
  templateUrl: './block-big-number.component.html',
  styleUrls: ['./block-big-number.component.scss'],
})
export class BlockBigNumberComponent
implements OnInit, OnChanges, Block<TemplateBigNumber> {
  @Input() template: TemplateBigNumber;
  @Input() dataRefreshing = false;
  viewModel: ModelBigNumber;
  error = '';

  constructor(
    private bigNumberService: BigNumberService,
    private dashboardAlertService: DashboardAlertService,
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges) {
    this.refreshData();
  }

  async refreshData() {
    try {
      this.viewModel = await this.bigNumberService.instantiate(this.template);
    } catch (e) {
      console.error(e);
      this.dashboardAlertService.postDataRetrievalError();
      this.error = 'Problem loading data';
    }
  }
}
