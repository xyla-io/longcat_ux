import { DaterangeUnit } from "src/app/dashboard/interfaces/query";
import { TemplateType } from "src/app/dashboard/interfaces/template";
import { SaveStatus } from "src/app/editing/components/save-control/save-control.component";
import { AccessService } from "src/app/services/access/access.service";
import { CompanyReport, LayoutOrientation } from "src/app/services/api/company-reports.service";
import { LocalSettings } from "src/app/util/local-settings";

export interface CompanyReportState {
  report: CompanyReport;
  status: SaveStatus;
}

export interface CompanyReportUpdate {
  date?: Date;
  displayName?: string;
  layout?: Record<string, Record<string, any>|null>;
  xyla?: Record<string, Record<string, any>|null>;
}

export enum CompanyReportSettingsKeys {
  Categories = 'categories',
  Metrics = 'metrics',
  Daterange = 'daterange',
}

export function applyReportUpdate(report: CompanyReport, update: CompanyReportUpdate) {
  const remainingUpdate = Object.assign({}, update);
  Object.assign(report.content.layout, remainingUpdate.layout);
  for (const [k, v] of Object.entries(report.content.layout)) {
    if (!v) { delete report.content.layout[k]; }
  }
  Object.assign(report.content.xyla, remainingUpdate.xyla);
  for (const [k, v] of Object.entries(report.content.xyla)) {
    if (!v) { delete report.content.xyla[k]; }
  }
  delete remainingUpdate.layout;
  delete remainingUpdate.xyla;
  Object.assign(report, remainingUpdate);
}

export function newExploreReport(companyIdentifier: string, reportIdentifier: string, date: Date): CompanyReport {
  return {
    path: AccessService.pathFromComponents(['companies', companyIdentifier, 'reports', reportIdentifier]),
    date: date,
    displayName: `My Explore ${date.getMonth() + 1}/${date.getDate()}`,
    reportVersion: 2,
    content: {
      layout: {
        layout_main: {
          orientation: LayoutOrientation.Vertical,
          layoutIDs: [
            'elements_performance'
          ]
        }
      },
      mode: {},
      periscope: {},
      xyla: {
        elements_performance: {
          metadata: {
            templateType: TemplateType.GridContent,
            identifier: 'elements_performance'
          },
          structure: {
            grid: {
              metadata: {
                identifier: 'grid',
                templateType: TemplateType.PerformanceGrid,
              },
              structure: {
                categories: LocalSettings.load(CompanyReportSettingsKeys.Categories) || ['category#channel'],
                metrics: LocalSettings.load(CompanyReportSettingsKeys.Metrics) || [
                  'metric#spend',
                  'metric#clicks',
                ],
                daterange: LocalSettings.load(CompanyReportSettingsKeys.Daterange) || {
                  unit: DaterangeUnit.Day,
                  value: 30,
                },
                gridState: {
                  rowGroupStates: {},
                },
                nodes: {},
              }
            }
          }
        }
      }
    }
  };
}