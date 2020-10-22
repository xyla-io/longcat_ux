import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChannelOps } from 'src/app/iomap/models/channel';
import { PlatformOps } from 'src/app/iomap/models/platform';
import { ChannelIconService } from 'src/app/services/assets/channel-icon.service';
import { PerformanceColumnOps } from 'src/app/util/ops/performance-column';
import { GridGroup } from '../../interfaces/grid-group.abstract';
import { CategoryOps } from '../../models/category';
import { NodeUtil } from '../../util/node-util';

@Component({
  selector: 'app-node-performance-group',
  templateUrl: './node-performance-group.component.html',
  styleUrls: ['./node-performance-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodePerformanceGroupComponent extends GridGroup implements OnInit {
  ChannelIconService = ChannelIconService;
  ChannelOps = ChannelOps;
  CategoryOps = CategoryOps;
  PlatformOps = PlatformOps;

  get unflaggedCategory() {
    return PerformanceColumnOps.removeFlags(this.node.field);
  }

  channelRelatedCategories = ['channel', 'tag_channel'];
  platformRelatedCategories = ['platform', 'tag_platform'];

  get icon(): string|undefined {
    if (this.channelRelatedCategories.includes(this.unflaggedCategory.toLowerCase())) {
      const icon = ChannelIconService.iconForChannel(this.node.key);
      return icon;
    }
    return undefined;
  }

  get iconBackground() {
    if (this.channelRelatedCategories.includes(this.unflaggedCategory.toLowerCase())) {
      const optionConfig = ChannelOps.channelOptions[this.node.key];
      return (optionConfig && optionConfig.color) || undefined;
    }
    return 'none';
  }

  get isChannelRelatedCategory() {
    return this.channelRelatedCategories.includes(this.unflaggedCategory.toLowerCase());
  }

  get isPlatformRelatedCategory() {
    return this.platformRelatedCategories.includes(this.unflaggedCategory.toLowerCase());
  }

  get name() {
    if (this.isChannelRelatedCategory) {
      const optionConfig = ChannelOps.channelOptions[this.node.key];
      return (optionConfig && optionConfig.displayName) || this.node.key;
    } else if (this.isPlatformRelatedCategory) {
      const optionConfig = PlatformOps.platformOptions[this.node.key];
      return (optionConfig && optionConfig.displayName) || this.node.key;
    }
    return this.node.key;
  }

  get category() {
    return NodeUtil.extractColumnName(this.node.field);
  }

  get childCategory() {
    const child = this.node.allLeafChildren[0];
    if (!child) { return undefined; }
    const category = child.data.treeSettings.childGroups[0]
    if (!category) { return undefined; }
    return CategoryOps.makeDisplayName(category);
  }

  constructor(
    changeDetector: ChangeDetectorRef,
  ) {
    super(changeDetector);
  }

  ngOnInit() {
    super.ngOnInit();
  }

}
