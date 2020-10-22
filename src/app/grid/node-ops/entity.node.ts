import { NodeOps, NodeSourceUpdateOptions, NodeTypeEnum, IOGridNode, NodeData, NodeTreeView } from "../interfaces/node-ops";
import { staticImplements } from "src/app/util/decorators/static-implements.decorator";
import { ObjectReport } from "src/app/util/reports/object-report";
import { ChannelEnum } from "src/app/iomap/models/channel";
import { EntityEnum } from "src/app/iomap/models/entity";
import { NodeUtil } from "../util/node-util";

export interface AlmacenEntityModel extends Record<string, any> {
  url: string;
  channel: ChannelEnum;
  entity: EntityEnum;
  name: string;
  id: string|number;
  tags?: string;
}
interface IOReportEntityModel {
  // TODO: add IOReport columns here
}

export interface EntityInfoColumns {
  id: string;
  name: string;
}

export interface BaseEntityColumns extends Record<string, any> {
  channel?: ChannelEnum;
  entityLevel?: EntityEnum;
}

export type BaseEntityNodeColumns<E> = BaseEntityColumns&Partial<Record<EntityEnum, E>>;

interface EntityNodeData extends NodeData<
  {
    almacen?: AlmacenEntityModel,
    ioreport?: IOReportEntityModel
  },
  BaseEntityNodeColumns<EntityInfoColumns>
> {}

@staticImplements<NodeOps<string, EntityNodeData>>()
export class EntityNodeOps {
  static nodeType = NodeTypeEnum.ChannelEntity;
  static readonly tagColumnPrefix = 'tag_';

  static async onMergeInput(url: string, nodeTreeView: NodeTreeView, options: NodeSourceUpdateOptions) {
    if (!url) { return; }
    const report = new ObjectReport({
      jsonColumns: { 'tags': { prefix: EntityNodeOps.tagColumnPrefix }},
    });
    await report.addCSVFromURL(url);
    console.log(report.rows);

    return {
      nodes: EntityNodeOps.convertRows(report.rows, [])
    }

  }

  static onRegroupNodes(groupColumns: any[], nodeTreeView: NodeTreeView) {
  }

  static getTagColumns(almacenModel: AlmacenEntityModel): Record<string, any> {
    return Object.entries(almacenModel).reduce((tagColumns, [k, v]) => {
      if (k.startsWith(EntityNodeOps.tagColumnPrefix)) {
        tagColumns[k] = v;
      }
      return tagColumns;
    }, {});
  }

  static convertRow(almacenModel?: AlmacenEntityModel, ioreportModel?: IOReportEntityModel): EntityNodeData|null {
    const baseColumns: BaseEntityNodeColumns<EntityInfoColumns> = (() => {
      if (almacenModel) {
        const [ channelEnum, entityLevel ] = NodeUtil.getURLComponents(almacenModel.url);
        return {
          channel: channelEnum as ChannelEnum,
          entityLevel: entityLevel as EntityEnum,
          [entityLevel]: {
            id: almacenModel.id,
            name: almacenModel.name,
          },
          ...EntityNodeOps.getTagColumns(almacenModel),
        };
      } else if (ioreportModel) {
        // TODO: implement extraction of base columns from IOReportEntityModel
        return null;
      } else {
        return null;
      }
    })();
    if (!baseColumns) { return null; }
    return {
      url: almacenModel.url,
      nodeType: EntityNodeOps.nodeType,
      treeSettings: {
        parentGroups: [],
        childGroups: [],
      },
      models: {
        almacen: almacenModel,
      },
      columns: baseColumns,
    };
  }

  static convertRows(rows: AlmacenEntityModel[], ioreportModel: IOReportEntityModel): EntityNodeData[] {
    // TODO: need to pair Almacén rows with IOReport rows for feeding to convertRow()
    return rows.map((row) => {
      return EntityNodeOps.convertRow(row, {});
    }).filter(Boolean);
  }

};

