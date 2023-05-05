import React, { useEffect, useState } from 'react';
import CardOrTable from '@/components/CardOrTableComp';
import { XProperty } from '@/ts/base/schema';
import { PropertyColumns } from '@/pages/Setting/config/columns';
import useObjectUpdate from '@/hooks/useObjectUpdate';
import PropertyModal from '@/bizcomponents/GlobalComps/createProperty';
import { message } from 'antd';
import { IPropClass } from '@/ts/core';
/**
 * @description: 分类特性标准
 * @return {*}
 */
const Property: React.FC<any> = ({ current }: { current: IPropClass }) => {
  const [modalType, setModalType] = useState('');
  const [tkey, tforceUpdate] = useObjectUpdate(current);
  const [editData, setEditData] = useState<XProperty>();
  useEffect(() => {
    current.loadPropertys().then(() => {
      tforceUpdate();
    });
  }, []);
  // 操作内容渲染函数
  const renderOperate = (item: XProperty) => {
    return [
      {
        key: '修改属性',
        label: '编辑属性',
        onClick: () => {
          setEditData(item);
          setModalType('修改属性');
        },
      },
      {
        key: '删除属性',
        label: '删除属性',
        onClick: async () => {
          await current.deleteProperty(item);
          tforceUpdate();
        },
      },
    ];
  };

  useEffect(() => {
    tforceUpdate();
  }, []);

  return (
    <>
      <CardOrTable<XProperty>
        rowKey={'id'}
        params={tkey}
        operation={renderOperate}
        columns={PropertyColumns}
        showChangeBtn={false}
        dataSource={current.propertys}
      />
      {/** 新增/编辑属性模态框 */}
      <PropertyModal
        species={current}
        data={editData}
        open={modalType != ''}
        handleCancel={() => {
          setModalType('');
        }}
        handleOk={function (success: boolean): void {
          setModalType('');
          if (success) {
            message.success('操作成功');
            tforceUpdate();
          }
        }}
      />
    </>
  );
};
export default Property;
