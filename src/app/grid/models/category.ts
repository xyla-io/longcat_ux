import { OptionConfig } from "src/app/iomap/util/options";
import { ColumnFlagEnum, PerformanceColumnOps } from "../../util/ops/performance-column";

export enum CategoryEnum {
  Channel = 'channel',
  ProductName = 'product_name',
  Platform = 'platform',
}

export interface CategoryOptionConfig extends OptionConfig<any> {
  displayName: string;
}

export class CategoryOps {

  static categoryOptions: Record<CategoryEnum, CategoryOptionConfig> = Object.freeze({
    [CategoryEnum.Channel]: {
      displayName: 'Channel',
    },
    [CategoryEnum.ProductName]: {
      displayName: 'Product Name',
    },
    [CategoryEnum.Platform]: {
      displayName: 'Platform',
    },
  });


  static getOptionConfig(fullColumnName) {
    return CategoryOps.categoryOptions[PerformanceColumnOps.removeFlags(fullColumnName)];
  }

  static groupDisplayMap = {
    tag: '🏷',
  };

  static makeDisplayName(columnName: string): string {
    let rawName = PerformanceColumnOps.removeFlag(columnName, ColumnFlagEnum.Category);
    const optionConfig = CategoryOps.categoryOptions[rawName] as CategoryOptionConfig;
    if (optionConfig) { return optionConfig.displayName; }
    const groupInfo = PerformanceColumnOps.getColumnGroup(rawName);
    if (groupInfo) {
      return `${CategoryOps.groupDisplayMap[groupInfo.columnGroup] || groupInfo.columnGroup} ${groupInfo.columnName}`;
    }
    return rawName;
  }
}