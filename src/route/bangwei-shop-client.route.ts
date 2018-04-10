import { Context } from "./util";
import service = require('../service');
import db = require("../model");
import Router = require('koa-router');
import { ShopUser, ActionState, OrderActionState } from "../model/fenxiao";
import { BangweiOrderState } from "../model/bangwei";
import { bangweiShopClientCtrl as bwscCtrl } from '../controller/bangwei-shop-client.controller';
let bwscRouter = new Router();
export let bwscApi = {
  /**
   *  method: get  
   */
  listGroupAndProducs: "/api/bangwei-shop-client/list-group-and-products",

  productDetail: "/api/bangwei-shop-client/product-detail",
  checkUserLogin: "/api/bangwei-shop-client/check-user-login",
  userLogin: "/api/bangwei-shop-client/user-login",
  userActiveTickets: "/api/bangwei-shop-client/user-active-tickets",
  userUnpayOrders: "/api/bangwei-shop-client/user-unpay-orders",
  userCreateOrder: "/api/bangwei-shop-client/user-create-order",
  userAddOrderNum: "/api/bangwei-shop-client/user-add-order-num",
  userLessOrderNum: "/api/bangwei-shop-client/user-less-order-num",
  userHistoryOrders: "/api/bangwei-shop-client/user-history-orders",
  orderDetail: "/api/bangwei-shop-client/order-detail",
  payOrder: "/api/bangwei-shop-client/pay-order",
  getPayOrderParams: "/api/bangwei-shop-client/pay-order-params",
  getGroupAndProducts: "/api/bangwei-shop-client/getGroupAndProducts",
  addProductToCollects: '/api/bangwei-shop-client/add-product-collects', //添加产品收藏,
  getCollects: '/api/bangwei-shop-client/product-collects', // 获取用户产品 搜藏    get: ?shopUserId
  listUserUnpayOrder: '/api/bangwei-shop-client/list-user-unpay-order',  //列出用户待付款
  removeUnpayOrders: '/api/bangwei-shop-client/remove-unpay-orders', // 取消订单
  getShopUserInfo: '/api/bangwei-shop-client/get-shopuserinfo', // 商城用户信息
  updateShopUserInfo: '/api/bangwei-shop-client/update-shopuser-info',
  getShopUserCollects: '/api/bangwei-shop-client/get-shopuser-collects', // 获取商户的收藏产品
  removeShopUserCollect: '/api/bangwei-shop-client/remove-shopuser-collect', //移除商户用户的收藏 collectId
  getHistoryViewProducts: "/api/bangwei-shop-client/get-historyview-products",  // 用户浏览历史
  addHistoryViewProduct: '/api/bangwei-shop-client/add-historyview-product',   // 添加用户浏览历史
  shopUserReciveAddress: '/api/bangwei-shop-client/recive-address-list', //get 获取用户收获地址,isDefault=true为默认收获地址
  createShopUserReciveAddress: '/api/bangwei-shop-client/create-recive-address', // post 创建用户收获地址 query:shopUserId   body :ReciveAddress
  setDefaultReciveAddress: '/api/bangwei-shop-client/set-default-recive-address', // get 设置商户默认用户地址 shopUserId reciveAddressId 
  updateReciveAddress: '/api/bangwei-shop-client/update-recive-address', // post 更新收获地址query:  shopUserId  reciveAddressId,body:ReciveAddress
  listShopUserOrders: '/api/bangwei-shop-client/list-shopuser-orders',   // get :query shopUserId,
  getUnpayOrderDetail: '/api/bangwei-shop-client/get-unpay-order-detail' // 获取未支付的订单详情 // 获取产品支付页面参数 ,包括未使用的优惠券和产品数据订单数据


};
/**
 *
 * 邦为产品客户端 angular2
 */
bwscRouter
  .get(bwscApi.listGroupAndProducs, bwscCtrl.listGroupAndProducts)
  .get(bwscApi.productDetail, bwscCtrl.productDetail)
  .get(bwscApi.checkUserLogin, bwscCtrl.checkUserLogin)
  .post(bwscApi.userLogin, bwscCtrl.userLogin)
  .get(
    bwscApi.userActiveTickets,
    bwscCtrl.authUser,
    bwscCtrl.userActiveTickets
  )
  .post(
    bwscApi.userCreateOrder,
    // bwscCtrl.authUser,
    bwscCtrl.userCreateOrder
  )
  .put(
    bwscApi.userLessOrderNum,
    // bwscCtrl.authUser,
    bwscCtrl.lessUserOrderNum
  )
  .put(bwscApi.userAddOrderNum, bwscCtrl.authUser, bwscCtrl.addUserOrderNum)
  .get(
    bwscApi.userHistoryOrders,
    bwscCtrl.authUser,
    bwscCtrl.userHistoryOrders
  )
  .get(bwscApi.userUnpayOrders, bwscCtrl.userUnpayOrders)
  // .get(bwscApi.userUnpayOrders, bwscCtrl.authUser)
  .get(bwscApi.orderDetail, bwscCtrl.orderDetail)
  .post(bwscApi.payOrder, bwscCtrl.payOrder) // 支付订单
  .get(bwscApi.getPayOrderParams, bwscCtrl.getPayOrderParams)
  .get(bwscApi.getGroupAndProducts, bwscCtrl.getGroupAndProducts)
  .get(bwscApi.addProductToCollects, bwscCtrl.addCollect)
  .get(bwscApi.getCollects, bwscCtrl.getUserCollect)
  .get(bwscApi.userUnpayOrders, bwscCtrl.userUnpayOrders)
  .delete(bwscApi.removeUnpayOrders, bwscCtrl.removeUnPayOrders)
  .get(bwscApi.getShopUserInfo, bwscCtrl.getShopUserInfo)
  .post(bwscApi.updateShopUserInfo, bwscCtrl.updateShopUserInfo)
  .get(bwscApi.getShopUserCollects, bwscCtrl.getShopUserCollects)
  .get(bwscApi.removeShopUserCollect, bwscCtrl.removeShopUserCollect)
  .get(bwscApi.addHistoryViewProduct, bwscCtrl.addHistoryViewProduct)
  .get(bwscApi.getHistoryViewProducts, bwscCtrl.getHistoryViewProducts)
  .get(bwscApi.setDefaultReciveAddress, bwscCtrl.setDefaultUserReciveAddress)
  .post(bwscApi.updateReciveAddress, bwscCtrl.updateReciveAddress)
  .get(bwscApi.listShopUserOrders, bwscCtrl.listShopUserOrders)
  .get(bwscApi.getUnpayOrderDetail, bwscCtrl.getUnpayOrderDetail)
export { bwscRouter }