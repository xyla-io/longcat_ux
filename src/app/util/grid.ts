import { RowNode, ColDef, GridApi } from "ag-grid-community";
import { Options } from "../iomap/util/options";
import { ChannelOps, ChannelEnum } from "src/app/iomap/models/channel";
import { IOMapService } from "src/app/rules/services/iomap.service";
import { EntityNode, AccountEntityNode } from "./reports/io-entity-report";
import { EntityOps, EntityEnum } from "../iomap/models/entity";
import { NodeUtil } from "../grid/util/node-util";
import { NodeTypeEnum } from "../grid/interfaces/node-ops";

export class GridDefaults {
  static defaultGridSidebar = {
    toolPanels: [
      {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel',
      }
    ]
  };

  static defaultColDef = {
    resizable: true,
    filter: true,
    sortable: true,
    editable: true,
    width: 100,
  };

  static makeDefaultRowHeightFunction(leafHeightFunction: (rowNode: RowNode) => number) {
    return (params) => {
      if (GridOps.isChannelNodeGroup(params.node)) { return 40; }
      if (GridOps.isAccountNodeGroup(params.node)) { return 32; }
      if (GridOps.isCampaignNodeGroup(params.node)) { return 32; }
      if (GridOps.isAdGroupNodeGroup(params.node)) { return 32; }
      if (GridOps.isTagGroupNodeGroup(params.node)) { return 40; }
      if (GridOps.isEntityLevelGroupNodeGroup(params.node)) { return 40; }
      if (GridOps.isLeaf(params.node)) { return leafHeightFunction(params.node); }
      return 32;
    };
  };

  static makeIOMapColumnDefinitions(iomapService: IOMapService): ColDef[] {
    return [
      {
        headerName: 'Channel',
        field: 'channel',
        filterValueGetter: (params) => Options.formatter(ChannelOps.channelOptions)({value: params.data.channel}),
        rowGroup: true,
      },
      {
        headerName: 'Account',
        field: 'account',
        filterValueGetter: (params) => (iomapService.entityReport.getEntity({
          accountPath: params.data.account,
        }) as AccountEntityNode || {} as any).accountName || params.data.metadata.accountName,
        rowGroup: true,
      },
      {
        headerName: 'Campaign',
        field: 'campaignID',
        filterValueGetter: (params) => (iomapService.entityReport.getEntity({
          accountPath: params.data.account,
          campaignID: params.data.campaignID,
        }) as EntityNode || {} as any).name || params.data.metadata.campaignName,
        rowGroup: true,
      },
      {
        headerName: 'Ad Group',
        field: 'adgroupID',
        filterValueGetter: (params) => {
          if (!params.data.adgroupID) { return ' [All Ad Groups in Campaign]'; }
          return (iomapService.entityReport.getEntity({
            accountPath: params.data.account,
            campaignID: params.data.campaignID,
            adgroupID: params.data.adgroupID,
          }) as EntityNode || {} as any).name || params.data.metadata.adGroupName;
        },
        rowGroup: true,
      },
    ];
  }

  static makeAlmacenColumnDefinitions(): ColDef[] {

    const entityColumns = [
      EntityEnum.Campaign,
      EntityEnum.Adgroup,
      EntityEnum.Ad,
      EntityEnum.Asset,
    ].reduce((columns, entityLevel) => {
      const displayName = EntityOps.entityOptions[entityLevel].displayName;
      columns.push({
        headerName: `${displayName} Name`,
        valueGetter: ({ data }) => !data.isPlaceholder && data.entityLevel === entityLevel ? data.name : '',
        rowGroup: false,
      });
      columns.push({
        headerName: `${displayName} ID`,
        valueGetter: ({ data }) => !data.isPlaceholder && data.entityLevel === entityLevel ? data.id : '',
        rowGroup: false,
      });
      return columns
    }, []);

    return [
      {
        headerName: 'Channel',
        field: 'channel',
        filterValueGetter: (params) => Options.formatter(ChannelOps.channelOptions)({value: params.data.channel}),
        rowGroup: true,
      },
    ].concat(entityColumns);
  }

  static makeIOGridColumnDefinitions({groupColumns}: { groupColumns: string[] }): ColDef[] {
    const entityColumns: ColDef[] = [
      EntityEnum.Campaign,
      EntityEnum.Adgroup,
      EntityEnum.Ad,
      EntityEnum.Asset,
    ].reduce<ColDef[]>((columns, entityLevel) => {
      const displayName = EntityOps.entityOptions[entityLevel].displayName;
      const nameColumn = `${entityLevel}.name`;
      const idColumn = `${entityLevel}.id`;
      columns.push({
        headerName: `${displayName} Name`,
        field: NodeUtil.makeColumnFieldName(nameColumn),
        rowGroup: groupColumns.includes(nameColumn),
        enableRowGroup: true,
      });
      columns.push({
        headerName: `${displayName} ID`,
        field: NodeUtil.makeColumnFieldName(idColumn),
        rowGroup: groupColumns.includes(idColumn),
        enableRowGroup: true,
      });
      return columns
    }, []);

    return [
      {
        headerName: 'Channel',
        field: NodeUtil.makeColumnFieldName('channel'),
        filterValueGetter: (params) => Options.formatter(ChannelOps.channelOptions)({value: params.data.columns.channel}),
        rowGroup: groupColumns.includes('channel'),
        enableRowGroup: true,
      } as ColDef,
    ].concat(entityColumns);
  }

}

export class GridOps {

  static channelGroupId(channel: ChannelEnum) { return `channel-${channel}`; }

  static isFullWidthCell(rowNode) {
    return GridOps.isLeaf(rowNode)
    || GridOps.isChannelNodeGroup(rowNode)
    || GridOps.isAccountNodeGroup(rowNode)
    || GridOps.isCampaignNodeGroup(rowNode)
    || GridOps.isAdGroupNodeGroup(rowNode)
    || GridOps.isTagGroupNodeGroup(rowNode)
    || GridOps.isEntityLevelGroupNodeGroup(rowNode);
  }

  static isLeaf(rowNode) {
    return !rowNode.allChildrenCount;
  }
 
  static isChannelNodeGroup(rowNode) {
    return rowNode.group === true && rowNode.field === 'channel';
  }

  static isAccountNodeGroup(rowNode) {
    return rowNode.group === true && rowNode.field === 'account';
  }
  
  static isCampaignNodeGroup(rowNode) {
    return rowNode.group === true && rowNode.field === 'campaignID';
  }

  static isAdGroupNodeGroup(rowNode) {
    return rowNode.group === true && rowNode.field === 'adgroupID';
  }

  static isTagGroupNodeGroup(rowNode) {
    return rowNode.group === true && rowNode.field === 'parserName';
  }

  static isEntityLevelGroupNodeGroup(rowNode) {
    return rowNode.group === true && rowNode.field === 'entityLevel';
  }

  static updateNodesWithTransaction<T>({ gridAPI, nodeData, getNodeURL, siblingProtocol, isSibling, clearSiblings, idProperty }: {
    gridAPI: GridApi,
    nodeData: T[],
    getNodeURL?: (nodeDatum: T) => string,
    siblingProtocol?: string;
    isSibling?: (rowNode: RowNode) => boolean;
    clearSiblings: boolean,
    idProperty: string,
   }) {
    const resolveNodeURL = (node) => {
      return getNodeURL ? getNodeURL(node) : (node as any).url;
    }
    const transaction = nodeData.reduce((transaction, node) => {
      const existingNode = gridAPI.getRowNode(resolveNodeURL(node));
      if (existingNode) { transaction.update.push(node); }
      else { transaction.add.push(node); }
      return transaction;
    }, { add: [], update: [], remove: [] });
    const updatedNodeIds = new Set(nodeData.map(resolveNodeURL));
    if ((siblingProtocol || isSibling) && clearSiblings) {
      const resolveIsSibling = (node: RowNode) => {
        return isSibling
          ? isSibling(node)
          : node.id.startsWith(siblingProtocol);
        }
      gridAPI.forEachNode(node => {
        if (resolveIsSibling(node) && !updatedNodeIds.has(node.id)) {
          transaction.remove.push({ [idProperty]: node.id });
        }
      })
    }
    gridAPI.applyTransaction(transaction);
  }

}

export class GridSorting {

  static defaultGroupSortComparator(nodeA, nodeB) {
    // Both are groups
    if (nodeA.group && nodeB.group) {
      if (nodeA.field === 'channel' || nodeA.field === 'account') {
        return nodeA.key > nodeB.key ? 1 : -1;
      }
      if (nodeA.field === 'entityLevel' && nodeB.field === 'entityLevel') {
        return EntityOps.compareEntityLevel(nodeA.key, nodeB.key);
      }
      // One is a group, one is a node
    } else if (nodeA.group || nodeB.group) {
      const groupNode = nodeA.group ? nodeA : nodeB;
      const leafNode = nodeA.group ? nodeB : nodeA;
      const putLeafFirst = leafNode === nodeA ? -1 : 1;
      if (groupNode.field === 'campaignID' || groupNode.field == 'adgroupID') {
        return !leafNode.data.isPlaceholder ? putLeafFirst : -putLeafFirst;
      }
      // Both are leaves
    } else {
      if (nodeA.data.isPlaceholder) {
        // Move placeholder to the end, otherwise the group siblings show before rules
        return 1;
      } else if (nodeB.data.isPlaceholder) {
        // Move placeholder to the end, otherwise the group siblings show before rules
        return -1;
      } else {
        return nodeA.data.created < nodeB.data.created ? 1 : -1;
      }
    }
    return 0;
  }

  static defaultPostSort(rowNodes: RowNode[]) {
    // 1. We want all unmodified rules to be at the top of their groups
    function isUnmodifiedRule(node: RowNode) {
      return node.data && !node.data.isPlaceholder && !node.data.modified;
    }
    const unmodifiedRules = [];
    rowNodes.forEach((node: RowNode, i: number) => {
      if (isUnmodifiedRule(node)) {
        unmodifiedRules.push(...rowNodes.splice(i, 1));
      }
    });
    rowNodes.unshift(...unmodifiedRules);
  }
}