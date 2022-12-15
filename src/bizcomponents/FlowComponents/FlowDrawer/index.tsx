import React from 'react';
import { Drawer } from 'antd';
import EditTitle from './components/EditTitle';
import RootNode from './components/RootNode';
import ApprovalNode from './components/ApprovalNode';
import CcNode from './components/CcNode';
import ConditionNode from './components/ConditionNode';
import { AddNodeType } from '@/ts/controller/setting/processType';

/**
 * @description: 流程设置抽屉
 * @return {*}
 */

interface Iprops {
  isOpenFlow: boolean;
  onClose: () => void;
  selectNodeType: AddNodeType;
}

const FlowDrawer: React.FC<Iprops> = ({ isOpenFlow, onClose, selectNodeType }) => {
  const concurrents = () => {
    return <div>暂无’同时审核‘弹窗需要处理的数据</div>;
  };

  const AddtypeAndComponentMaps: Record<AddNodeType, React.FC> = {
    [AddNodeType.ROOT]: RootNode,
    [AddNodeType.APPROVAL]: ApprovalNode,
    [AddNodeType.CC]: CcNode,
    [AddNodeType.CONDITION]: ConditionNode,
    [AddNodeType.CONCURRENTS]: concurrents,
  };

  const Component = AddtypeAndComponentMaps[selectNodeType];

  return (
    <Drawer
      title={<EditTitle />}
      placement="right"
      open={isOpenFlow}
      onClose={() => onClose()}
      width={600}>
      <Component />
    </Drawer>
  );
};

export default FlowDrawer;