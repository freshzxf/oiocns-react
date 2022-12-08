/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { CheckCard } from '@ant-design/pro-components';
import { Button, Dropdown } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import cls from './index.module.less';
import { common } from 'typings/common';
import marketCtrl from '@/ts/controller/store/marketCtrl';
import appImg from '/img/appLogo.png';
import BuyCustomModal from '@/bizcomponents/AppTableWithBuy/BuyCustomModal';
import { MarketTypes } from 'typings/marketType';

interface Iprops {
  className?: string;
  showBtn?: boolean; //是否展示按钮
  data: any; //数据源
  defaultKey?: any;
  shouOperation?: boolean; //是否展示 右上角操作按钮
  // handleBuyApp?: (_type: 'buy' | 'join', item: BuyAppType['data']) => void;
  onClick?: (e?: Event) => void; //卡片点击事件
  operation?: (_item: MarketTypes.ProductType) => common.OperationType[]; //操作区域数据
}
const defaultObj = {
  name: 'name', //名称
  size: 'size', //大小
  type: 'type', //是否免费
  desc: 'desc', //描述
  typeName: 'typeName', //应用类型
  creatTime: 'creatTime', //上架时间
};
const AppCardShopCar: React.FC<Iprops> = (props) => {
  const {
    data,
    className,
    showBtn = true,
    shouOperation = false,
    defaultKey,
    onClick,
    operation,
    // handleBuyApp,
  } = props;
  const {
    name = 'name',
    size = 'size',
    type = 'type',
    desc = 'desc',
    typeName = 'typeName',
    creatTime = 'creatTime',
  } = { ...defaultObj, ...defaultKey };
  const [isBuy, setIsBuy] = useState<boolean>(false); // 立即购买弹窗
  const [nowBuy, setNowBuy] = useState<any>([]); // 立即购买

  /**
   * @description: 购买商品
   * @return {*}
   */
  const OnBuyShoping = async () => {
    await marketCtrl.buyShoping(nowBuy);
    setIsBuy(false);
  };

  /**
   * @description: 取消订单
   * @return {*}
   */
  const onCancel = () => {
    setIsBuy(false);
  };

  function renderName() {
    return (
      <>
        <span className={cls.nameLabel}>{data[name]}</span>
        {shouOperation ? (
          <Dropdown menu={{ items: operation && operation(data) }} placement="bottom">
            <EllipsisOutlined className={cls.operationBtn} />
          </Dropdown>
        ) : (
          ''
        )}
      </>
    );
  }

  function renderDesc() {
    return (
      <div>
        <p className="app-desc">{data[desc] || '暂无描述'}</p>
        {showBtn ? (
          <p className={cls.btnBox}>
            <Button
              className={cls.btn}
              shape="round"
              onClick={() => {
                setIsBuy(true);
                setNowBuy([data]);
              }}>
              立即购买
            </Button>
          </p>
        ) : (
          ''
        )}
      </div>
    );
  }
  function renderTitle() {
    return (
      <div className={cls.cardTitle}>
        <img style={{ width: 60, height: 60 }} src={appImg} alt="" />
        <span className={cls.version}>V 0.0.1</span>
      </div>
    );
  }

  return (
    <>
      <CheckCard
        avatar={renderTitle()}
        title={renderName()}
        className={`${cls.buyCard} ${className}`}
        description={renderDesc()}
        onClick={onClick}
      />
      <BuyCustomModal
        open={isBuy}
        title="确认订单"
        onOk={OnBuyShoping}
        onCancel={onCancel}
        content="此操作将生成交易订单。是否确认"
      />
    </>
  );
};

export default AppCardShopCar;
