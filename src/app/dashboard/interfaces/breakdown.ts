import {
  TemplateType,
  InternalTemplate,
  InternalMetadata,
} from 'src/app/dashboard/interfaces/template';
import { ColumnLiteral } from 'src/app/dashboard/interfaces/column';

export type BreakdownIdentifier = string;

export interface MetadataBreakdown extends InternalMetadata {
  identifier: BreakdownIdentifier;
  templateType: TemplateType.Breakdown;
}

export interface TemplateBreakdown extends InternalTemplate {
  metadata: MetadataBreakdown;
  displayName: string;
  groupColumn: ColumnLiteral;
  descendantIdentifiers: BreakdownIdentifier[];
}

