import ImageView from './image';
import VideoView from './video';
import React from 'react';
import FormView from './form';
import WorkStart from './work';
import TaskContent from './task';
import JoinApply from './task/joinApply';
import OfficeView from './office';
import ReportView from './report';
import TransferView from './transfer';
import AudioPlayer from './audio';
import CodeEditor from './codeeditor';
import EntityForm from '../operate/entityForm';
import { IEntity, IForm, ISysFileInfo, TargetType } from '@/ts/core';
import { model, schema } from '@/ts/base';
import LabelModal from '../design/labelsModal';
const audioExt = ['.mp3', '.wav', '.ogg'];

const officeExt = ['.md', '.pdf', '.xls', '.xlsx', '.doc', '.docx', '.ppt', '.pptx'];
const videoExt = ['.mp4', '.avi', '.mov', '.mpg', '.swf', '.flv', '.mpeg'];
const remarkTypes: any = { 分类: 'Species', 字典: 'Dict', 属性: 'Property' };

interface IOpenProps {
  cmd: string;
  entity: IEntity<schema.XEntity> | ISysFileInfo | model.FileItemShare;
  finished: () => void;
}
const ExecutorOpen: React.FC<IOpenProps> = (props: IOpenProps) => {
  if ('size' in props.entity || 'filedata' in props.entity) {
    const data = 'size' in props.entity ? props.entity : props.entity.filedata;
    if (data.contentType?.startsWith('image')) {
      return <ImageView share={data} finished={props.finished} />;
    }
    if (
      data.contentType?.startsWith('video') ||
      videoExt.includes(data.extension ?? '-')
    ) {
      return <VideoView share={data} finished={props.finished} />;
    }
    if (officeExt.includes(data.extension ?? '-')) {
      return <OfficeView share={data} finished={props.finished} />;
    }
    if (
      data.contentType?.startsWith('audio') ||
      audioExt.includes(data.extension ?? '-')
    ) {
      const dir = 'filedata' in props.entity ? props.entity.directory : undefined;
      return <AudioPlayer finished={props.finished} directory={dir} share={data} />;
    }
    if (data.contentType?.startsWith('text')) {
      return <CodeEditor share={data} finished={props.finished} />;
    }
  } else {
    switch (props.entity.typeName) {
      case '事项配置':
      case '实体配置': {
        const form = props.entity as IForm;
        if (form.canDesign && props.cmd === 'open') {
          return <FormView form={form} finished={props.finished} />;
        }
        return <LabelModal current={form} finished={props.finished} />;
      }
      case '迁移配置':
        return <TransferView current={props.entity as any} finished={props.finished} />;
      case '办事':
      case '子流程':
        return <WorkStart current={props.entity as any} finished={props.finished} />;
      case '报表':
        return <ReportView current={props.entity as any} finished={props.finished} />;
      case '加用户':
        return <JoinApply current={props.entity as any} finished={props.finished} />;
      case '事项':
        return <TaskContent current={props.entity as any} finished={props.finished} />;
      default:
        if (remarkTypes[props.entity.typeName]) {
          return (
            <EntityForm
              cmd={`remark${remarkTypes[props.entity.typeName]}`}
              entity={props.entity}
              finished={props.finished}
            />
          );
        }
        if (Object.values(TargetType).includes(props.entity.typeName as TargetType)) {
          return (
            <EntityForm cmd="remark" entity={props.entity} finished={props.finished} />
          );
        }
    }
  }
  return <></>;
};

export default ExecutorOpen;