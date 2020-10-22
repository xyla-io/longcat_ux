import { AbstractMetadata } from '../../interfaces/template';

export type Placeholder = RegExp;

export interface DisplayNameCrate {
  displayName: string;
}

export interface InscriptionTarget {
  constant?: DisplayNameCrate;
  choices?: DisplayNameCrate[];
}

/**
 * A union of optional properties that could be in a placeholder or replacement record
 * Each property corresponds to a specifier in the inscribe template, e.g. '{propertyName}'
 */
type InscribeProperty =
  'column' // Corresponds to '{column}'
  | 'operator'; // Corresponds to '{operator}'

/**
 * A record of PlaceholderProperty
 *
 * Each property corresponds to a specifier in the inscribe template, e.g. '{property}'
 */
type PlaceholderRecord = Partial<{[key in InscribeProperty]: InscriptionTarget}>;

export interface ReplacementTemplate extends Partial<{[key in InscribeProperty]: string}> {
  metadata: AbstractMetadata;
  value: string; // Corresponds to '{value}'
}

export interface InscriptionTemplate extends PlaceholderRecord {
  metadata: AbstractMetadata;
  inscribeDisplayName?: string;
  inscribeDisplayNameOptional?: string;
}

export class InscriptionOps {

  static Placeholders: Record<string, Placeholder> = {
    // Generic InscriptionTarget types
    Column: /{column}/g,
    Operator: /{operator}/g,
    // Special string properties
    Value: /{value}/g,
    DisplayName: /{displayName}/g,
  };

  static inscribeText(inputText: string, placeholder: Placeholder, replacementText): string {
    return inputText.replace(placeholder, replacementText);
  }

  static inscribeAllReplacements({ baseDisplayName, inscriptionRecords, replacementRecords }: {
      baseDisplayName: string;
      inscriptionRecords: InscriptionTemplate[];
      replacementRecords: ReplacementTemplate[];
    }): string {
    return inscriptionRecords.reduce((title, inscriptionRecord) => {
      return InscriptionOps.inscribeSingleReplacement({
        baseDisplayName: title,
        inscriptionTemplate: (inscriptionRecord as InscriptionTemplate),
        replacementRecord: (replacementRecords || [])
          .find(replacementRecord => replacementRecord.metadata.identifier === inscriptionRecord.metadata.identifier)
      });
    }, baseDisplayName);
  }

  private static inscribeSingleReplacement({ baseDisplayName, inscriptionTemplate, replacementRecord }:
    {
      baseDisplayName: string;
      inscriptionTemplate: InscriptionTemplate;
      replacementRecord?: ReplacementTemplate;
    },
  ): string {
    let workingInscription;
    const invalidReplacementRecord = !replacementRecord || !replacementRecord.column || replacementRecord.value === null;
    if (invalidReplacementRecord && inscriptionTemplate.inscribeDisplayNameOptional) {
      workingInscription = inscriptionTemplate.inscribeDisplayNameOptional;
    } else if (replacementRecord && inscriptionTemplate.inscribeDisplayName) {
      workingInscription = inscriptionTemplate.inscribeDisplayName;
    } else {
      return baseDisplayName;
    }

    const placeholderRecord = {
      column: InscriptionOps.Placeholders.Column,
      operator: InscriptionOps.Placeholders.Operator,
    };
    workingInscription = Object.keys(placeholderRecord).reduce((inscription, placeholderKey) => {
      const { constant } = inscriptionTemplate[placeholderKey];
      if (constant) {
        return InscriptionOps.inscribeText(inscription, placeholderRecord[placeholderKey], constant.displayName || '');
      }
      if (replacementRecord) {
        const { choices } = inscriptionTemplate[placeholderKey];
        const chosen = choices.find(choice => choice[placeholderKey] === replacementRecord[placeholderKey]);
        if (chosen) {
          return InscriptionOps.inscribeText(inscription, placeholderRecord[placeholderKey], chosen.displayName || '');
        }
      }
      return InscriptionOps.inscribeText(inscription, placeholderRecord[placeholderKey], '');
    }, workingInscription);

    const replacementValue = (replacementRecord && (replacementRecord.value !== null && replacementRecord.value !== undefined))
      ? replacementRecord.value
      : '';
    workingInscription = InscriptionOps.inscribeText(workingInscription, InscriptionOps.Placeholders.Value, replacementValue);
    workingInscription = InscriptionOps.inscribeText(workingInscription, InscriptionOps.Placeholders.DisplayName, baseDisplayName);
    return workingInscription;
  }

}
