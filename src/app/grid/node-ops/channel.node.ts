import { staticImplements } from "src/app/util/decorators/static-implements.decorator";
import { NodeOps, NodeSourceUpdateOptions, NodeTypeEnum, IOGridNode, NodeData, NodeTreeView } from "../interfaces/node-ops";
import { ChannelEnum } from "src/app/iomap/models/channel";
import { NodeUtil } from "../util/node-util";

interface ChannelNodeColumns {
  channel: ChannelEnum;
}

export interface ChannelNodeData extends NodeData<{}, ChannelNodeColumns> {
  url: string;
  isPlaceholder: boolean;
}

@staticImplements<NodeOps<ChannelEnum[], ChannelNodeData>>()
export class ChannelNodeOps {
  static nodeType = NodeTypeEnum.Channel;
  static urlProtocol = 'channel://';

  static async onMergeInput(channels: ChannelEnum[], nodeTreeView: NodeTreeView, options: NodeSourceUpdateOptions) {
    return Promise.resolve({
      nodes: channels.map(channel => ({
        url: NodeUtil.makeURLFromComponents(ChannelNodeOps.nodeType, [ channel ]),
        isPlaceholder: true,
        nodeType: ChannelNodeOps.nodeType,
        treeSettings: {
          parentGroups: [],
          childGroups: [],
        },
        models: {},
        columns: {
          channel,
        },
      })),
    })
  }

  static onRegroupNodes(groupColumns: any[], nodeTreeView: NodeTreeView) {
  }
};
