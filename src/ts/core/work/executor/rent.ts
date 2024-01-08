// import { command, kernel, schema } from '../../../base';
import { kernel, model } from '../../../base';
import { Executor } from '.';
import { IWork } from '..';
import { FormData } from './index';
import { deepClone } from '@/ts/base/common';
import { log } from 'console';

// import { Directory } from '../../thing/directory';

export class RentExecutor extends Executor {
  async execute(data: FormData): Promise<boolean> {
    this.writeDataNew(data);
    return true;
  }

  private async writeData(data: FormData) {
    console.log(data);
    await this.task.loadInstance();
    const work = await this.task.findWorkById(this.task.taskdata.defineId);
    const instance = this.task.instanceData;
    console.log(instance);
    if (work && instance) {
      // 物的集合
      const thingColl = work?.application.directory.target.space.resource.thingColl;
      console.log(thingColl);
      // 找到用户选择的数据
      const formId = this.getForm(instance);
      console.log(this.getForm(instance));
      // 获取用户输入的面积
      const rentValue =
        instance.primary[this.getChangeValueCode(instance, '申请面积') || ''] || 0;
      console.log(rentValue);

      // const form = this.task.instanceData?.node.detailForms;
      if (formId && work) {
        const formArr = await thingColl?.find([formId]);
        const form = formArr ? formArr[0] : null;
        console.log(form);

        // 指定某个数据的某个属性修改
        if (form) {
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
    }
  }

  private async writeDataNew(data: FormData) {
    await this.task.loadInstance();
    const instance = this.task.instanceData;
    console.log(data);
    console.log(instance);
    // 获取修改的数据
    if (instance) {
      const formId = instance.node.detailForms[0].id;
      const editData: model.FormEditData[] = instance.data[formId];
      console.log(editData);
      // 获得修改的对象
      const edit = deepClone(editData[editData.length - 1]);
      console.log(edit);
      // 获取用户输入
      const rentValue = instance.primary[this.getChangeValueCode(instance, '申请面积')];
      console.log(rentValue);

      // 获取当前房产信息
      const totalID = this.getTCode(instance, '登记总面积', formId)?.id;
      const usedID = this.getTCode(instance, '已出租的面积', formId)?.id;
      const usefullID = this.getTCode(instance, '可出租面积', formId)?.id;
      console.log(totalID, usedID, usefullID);
      if (totalID && usedID && usefullID) {
        // 计算剩余面积
        let total = edit.after[0][totalID];
        let used = edit.after[0][usedID];
        used += rentValue;
        let usefull = total - used;
        console.log(total, used, usefull);
        // 设置修改的对象
        edit.after[0][totalID] = total;
        edit.after[0][usedID] = used;
        edit.after[0][usefullID] = usefull;
        console.log(edit);
        data.set(formId, edit);
      }
    }
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

  private getForm(instance: model.InstanceDataModel) {
    const formId = instance.node.detailForms[0].id;
    const form = instance.data[formId ?? ''][0].after[0];
    return form.id;
  }

  private getTCode(
    instance: model.InstanceDataModel,
    name: String,
    formId?: string | undefined,
  ) {
    const form = instance.fields[formId || instance.node.detailForms[0].id];
    return form.find((value) => value.name === name);
  }

  private getChangeValueCode(instance: model.InstanceDataModel, name: String) {
    const attributes = instance.node.primaryForms[0].attributes;
    const data = attributes.find((value) => value.name == name)?.id;
    return data || '';
  }
}
