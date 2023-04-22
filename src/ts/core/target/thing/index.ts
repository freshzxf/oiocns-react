import { kernel } from '@/ts/base';
import { ISpeciesItem } from './ispecies';
import { SpeciesItem } from './species';

/**
 * 加载分类树
 * @param id 组织id
 */
export const loadSpeciesTree = async (
  shareId: string,
  spaceId: string,
  upTeam: boolean = false,
) => {
  const result: ISpeciesItem[] = [];
  const res = await kernel.querySpeciesTree({
    id: shareId,
    upTeam: upTeam,
  });
  if (res.success && res.data && res.data.result && res.data.result.length > 0) {
    for (const item of res.data.result) {
      result.push(new SpeciesItem(item, undefined, shareId, spaceId));
    }
  }
  return result;
};
export type { INullSpeciesItem, ISpeciesItem } from './ispecies';
