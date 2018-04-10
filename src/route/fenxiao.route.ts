import Router = require("koa-router");
import Ctrl = require("../controller");
import { Context } from "./util";
import db = require("../model");
import { wechatRouter } from "./wechat.route";
let fenxiaoRouter = new Router();
let fxApi = {
  // 商户接口
  shopSignin: "/fenxiao/shop-user/signin", // Post {Phone,Password}
  shopSignup: "/fenxiao/fenxiao-user/signup", // Post ShopUser
  userAuthCode: "/fenxiao/user-auth-code", //Get Phone
  queryAuthCodeDetail: "/fenxiao/query-detail", //Get Phone,
  forgotPassword: "/fenxiao/forgotPassword",
  fxUserInfo: "/fenxiao/user-info", // get userId

  // 分销商接口
  submitShop: "/fenxiao/submit-shop", // Post  SubmitShop
  fenxiaoShop: "/fenxiao/",
  fxSignin: "/fenxiao/fenxiao-user/signin", // Post{Phone,Password}
  fxSignup: "/fenxiao/fenxiao-user/signup", //Post  FenxiaoUser
  fxUserRelation: "/fenxiao/fenxiao-user/relation",
  fxUserSubmitShops: "/fenxiao/list-submit-shop",




  // 分销商查询 接口 可以游客微信查询
  queryMySubmitShop: "/fenxiao/query-mysubmitshop"
};
fenxiaoRouter
  // 通用接口
  .get(fxApi.userAuthCode, Ctrl.fxCtrl.userAuthCode)
  .get(fxApi.queryAuthCodeDetail, Ctrl.fxCtrl.queryDetail)
  // 分销商api
  .post(fxApi.fxSignin, Ctrl.fxCtrl.fenxaioUserLogin)
  .post(
    fxApi.fxSignup,
    Ctrl.fxCtrl.checkAuthCode,
    Ctrl.fxCtrl.fenxiaoUserSignup
  )
  .post(fxApi.submitShop, Ctrl.fxCtrl.authFxUserLogin, Ctrl.fxCtrl.submitShop)
  .post(fxApi.forgotPassword, Ctrl.fxCtrl.forgotPassword)
  .get(fxApi.fxUserRelation, Ctrl.fxCtrl.fxUserRelation)
  .get(fxApi.fxUserInfo, Ctrl.fxCtrl.fxUserMoney)
  .get(fxApi.fxUserSubmitShops, Ctrl.fxCtrl.fxUserSubmitRecords)
  // 商户
  .post(fxApi.shopSignin, Ctrl.fxCtrl.shopUserSignin)
  .post(fxApi.fxSignup, Ctrl.fxCtrl.checkAuthCode, Ctrl.fxCtrl.shopUserSignup)
  .get(fxApi.queryMySubmitShop, wechatRouter.shopUserSignup, Ctrl.fxCtrl.queryMySubmitShop)
// .get(fxApi.fex)

export { fenxiaoRouter };
