import { schema, kernel, model } from '../../../base';
import { OperateType, TargetType } from '../../public/enums';
import { PageAll, orgAuth } from '../../public/consts';
import { IBelong } from './belong';
import { Entity, IEntity, entityOperates } from '../../public';
import { IDirectory } from '../../thing/directory';
import { ISession, msgChatNotify } from '../../chat/session';
import { IPerson } from '../person';
import { ChangeNotity, IChangeNotity } from '../change';
import { ITarget } from './target';
import { logger } from '@/ts/base/common';

/** 团队抽象接口类 */
export interface ITeam extends IEntity<schema.XTarget> {
  /** 当前用户 */
  user: IPerson;
  /** 加载归属组织 */
  space: IBelong;
  /** 当前目录 */
  directory: IDirectory;
  /** 成员 */
  members: schema.XTarget[];
  /** 限定成员类型 */
  memberTypes: TargetType[];
  /** 成员会话 */
  memberChats: ISession[];
  /** 组织变更 */
  targetChange: IChangeNotity;
  /** 深加载 */
  deepLoad(reload?: boolean): Promise<void>;
  /** 加载成员 */
  loadMembers(reload?: boolean): Promise<schema.XTarget[]>;
  /** 创建用户 */
  createTarget(data: model.TargetModel): Promise<ITeam | undefined>;
  /** 更新团队信息 */
  update(data: model.TargetModel): Promise<boolean>;
  /** 删除(注销)团队 */
  delete(notity?: boolean): Promise<boolean>;
  /** 用户拉入新成员 */
  pullMembers(members: schema.XTarget[], notity?: boolean): Promise<boolean>;
  /** 用户移除成员 */
  removeMembers(members: schema.XTarget[], notity?: boolean): Promise<boolean>;
  /** 是否有管理关系的权限 */
  hasRelationAuth(): boolean;
  /** 判断是否拥有某些权限 */
  hasAuthoritys(authIds: string[]): boolean;
  /** 接收相关用户增加变更 */
  teamChangedNotity(target: schema.XTarget): Promise<boolean>;
  createTargetMsg(operate: OperateType, subs?: schema.XTarget[]): Promise<void>;
}

/** 团队基类实现 */
export abstract class Team extends Entity<schema.XTarget> implements ITeam {
  constructor(
    _metadata: schema.XTarget,
    _relations: string[],
    _memberTypes: TargetType[] = [TargetType.Person],
  ) {
    super(_metadata);
    this.memberTypes = _memberTypes;
    this.targetChange = new ChangeNotity(
      _metadata,
      _relations,
      'target',
      this._receiveTarget,
    );
  }
  memberTypes: TargetType[];
  members: schema.XTarget[] = [];
  memberChats: ISession[] = [];
  targetChange: IChangeNotity;
  abstract directory: IDirectory;
  private _memberLoaded: boolean = false;
  get isInherited(): boolean {
    return this.metadata.belongId != this.space.id;
  }
  async loadMembers(reload: boolean = false): Promise<schema.XTarget[]> {
    if (!this._memberLoaded || reload) {
      const res = await kernel.querySubTargetById({
        id: this.id,
        subTypeNames: this.memberTypes,
        page: PageAll,
      });
      if (res.success) {
        this._memberLoaded = true;
        this.members = res.data.result || [];
        this.members.forEach((i) => this.updateMetadata(i));
        this.loadMemberChats(this.members, true);
      }
    }
    return this.members;
  }
  async pullMembers(
    members: schema.XTarget[],
    notity: boolean = false,
  ): Promise<boolean> {
    members = members
      .filter((i) => this.memberTypes.includes(i.typeName as TargetType))
      .filter((i) => this.members.every((a) => a.id != i.id));
    if (members.length > 0) {
      if (!notity) {
        const res = await kernel.pullAnyToTeam({
          id: this.id,
          subIds: members.map((i) => i.id),
        });
        if (res.success) {
          this.createTargetMsg(OperateType.Add, members);
        }
        notity = res.success;
      }
      if (notity) {
        this.members.push(...members);
        this.loadMemberChats(members, true);
      }
      return notity;
    }
    return true;
  }
  async removeMembers(
    members: schema.XTarget[],
    notity: boolean = false,
  ): Promise<boolean> {
    members = members
      .filter((i) => this.memberTypes.includes(i.typeName as TargetType))
      .filter((i) => this.members.some((a) => a.id == i.id));
    for (const member of members) {
      if (this.memberTypes.includes(member.typeName as TargetType)) {
        if (!notity) {
          if (member.id === this.userId || this.hasRelationAuth()) {
            await this.createTargetMsg(OperateType.Remove, member);
          }
          const res = await kernel.removeOrExitOfTeam({
            id: this.id,
            subId: member.id,
          });
          if (!res.success) return false;
          notity = res.success;
        }
        if (notity) {
          this.members = this.members.filter((i) => i.id != member.id);
          this.loadMemberChats([member], false);
        }
      }
    }
    return true;
  }
  protected async create(data: model.TargetModel): Promise<schema.XTarget | undefined> {
    data.belongId = this.space.id;
    data.teamCode = data.teamCode || data.code;
    data.teamName = data.teamName || data.name;
    const res = await kernel.createTarget(data);
    if (res.success && res.data?.id) {
      this.space.user.loadGivedIdentitys(true);
      return res.data;
    }
  }
  async update(data: model.TargetModel): Promise<boolean> {
    data.id = this.id;
    data.typeName = this.typeName;
    data.belongId = this.metadata.belongId;
    data.name = data.name || this.name;
    data.code = data.code || this.code;
    data.icon = data.icon || this.metadata.icon;
    data.teamName = data.teamName || data.name;
    data.teamCode = data.teamCode || data.code;
    data.remark = data.remark || this.remark;
    const res = await kernel.updateTarget(data);
    if (res.success && res.data?.id) {
      this.setMetadata(res.data);
      this.createTargetMsg(OperateType.Update);
    }
    return res.success;
  }
  async delete(notity: boolean = false): Promise<boolean> {
    if (!notity) {
      if (this.hasRelationAuth()) {
        await this.createTargetMsg(OperateType.Delete);
      }
      const res = await kernel.deleteTarget({
        id: this.id,
      });
      notity = res.success;
    }
    return notity;
  }
  async loadContent(reload: boolean = false): Promise<boolean> {
    await this.directory.loadContent(reload);
    await this.loadMembers(reload);
    return true;
  }
  operates(): model.OperateModel[] {
    const operates = super.operates();
    if (this.hasRelationAuth()) {
      operates.unshift(entityOperates.Update, entityOperates.Delete);
    }
    return operates;
  }
  abstract space: IBelong;
  abstract user: IPerson;
  abstract deepLoad(reload?: boolean): Promise<void>;
  abstract createTarget(data: model.TargetModel): Promise<ITeam | undefined>;
  abstract teamChangedNotity(target: schema.XTarget): Promise<boolean>;
  loadMemberChats(_newMembers: schema.XTarget[], _isAdd: boolean): void {
    this.memberChats = [];
  }
  hasRelationAuth(): boolean {
    return this.hasAuthoritys([orgAuth.RelationAuthId]);
  }
  hasAuthoritys(authIds: string[]): boolean {
    authIds = this.space.superAuth?.loadParentAuthIds(authIds) ?? authIds;
    const orgIds = [this.metadata.belongId, this.id];
    return this.user.authenticate(orgIds, authIds);
  }
  async createTargetMsg(operate: OperateType, subs?: schema.XTarget[]): Promise<void> {
    await this.targetChange.notity({
      operate,
      target: this.metadata,
      subTarget: sub,
      operater: this.user.metadata,
    });
  }

  async _receiveTarget(data: model.TargetOperateModel) {
    let message = '';
    switch (data.operate) {
      case OperateType.Delete:
        this.delete(true);
        break;
      case OperateType.Update:
        message = `${data.operater?.name}将${data.target.name}信息更新.`;
        this.setMetadata(data.target);
        break;
      case OperateType.Remove:
        if (data.subTarget) {
          if (this.id == data.subTarget.id && 'parentTarget' in this) {
            message = `${this.id === this.user.id ? '您' : this.name}已被${
              data.operater?.name
            }从${data.target.name}移除.`;
            (this.parentTarget as ITarget[])
              .filter((i) => i.id === data.target.id)
              .forEach((i) => {
                i.delete(true);
              });
          } else if (this.id == data.target.id) {
            message = `${data.operater?.name}把${data.subTarget.name}从${data.target.name}移除.`;
            this.removeMembers([data.subTarget!], true);
          }
        }
        break;
      case OperateType.Add:
        if (data.subTarget) {
          message = `${data.operater?.name}把${data.subTarget.name}与${data.target.name}建立关系.`;
          if (this.id === data.subTarget.id) {
            await this.teamChangedNotity(data.target);
          } else if (this.id === data.target.id) {
            await this.teamChangedNotity(data.subTarget);
          }
        }
    }
    if (message.length > 0) {
      if (data.operater?.id != this.user.id) {
        logger.info(message);
      }
      msgChatNotify.changCallback();
      this.changCallback();
    }
  }
}
