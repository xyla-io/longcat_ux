import { NodeTypeEnum } from '../interfaces/node-ops';

export class NodeUtil {
  static columnsPropertyName = 'columns';

  static makeURLProtocol(nodeType: NodeTypeEnum) {
    return `${nodeType}://`;
  }

  static getURLComponents(rowUrl: string) {
    const [rowType, path] = rowUrl.split('://');
    return path.split('/');
  }

  static makeURLFromComponents(nodeType: NodeTypeEnum, components: string[]) {
    return [
      NodeUtil.makeURLProtocol(nodeType),
      components.join('/'),
    ].join('')
  }

  static makeColumnFieldName(name: string) {
    return [NodeUtil.columnsPropertyName, name].join('.');
  }

  static extractColumnName(fieldName: string) {
    const prefix = `${NodeUtil.columnsPropertyName}.`;
    return fieldName.startsWith(prefix)
      ? fieldName.replace(prefix, '')
      : fieldName;
  }
}