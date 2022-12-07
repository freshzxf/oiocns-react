import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Row, Col, Space, Button } from 'antd';
import cls from './index.module.less';
import { IGroup } from '@/ts/core/target/itarget';
// import userCtrl from '@/ts/controller/setting/userCtrl';

interface Iprops {
  title: string;
  open: boolean;
  onOk: () => void;
  handleOk: (item: any) => void;
  handleCancel: () => void;
  selectId?: string;
  currentGroup?: IGroup;
  [key: string]: any;
}

const { TextArea } = Input;

const EditCustomModal = (props: Iprops) => {
  // const [thisGroup, setThisGroup] = useState<IGroup>();

  const { open, title, handleOk, handleCancel, currentGroup, selectId } = props;
  const [form] = Form.useForm();
  useEffect(() => {
    form.resetFields();
  }, [props.open]);

  return (
    <div className={cls['edit-custom-modal']}>
      <Modal
        title={title}
        open={open}
        onOk={handleOk}
        onCancel={() => handleCancel()}
        getContainer={false}
        destroyOnClose={true}
        footer={null}>
        <Form form={form} layout="vertical">
          <Row>
            <Col span={12}>
              <Form.Item
                name="name"
                label="集团名称"
                initialValue={
                  selectId == 'update' && currentGroup ? currentGroup?.target.name : ''
                }
                rules={[{ required: true, message: '请输入集团名称!' }]}>
                <Input placeholder="请输入集团名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="集团编号"
                initialValue={
                  selectId == 'update' && currentGroup ? currentGroup?.target.code : ''
                }
                rules={[{ required: true, message: '请输入集团编号!' }]}>
                <Input placeholder="请输入集团编号" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                name="teamRemark"
                initialValue={
                  selectId == 'update' && currentGroup
                    ? currentGroup?.target.team?.remark
                    : ''
                }
                label="描述"
                rules={[{ required: true, message: '请输入集团描述!' }]}>
                <TextArea
                  placeholder="请输入集团描述"
                  autoSize={{ minRows: 1, maxRows: 1 }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <Space>
              <Button
                type="primary"
                onClick={async () => {
                  const value = await form.validateFields();
                  if (value) {
                    value.selectId = selectId;
                    handleOk(value);
                  }
                }}>
                完成
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default EditCustomModal;