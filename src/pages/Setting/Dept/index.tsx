import React, { useState, useRef, useEffect } from 'react';
import { Button, message, Modal, Tabs, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { RouteComponentProps } from 'react-router-dom';
import { MarketTypes } from 'typings/marketType';
import { XTarget } from '@/ts/base/schema';
import userCtrl from '@/ts/controller/setting/userCtrl';
import { IDepartment } from '@/ts/core/target/itarget';
import { IAuthority } from '@/ts/core/target/authority/iauthority';
import CardOrTable from '@/components/CardOrTableComp';
import PageCard from '@/components/PageCard';
import SearchPerson from '@/bizcomponents/SearchPerson';
import IndentityManage from '@/bizcomponents/Indentity';
import AddPostModal from '@/bizcomponents/AddPositionModal';
import EditCustomModal from './components/EditCustomModal';
import TransferDepartment from './components/TransferDepartment';
import TreeLeftDeptPage from './components/TreeLeftDeptPage';
import DeptDescription from './components/DeptDescription';
import { columns } from './config';
import SettingService from './service';
import cls from './index.module.less';

type ShowmodelType = 'addOne' | 'edit' | 'post' | 'transfer' | 'indentity' | '';
/**
 * 内设机构
 * @returns
 */
const SettingDept: React.FC<RouteComponentProps> = ({ history }) => {
  const setting = SettingService.getInstance();
  const parentRef = useRef<any>(null); //父级容器Dom
  const [activeModal, setActiveModal] = useState<ShowmodelType>(''); // 模态框
  const [selectId, setSelectId] = useState<string>();
  const [createOrEdit, setCreateOrEdit] = useState<string>('新增'); // 编辑或新增部门模态框标题
  const [deptMembers, setDeptMembers] = useState<XTarget[]>([]); //部门成员
  const [SelectDept, setSelectDept] = useState<IDepartment>(); // 左侧树选中的当前部门对象
  const [selectPerson, setSelectPerson] = useState<XTarget>(); // 选中的要拉的人
  const [editDept, setEditDept] = useState<IDepartment>(); // 当前的编辑部门对象
  // const [isIndentityOpen, setIsIndentityOpen] = useState<boolean>(false);
  const [authorityTree, setAuthorityTree] = useState<IAuthority>();
  // 操作内容渲染函数
  const renderOperation = (item: XTarget): MarketTypes.OperationType[] => {
    return [
      {
        key: 'publish',
        label: '修改信息',
        onClick: () => {
          console.log('按钮事件', 'publish', item);
        },
      },
      {
        key: 'changeDept',
        label: '变更部门',
        onClick: () => {
          setSelectPerson(item);
          setActiveModal('transfer');
        },
      },
      {
        key: 'moveOne',
        label: '移出部门',
        onClick: async () => {
          if (selectPerson && SelectDept) {
            const { success } = await SelectDept.removePerson([item.id]);
            if (success) {
              message.success('移出成功');
              userCtrl.changCallback();
            }
          }
        },
      },
    ];
  };

  /**点击操作内容触发的事件 */
  const handleMenuClick = (key: string, item: IDepartment | undefined, pid?: string) => {
    switch (key) {
      case 'new':
        setting.setCurrTreeDeptNode('');
        setEditDept(undefined);
        setCreateOrEdit('新增');
        setActiveModal('edit');
        break;
      case '新增部门':
        if (!item) return;
        setEditDept(item);
        setCreateOrEdit('新增');
        setSelectId(item.target.id);
        setting.setCurrTreeDeptNode(item.target.id);
        setActiveModal('edit');
        break;
      case 'changeDept': //变更部门
        setActiveModal('transfer');
        break;
      case 'updateDept': // 编辑部门
        if (!item) return;
        setCreateOrEdit('编辑');
        setEditDept(item);
        setSelectId(item.target.id);
        setting.setCurrTreeDeptNode(item.target.id);
        setActiveModal('edit');
        break;
      case '删除部门':
        if (!item) return;
        Modal.confirm({
          title: '提示',
          icon: <ExclamationCircleOutlined />,
          content: '是否确定删除该群组',
          okText: '确认',
          cancelText: '取消',
          onOk: async () => {
            if (pid) {
              const parent = await setting.refItem(pid);
              let result = null;
              if (parent) {
                result = await parent.deleteDepartment(
                  item.target.id,
                  userCtrl.Company.target.id,
                );
              } else {
                result = await userCtrl.Company.deleteDepartment(item.target.id);
              }
              if (result.success) {
                message.success('删除成功');
                userCtrl.changCallback();
              } else {
                message.success('删除失败');
              }
            }
          },
        });
    }
  };

  // 选中树的时候操作
  const setTreeCurrent = (current: IDepartment) => {
    setSelectDept(current);
    setSelectId(current.target.id);
    setting.setCurrTreeDeptNode(current.target.id);
    current.getPerson(false).then((e) => {
      setDeptMembers(e);
    });
    current.selectAuthorityTree(false).then((auths) => {
      if (auths) {
        setAuthorityTree(auths);
      }
    });
  };

  const handleOk = () => {
    setActiveModal('');
    // 处理刷新的功能
    userCtrl.changCallback();
  };
  /**
   * @description: 监听点击事件，关闭弹窗 订阅
   * @return {*}
   */
  useEffect(() => {
    if (!userCtrl.IsCompanySpace) {
      history.push('/setting/info', { refresh: true });
    } else {
      // 刚进入的时候选中公司 TODO
      setting.setCompanyID = userCtrl?.Company?.target.id + '';
      setting.setRoot = userCtrl?.Company!.target;
    }
  }, ['', userCtrl?.Company]);

  useEffect(() => {
    setting.setCompanyID = userCtrl?.Company?.target.id ?? '';
  }, [selectId]);

  // 标题tabs页
  const TitleItems = [
    {
      tab: `部门成员`,
      key: 'deptPerpeos',
    },
    {
      tab: `部门应用`,
      key: 'deptApps',
    },
  ];

  // 按钮
  const renderBtns = () => {
    return (
      <>
        <Button type="link" onClick={() => setActiveModal('indentity')}>
          身份设置
        </Button>
        <Button type="link" onClick={() => setActiveModal('addOne')}>
          添加成员
        </Button>
        <Button type="link" onClick={() => history.push('/todo/org')}>
          查看申请
        </Button>
      </>
    );
  };
  //部门主体
  const deptCount = (
    <div className={cls['pages-wrap']}>
      <PageCard
        bordered={false}
        tabList={TitleItems}
        onTabChange={(key) => {}}
        bodyStyle={{ paddingTop: 16 }}>
        <div className={cls['page-content-table']} ref={parentRef}>
          <Tabs items={[{ label: `全部`, key: '1' }]} tabBarExtraContent={renderBtns()} />
          <CardOrTable<XTarget>
            dataSource={deptMembers}
            rowKey={'id'}
            operation={renderOperation}
            columns={columns}
            parentRef={parentRef}
            showChangeBtn={false}
          />
        </div>
      </PageCard>
    </div>
  );

  return (
    <div className={cls[`dept-content-box`]}>
      <DeptDescription
        title={<Typography.Title level={5}>部门信息</Typography.Title>}
        selectDept={SelectDept?.target}
        extra={[
          <Button
            key="edit"
            type="link"
            onClick={() => handleMenuClick('updateDept', SelectDept)}>
            编辑
          </Button>,
          <Button type="link" key="qx" onClick={() => setActiveModal('post')}>
            权限管理
          </Button>,
        ]}
      />
      {deptCount}
      {/* 编辑部门 */}
      <EditCustomModal
        handleCancel={() => setActiveModal('')}
        editDept={editDept}
        open={activeModal === 'edit'}
        title={createOrEdit}
        handleOk={handleOk}
      />
      <IndentityManage
        open={activeModal === 'indentity'}
        object={SelectDept!}
        MemberData={deptMembers}
        onCancel={() => setActiveModal('')}
      />
      {/* 添加成员*/}
      <Modal
        title="添加成员"
        destroyOnClose
        open={activeModal === 'addOne'}
        onCancel={() => setActiveModal('')}
        onOk={async () => {
          if (selectPerson && SelectDept) {
            const { success, msg } = await SelectDept.pullPerson([selectPerson]);
            if (success) {
              message.success('添加成功');
              handleOk();
            } else {
              message.error(msg);
            }
          }
        }}>
        <SearchPerson searchCallback={setSelectPerson} />
      </Modal>
      {/* 添加成员
      <AddPersonModal
        title={'添加成员'}
        open={isAddOpen}
        onOk={onPersonalOk}
        handleOk={handleOk}
      /> */}

      {/* 变更部门 */}
      <TransferDepartment
        title={'转移部门'}
        open={activeModal === 'transfer'}
        handleOk={handleOk}
        onCancel={() => setActiveModal('')}
        OriginDept={SelectDept!}
        needTransferUser={selectPerson!}
      />
      {/* 对象设置 */}
      {authorityTree && (
        <AddPostModal
          title={'权限设置'}
          open={activeModal === 'post'}
          onOk={() => {}}
          handleOk={handleOk}
          datasource={authorityTree}
        />
      )}
      {/* 左侧树 */}
      <TreeLeftDeptPage
        setCurrent={setTreeCurrent}
        handleMenuClick={handleMenuClick}
        currentKey={SelectDept?.target.id || ''}
      />
    </div>
  );
};

export default SettingDept;
