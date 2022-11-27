import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import cls from './index.module.less';

/**
 * @description: 删除弹窗
 * @return {*}
 */

interface Iprops {
  title: string; // 标题
  open: boolean; // 开关
  onOk: () => void; // 确认
  onCancel: () => void; // 取消
  content: string; // 展示内容
  deleOrQuit: 'delete' | 'quit';
}

const DeleteCustomModal: React.FC<Iprops> = ({
  title,
  open,
  onOk,
  onCancel,
  content,
  deleOrQuit,
}) => {
  return (
    <div className={cls['delete-custom-content']}>
      <Modal
        title={title}
        open={open}
        onOk={onOk}
        onCancel={onCancel}
        getContainer={false}>
        <ExclamationCircleOutlined className={cls['delete-custom-icon']} />
        <span>
          {deleOrQuit === 'delete' ? '确认删除' : '确认退出'} {content}?
        </span>
      </Modal>
    </div>
  );
};
export default DeleteCustomModal;