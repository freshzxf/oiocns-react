// import { command, kernel, schema } from '../../../base';
import { kernel, model } from '../../../base';
import { Executor } from '.';
import { IWork } from '..';
import { FormData } from './index';

// import { Directory } from '../../thing/directory';

export class RentExecutor extends Executor {
  async execute(data: FormData): Promise<boolean> {
    await this.task.loadInstance();
    const work = await this.task.findWorkById(this.task.taskdata.defineId);
    const instance = this.task.instanceData;
    console.log(instance);

    // console.log(this.task);
    // console.log(work);
    // console.log(work?.detailForms);
    // 物的集合
    const thingColl = work?.application.directory.target.space.resource.thingColl;
    console.log(thingColl);

    // todo 需要找到用户选择的数据

    const formId = this.getForm(instance);
    console.log(this.getForm(instance));

    // 获取用户输入的面积
    const rentValue =
      instance?.primary[this.getChangeValueCode(instance, '申请面积') || ''] || 0;
    console.log(rentValue);

    // const form = this.task.instanceData?.node.detailForms;
    if (formId && work) {
      const things = await this.loadThing(10, 0, formId, work);
      const formArr = await thingColl?.find([formId]);
      const form = formArr ? formArr[0] : null;
      console.log(form);

      // 指定某个数据的某个属性修改
      if (form) {
        console.log(things);
        console.log(this.getTCode(instance, '房产名称'));
        const totalTCode = this.getTCode(instance, '登记总面积')?.code;
        const usedTCode = this.getTCode(instance, '已出租的面积')?.code;
        const usefullTCode = this.getTCode(instance, '可出租面积')?.code;
        console.log(totalTCode, usedTCode, usefullTCode);

        if (totalTCode && usedTCode && usefullTCode) {
          let total = form[totalTCode];
          let used = form[usedTCode];
          used += rentValue;
          let usefull = total - used;
          console.log(total, used, usefull);
          const obj: Record<string, unknown> = {};
          obj[usefullTCode] = usefull;
          obj[usedTCode] = used;
          const data = await thingColl?.update(formId, {
            _set_: obj,
          });
          console.log(data);
        }
      }
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

  private getForm(instance: model.InstanceDataModel | undefined) {
    const formId = instance?.node.detailForms[0].id;
    const form = instance?.data[formId ?? ''][0].after[0];
    return form?.id;
  }

  private getTCode(instance: model.InstanceDataModel | undefined, name: String) {
    const form = instance?.fields[instance.node.detailForms[0].id];
    return form?.find((value) => value.name === name);
  }

  private getChangeValueCode(
    instance: model.InstanceDataModel | undefined,
    name: String,
  ) {
    const attributes = instance?.node.primaryForms[0].attributes;
    return attributes?.find((value) => value.name == name)?.id;
  }
}
