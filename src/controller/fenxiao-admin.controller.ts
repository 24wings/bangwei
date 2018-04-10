import { Context } from "../route/util";
import db = require("../model");
import service = require('../service');
import { SubmitShopState } from "../model/bangwei/bangwei-submit-shop";
import { BangweiOrderState } from "../model/bangwei";
import { ActionState, FenxiaoUserState } from "../model/fenxiao";

export let fxAdminCtrl = {
  listFxUsers: async (ctx: Context) => {
    let { state } = ctx.query;
    if (state) {
      let fxUsers = await db.fenxiao.fenxaioUserModel
        .find({ state })
        .populate("Parent")
        .exec();
      ctx.body = { Ok: true, Data: fxUsers };

    } else {
      let fxUsers = await db.fenxiao.fenxaioUserModel
        .find()
        .populate("Parent")
        .exec();
      ctx.body = { Ok: true, Data: fxUsers };

    }

  },
  listShopusers: async (ctx: Context) => {
    let shopUsers = await db.fenxiao.shopUserModel.find().exec();
    ctx.body = { Ok: true, Data: shopUsers };
  },
  listSubmitShops: async (ctx: Context) => {
    let state = ctx.query.state;
    let query = state ? { state } : {};
    let submitShops = await db.bangwei.bangweiSubmitShopModel
      .find(query)
      .populate("images reportUser")
      .exec();
    ctx.body = { Ok: true, Data: submitShops };
  },
  passSubmitShop: async (ctx: Context) => {
    let { _id } = ctx.query;
    let incMoney = 88;
    let submitShop = await db.bangwei.bangweiSubmitShopModel
      .findById(_id)
      .exec();
    if (
      submitShop &&
      submitShop.reportUser &&
      submitShop.state == SubmitShopState.Wating
    ) {
      await db.bangwei.bangweiSubmitShopModel
        .findByIdAndUpdate(_id, { state: SubmitShopState.Pass })
        .exec();
      // await db.fenxiao.fenxaioUserModel
      //   .findByIdAndUpdate(submitShop.reportUser, {
      //     $inc: { totalMoney: 88, monthMoney: 88, lessMoney: 88 }
      //   })
      //   .exec();
      await new db.fenxiao.systemActionModel({ title: `${submitShop.shopName} 审核通过`, actionType: ActionState.FenxiaoSubmitShopPassAction, }).save()

      ctx.body = { Ok: true, Data: `情报员审核通过` };
    } else {
      ctx.body = { Ok: true, Data: "查找店铺失败或者情报人不存" };
    }
  },
  failSubmitShop: async (ctx: Context) => {
    let { _id } = ctx.query;
    let submitShop = await db.bangwei.bangweiSubmitShopModel
      .findById(_id)
      .exec();
    if (submitShop) {
      await submitShop.update({ state: SubmitShopState.Fail }).exec();
      await new db.fenxiao.systemActionModel({ title: `${submitShop.shopName} 审核不通过`, actionType: ActionState.FenxiaoSubmitShopFailAction, }).save()
      ctx.body = { Ok: true, Data: "情报员审核失败" };
    } else {
      ctx.body = { Ok: false, Data: "该记录不存在" };
    }
  },
  chooseParent: async (ctx: Context) => {
    let { userId, parentId } = ctx.query;
    let fxUser = await db.fenxiao.fenxaioUserModel.findById(userId).exec();
    let parent = await db.fenxiao.fenxaioUserModel.findById(parentId).exec();
    if (fxUser && parent) {
      fxUser.update({ Parent: parent._id }).exec();
      ctx.body = { Ok: true, Data: "信息正确" };
    } else {
      ctx.body = { Ok: false, Data: "用户或上级用户不存在" };
    }
  },
  actions: async (ctx: Context) => {
    let { actionType } = ctx.query
    let actions = await db.fenxiao.systemActionModel.find({ actionType: actionType }).exec();
    ctx.body = { Ok: true, Data: actions }
  },
  confirmVerifyUser: async (ctx: Context) => {
    let { fxUserId } = ctx.query;
    console.log('confirm')
    let user = await db.fenxiao.fenxaioUserModel.findById(fxUserId).exec();
    if (user) {

      let udpateAction = await db.fenxiao.fenxaioUserModel.findByIdAndUpdate(fxUserId, { state: FenxiaoUserState.VerifyPass }).exec();
      await service.alidayu.bangweiVerifyPass(user.Phone)
      ctx.body = { ok: true, data: udpateAction };

    } else {
      ctx.body = { ok: false, data: '错误' }
    }

  },
  fullMemberFxUser: async (ctx: Context) => {
    let { fxUserId } = ctx.query;
    let udpateAction = await db.fenxiao.fenxaioUserModel.findByIdAndUpdate(fxUserId, { state: FenxiaoUserState.FullMember }).exec();
    ctx.body = { ok: true, data: udpateAction };

  }
};
