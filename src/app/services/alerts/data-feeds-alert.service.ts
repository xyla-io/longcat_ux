import { Injectable } from '@angular/core';
import { UserAlertService, UserAlertType } from 'src/app/services/alerts/user-alert.service';

@Injectable({
  providedIn: 'root'
})
export class DataFeedsAlertService {
  static replacementKey = 'invitation';

  constructor(
    private userAlertService: UserAlertService,
  ) { }

  postUploadFailureAlert(dataLotDisplayName?: string) {
    this.userAlertService.postAlert({
      alertType: UserAlertType.error,
      header: 'Upload Error',
      body: `There was a problem uploading the CSV file. Please check the column names to ensure they match the${dataLotDisplayName ? ` '${dataLotDisplayName}'`: ''} Data Lot format.`,
      autoCloseSeconds: 15,
    });
  }

  postMergeUploadSuccessAlert(dataLotDisplayName?: string) {
    this.userAlertService.postAlert({
      alertType: UserAlertType.info,
      header: 'Upload Complete',
      body: `CSV data has been added to the${dataLotDisplayName ? ` '${dataLotDisplayName}'`: ''} Data Lot.`,
      autoCloseSeconds: 10,
    });
  }

  postReplaceUploadSuccessAlert(dataLotDisplayName?: string) {
    this.userAlertService.postAlert({
      alertType: UserAlertType.info,
      header: 'Upload Complete',
      body: `${dataLotDisplayName ? ` '${dataLotDisplayName}'`: ''} Data Lot data has been replaced with uploaded CSV data.`,
      autoCloseSeconds: 8,
    });
  }

  postReplaceUploadCancelledAlert() {
    this.userAlertService.postAlert({
      alertType: UserAlertType.info,
      header: 'Upload Cancelled',
      body: 'No data has been uploaded',
      autoCloseSeconds: 3,
    });
  }

  postExportNotAvailable() {
    this.userAlertService.postAlert({
      alertType: UserAlertType.error,
      header: 'Export Not Available',
      body: 'There was a problem retrieving the data export',
      autoCloseSeconds: 8,
    });
  }
}
