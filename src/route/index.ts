import Router = require("koa-router");
import db = require("../model");
import { bwsAdminRouter } from "./bangwei-shop.admin.route";
import { bwscRouter } from "./bangwei-shop-client.route";

import { bangweiClientRouter as bwcRouter, bangweiClientRouter } from "./bangweiShop.route";
import { fenxiaoRouter } from "./fenxiao.route";
import { fxAdminRouter } from "./fenxiao-admin.route";
import { wechatRouter } from "./wechat.route";
import { short } from "./short";






let router = new Router();

router
  .get("/product/:productId", bwcRouter.cacheGroups, bwcRouter.productDetail)
  .get("/group/:groupId", bwcRouter.cacheGroups, bwcRouter.groupDetail)
  .post("/createOrder/json", bwcRouter.createOrderJson)
  .get("/login", bwcRouter.login)
  .post("/login", bwcRouter.loginDo)
  .get("/user/tickets/json", bwcRouter.checkUserLogin, bwcRouter.userTickets)
  .get(
    "/user/order/active/json",
    bwcRouter.checkUserLogin,
    bwcRouter.userActiveOrdersJson
  )
  .get(
    "/user/shoping-cart",
    bwcRouter.checkUserLogin,
    bwcRouter.userShopingCart
  )
  .get("/user/removeOrder", bwcRouter.checkUserLogin, bwcRouter.userRemoveOrder)
  .get("/user/addOrderNum", bwcRouter.checkUserLogin, bwcRouter.addUserOrderNum)
  .get(
    "/user/lessOrderNum",
    bwcRouter.checkUserLogin,
    bwcRouter.lessUserOrderNum
  )



  //邦为三级分销
  .get("/fenxiao/user/signin")

  // 邦为h5 提交表单
  .post("/bangwei-h5/submit-shop", async ctx => {
    let {
      opreatorName,
      opreatorContact,
      masterName,
      masterContact,
      phone,
      workNum,
      roomNum,
      floorNum,
      shopArea,
      address
    } = ctx.request.body;

    let newBangweiSubmitShop = await new db.bangwei.bangweiSubmitShopModel({
      opreatorName,
      opreatorContact,
      masterName,
      masterContact,
      phone,
      workNum,
      roomNum,
      floorNum,
      shopArea,
      address
    }).save();

    ctx.redirect("http://liusi.airuanjian.vip");
  })
  .get('/getAuthurl', wechatRouter.getAuthurl)
  .get('/visitor/mode', wechatRouter.visitorMode)
  .get('/shopuser/signup', wechatRouter.shopUserSignup)
  // wechat api
  .get('/wechat/list-buttons', wechatRouter.listButtons)
  .post('/wechat/create-menu', wechatRouter.createMenu)
  .get('/wechat/remove-menu', wechatRouter.removeMenu)
  .get('/wx/query-submit-shop', short.queryMySubmitShop)
  .get('/wechat/get-materials', wechatRouter.getMaterials)
  .get('/wechat/login-bangwei-shop', wechatRouter.loginShopWithWechat)


export let routers = [router, fenxiaoRouter, fxAdminRouter, bwsAdminRouter, bwscRouter];
