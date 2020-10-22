export interface DynamicIdentifierFields {
  namespace: string;
  sourceIdentifier: string;
  sourceTag?: string;
  instanceIdentifier?: string;
}

export class DynamicIdentifierOps {

  static readonly fieldSeparator = ':';

  static generateIdentifier(fields: DynamicIdentifierFields) {
    return [
      fields.namespace,
      fields.sourceIdentifier,
      fields.sourceTag,
      fields.instanceIdentifier,
    ] .filter(field => field !== undefined).join(DynamicIdentifierOps.fieldSeparator);
  }
}
