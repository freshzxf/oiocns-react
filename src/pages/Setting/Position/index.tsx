/* eslint-disable no-unused-vars */
import ReactDOM from 'react-dom';
import { Card, Modal, Button } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import cls from './index.module.less';
import CardOrTable from '@/components/CardOrTableComp';
import { MarketTypes } from 'typings/marketType';
import { columns, indentitycolumns } from './config';
import EditCustomModal from './components/EditCustomModal';
import TreeLeftDeptPage from './components/TreeLeftPosPage/CreatePos';
import { RouteComponentProps } from 'react-router-dom';
import { IIdentity } from '@/ts/core/target/authority/iidentity';
import { XTarget } from '@/ts/base/schema';
import AssignPosts from './components/AssignPosts';
import { schema } from '@/ts/base';
import { PlusOutlined } from '@ant-design/icons';
import IndentityManage from '@/bizcomponents/AddIndentity';
import userCtrl from '@/ts/controller/setting/userCtrl';
type RouterParams = {
  id: string;
};
/**
 * 岗位设置
 * @returns
 */
const SettingDept: React.FC<RouteComponentProps<RouterParams>> = () => {
  const parentRef = useRef<any>(null); //父级容器Dom
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false); // 添加成员
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [selectId, setSelectId] = useState<string>();
  const [isCreateDept, setIsCreateDept] = useState<boolean>(false);
  const [indentity, setIndentity] = useState<IIdentity>();
  const [indentitys, setIndentitys] = useState<IIdentity[]>([]);
  const [_currentPostion, setPosition] = useState<any>({});
  const [isOpenAssign, setIsOpenAssign] = useState<boolean>(false);
  const [memberData, setMemberData] = useState<schema.XTarget[]>([]);
  const [person, setPerson] = useState<schema.XTarget[]>();
  const [personData, setPersonData] = useState<XTarget[]>();

  const treeContainer = document.getElementById('templateMenu');

  useEffect(() => {
    getIndentitys();
  }, []);

  const getIndentitys = async () => {
    setIndentitys(await userCtrl.Company.getIdentitys());
  };
  // 操作内容渲染函数
  const renderOperation = (
    item: MarketTypes.ProductType,
  ): MarketTypes.OperationType[] => {
    return [
      {
        key: 'remove',
        label: '调整岗位',
        onClick: async () => {
          console.log('按钮事件', 'remove', item);
        },
      },
      {
        key: 'remove',
        label: '移出岗位',
        onClick: async () => {
          console.log('按钮事件', 'remove', item);
        },
      },
    ];
  };
  // 操作内容渲染函数
  const reRenderOperation = (
    item: MarketTypes.ProductType,
  ): MarketTypes.OperationType[] => {
    return [
      {
        key: 'update',
        label: '修改',
        onClick: async () => {
          console.log('按钮事件', 'remove', item);
        },
      },
      {
        key: 'remove',
        label: '删除',
        onClick: async () => {
          console.log('按钮事件', 'remove', item);
        },
      },
    ];
  };

  const onOk = () => {
    setIsAddOpen(false);
    setIsOpenModal(false);
  };
  const handleOk = () => {
    setIsAddOpen(false);
    setIsOpenModal(false);
  };
  /**点击操作内容触发的事件 */
  const handleMenuClick = (key: string, item: any) => {};
  // 选中树的时候操作
  const setTreeCurrent = async (current: IIdentity) => {
    console.log('选中树中的数据', current);
  };
  const onCheckeds = (teamId: string, type: string, checkedValus: any) => {
    console.log('输出选择', teamId, type, checkedValus);
  };

  const header = (
    <div className={`${cls['dept-wrap-pages']}`}>
      <div className={`pages-wrap flex flex-direction-col ${cls['pages-wrap']}`}>
        <Card className={cls['app-tabs']} bordered={false}>
          <div className={cls.topMes} style={{ marginRight: '25px' }}>
            <strong style={{ marginLeft: '20px', fontSize: 15 }}>待定岗位</strong>
            <Button
              className={cls.creatgroup}
              type="text"
              icon={<PlusOutlined className={cls.addIcon} />}
              style={{ float: 'right' }}
              onClick={() => {
                setIsAddOpen(true);
              }}
            />
          </div>
          <div className={`pages-wrap flex flex-direction-col ${cls['pages-wrap']}`}>
            <div className={cls['page-content-table']} ref={parentRef}>
              <CardOrTable
                dataSource={personData as any}
                rowKey={'id'}
                operation={reRenderOperation}
                columns={indentitycolumns as any}
                parentRef={parentRef}
                showChangeBtn={false}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
  const deptCount = (
    <div className={`${cls['dept-wrap-pages']}`}>
      <div className={`pages-wrap flex flex-direction-col ${cls['pages-wrap']}`}>
        <Card className={cls['app-tabs']} bordered={false}>
          <div className={cls.topMes} style={{ marginRight: '25px' }}>
            <strong style={{ marginLeft: '20px', fontSize: 15 }}>待定岗位</strong>
            <Button
              className={cls.creatgroup}
              type="text"
              icon={<PlusOutlined className={cls.addIcon} />}
              style={{ float: 'right' }}
              onClick={() => {
                setIsOpenAssign(true);
              }}
            />
          </div>
          <div className={`pages-wrap flex flex-direction-col ${cls['pages-wrap']}`}>
            <div className={cls['page-content-table']} ref={parentRef}>
              <CardOrTable
                dataSource={personData as any}
                rowKey={'id'}
                operation={renderOperation}
                columns={columns as any}
                parentRef={parentRef}
                showChangeBtn={false}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className={cls[`dept-content-box`]}>
      {header}
      {deptCount}
      {/* 编辑单位 */}
      <EditCustomModal
        handleCancel={() => {
          setIsOpenModal(false);
        }}
        selectId={selectId}
        open={isOpenModal}
        title={isCreateDept ? '新增' : '编辑'}
        onOk={onOk}
        handleOk={handleOk}
        defaultData={indentity!}
        callback={setIndentity}
      />
      <Modal
        title="添加身份"
        open={isAddOpen}
        // onOk={changeHandleOk}
        onCancel={() => setIsAddOpen(false)}
        width="1050px">
        <IndentityManage shareType="" onCheckeds={onCheckeds} />
      </Modal>
      <Modal
        title="指派岗位"
        open={isOpenAssign}
        width={1300}
        onOk={async () => {
          setIsOpenAssign(false);
        }}
        onCancel={() => {
          setIsOpenAssign(false);
        }}>
        <AssignPosts searchCallback={setPerson} memberData={memberData} />
      </Modal>

      {/* 左侧树 */}
      {treeContainer
        ? ReactDOM.createPortal(
            <TreeLeftDeptPage
              createTitle="新增岗位"
              setCurrent={setTreeCurrent}
              handleMenuClick={handleMenuClick}
              currentKey={indentitys.length > 0 ? indentitys[0].target.id : ''}
              indentitys={indentitys}
            />,
            treeContainer,
          )
        : ''}
    </div>
  );
};

export default SettingDept;
