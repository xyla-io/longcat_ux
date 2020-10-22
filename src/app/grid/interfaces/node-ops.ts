import { AbstractTemplate } from 'src/app/dashboard/interfaces/template';
import { Class } from 'src/app/util/decorators/static-implements.decorator';
import { iGridLeaf } from './grid-leaf.interface';

export interface NodeTreeColumnConfig {
  name: string;
  header: string;
  allowGrouping: boolean;
  filterValues?: string[];
}

export interface NodeTreeMergeOptions {
  siblingProtocol?: string;
  clearSiblings?: boolean;
}

export interface NodeTreeView {
  existingNodes: Record<string, IOGridNode<NodeData<any, any>>>;
  addColumnsToTree(columnConfigs: NodeTreeColumnConfig[]): void;
  mergeNodes(nodes: NodeData<any, any>[], options: NodeTreeMergeOptions): void;
  getGroupColumns(): string[];
  clearNodes(): void;
  nodeTemplates: {
    [url: string]: AbstractTemplate;
  };
}

export interface NodeTreeSettings {
  childGroups: string[];
  parentGroups: string[];
}

export interface NodeData<MR, CR> {
  url: string;
  nodeType: NodeTypeEnum;
  treeSettings: NodeTreeSettings;
  models: MR;
  columns: CR;
  currentViewComponent?: Class<iGridLeaf<any, any>>;
  template?: Record<string, any>;
}

export interface IOGridNode<D extends NodeData<any, any>> {
  data: D;
}

export enum NodeTypeEnum {
  Channel = 'channel',
  ChannelEntity = 'channel_entity',
  Chart = 'chart',
}

// NodeOps is static interface extension of an empty class interface
export interface NodeOps<I, D extends NodeData<any, any>> extends Class<{}> {
  nodeType: NodeTypeEnum,
  onMergeInput(input: I, nodeTreeView: NodeTreeView, options: NodeSourceUpdateOptions): Promise<NodeSourceMergeEvent<D>>;
  onRegroupNodes(groupColumns: any[], nodeTreeView: NodeTreeView): void;
}

export interface NodeSourceUpdateOptions {
  clearSiblings?: boolean;
}

export interface NodeSourceMergeEvent<D> {
  nodes: D[];
}

export interface NodeSourceUpdateEvent<I> {
  nodeOps: NodeOps<I, any>;
  input?: I;
  options: NodeSourceUpdateOptions;
}
