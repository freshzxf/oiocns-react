// import { command, kernel, schema } from '../../../base';
import { kernel } from '../../../base';
import { Executor } from '.';
import { IWork } from '..';
// import { Directory } from '../../thing/directory';

export class RentExecutor extends Executor {
  async execute(): Promise<boolean> {
    await this.task.loadInstance();
    const work = await this.task.findWorkById(this.task.taskdata.defineId);
    console.log(this.task);
    console.log(work);
    // console.log(work?.detailForms);
    const thingColl = work?.application.directory.target.space.resource.thingColl;
    const targetData = await thingColl?.find(['T507168857761386498']);
    console.log(targetData);
    const form = this.task.instanceData?.node.detailForms;
    if (form && work) {
      const things = await this.loadThing(10, 0, form[0].id, work);
      console.log(things);

      const data = await thingColl?.update('530830318756835328', {
        _set_: { T507168851763531777: 2000 },
      });
      console.log(data);
    }

    return true;
  }

  /**
   * 加载物
   * @param take 拿几个
   * @param skip 跳过几个
   * @param form 表单
   * @param work 办事
   * @returns 物信息
   */
  private async loadThing(take: number, skip: number, form: string, work: IWork) {
    const loadOptions = {
      take: take,
      skip: skip,
      requireTotalCount: true,
      userData: [`F${form}`],
      filter: ['belongId', '=', this.task.taskdata.applyId],
    };
    return await kernel.loadThing(
      work.application.belongId,
      [this.task.taskdata.applyId, work.application.directory.target.id],
      loadOptions,
    );
  }
}
