import type { ColumnsType } from 'antd/es/table';
export const columns: ColumnsType<any> = [
  {
    title: '序号',
    fixed: 'left',
    width: 50,
    render: (_key: any, _record: any, index: number) => {
      return index + 1;
    },
  },
  {
    title: '人员名称',
    dataIndex: 'name',
  },
  {
    title: '所属部门',
    dataIndex: 'dept',
  },
  {
    title: '姓名',
    dataIndex: ['team', 'name'],
  },
  {
    title: '职务',
    dataIndex: 'post',
  },
  {
    title: '手机号',
    dataIndex: ['team', 'code'],
  },
];

export const indentitycolumns: ColumnsType<any> = [
  {
    title: '序号',
    fixed: 'left',
    width: 50,
    render: (_key: any, _record: any, index: number) => {
      return index + 1;
    },
  },
  {
    title: '组织名称',
    dataIndex: 'name',
  },
  {
    title: '业务',
    dataIndex: 'business',
  },
  {
    title: '角色',
    dataIndex: 'role',
  },
  {
    title: '备注',
    dataIndex: 'remark',
  },
];
