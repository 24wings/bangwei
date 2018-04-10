const SMSClient = require("@alicloud/sms-sdk");
import service = require("../service");
import { Context } from "../route/util";
import db = require("../model");
import { SubmitShopState } from "../model/bangwei/bangwei-submit-shop";
import { FenxiaoUser, FenxiaoUserState } from "../model/fenxiao";
const accessKeyId = "LTAIcMnaxxUG7dbk";
const secretAccessKey = "VhNgQZrGYz7dXpiCUS8r36mbLgy6db";
//初始化sms_client

let smsClient = new SMSClient({ accessKeyId, secretAccessKey });
export let fxCtrl = {
  shopUserSignin: async (ctx: Context) => {
    let { Phone, Password } = ctx.request.body;
    let exit = await db.fenxiao.shopUserModel
      .findOne({ Phone, Password })
      .exec();
    if (exit) {
      ctx.body = { Ok: true, Data: exit };
    } else {
      ctx.body = { Ok: false, Data: "用户名或密码错误" };
    }
  },
  fenxaioUserLogin: async (ctx: Context) => {
    let { Phone, Password } = ctx.request.body;
    let exit = await db.fenxiao.fenxaioUserModel
      .findOne({ Phone, Password })
      .exec();
    if (exit) {
      ctx.body = { Ok: true, Data: exit };
    } else {
      ctx.body = { Ok: false, Data: "用户名或密码错误" };
    }
  },
  shopUserSignup: async (ctx: Context) => {
    let {
      Phone,
      Password,
      Nickname,
      Sex,
      Job,
      Industry,
      RecommandCode,
      AuthCode,
      ReportUser,
      WechatId
    } = ctx.request.body;

    let checkAuthCode = true;
    if (checkAuthCode) {
      let exist = await db.fenxiao.shopUserModel.findOne({ Phone }).exec();
      if (exist) {
        ctx.body = { Ok: false, Data: "该手机号已经注册" };
      } else {
        let newShopUser = await new db.fenxiao.fenxaioUserModel({
          Phone,
          Password,
          Nickname,
          Sex,
          Job,
          Industry,
          RecommandCode,
          WechatId
        }).save();
        ctx.body = { Ok: true, Data: newShopUser };
      }
    } else {
      ctx.body = { Ok: false, Data: "验证码错误" };
    }
  },

  sendAuthCode: async (ctx: Context) => { },
  fenxiaoUserSignup: async (ctx: Context) => {
    let { Phone } = ctx.request.body;
    let newFxUser = ctx.request.body;

    let exist = await db.fenxiao.fenxaioUserModel.findOne({ Phone }).exec();
    if (exist) {
      ctx.body = { Ok: false, Data: "该手机号已经被注册" };
    } else {
      // 用户的状态处于 待审核
      newFxUser.state = FenxiaoUserState.WatingVerify

      let newFenxaioUser = await new db.fenxiao.fenxaioUserModel(
        newFxUser
      ).save();
      await service.alidayu.sendRegisterMsg(Phone);
      ctx.body = { Ok: true, Data: newFenxaioUser };
    }
  },
  userAuthCode: async (ctx: Context) => {
    let Phone = ctx.query.Phone;

    // console.log("Phone", Phone);
    if (/^1[0-9]{9}$/.test(Phone)) {
      return (ctx.body = { Ok: false, Data: "请输入正确的手机号" });
    }
    //发送短信
    let res;
    let code = (Math.random() * 10000).toFixed(0);
    try {
      res = await smsClient.sendSMS({
        PhoneNumbers: Phone,
        SignName: "邦为科技",
        TemplateCode: "SMS_127158851",
        TemplateParam: `{"code":"${code}"}`
      });
    } catch (e) {
      res = { Code: "fail" };
    }
    if (res.Code == "OK") {
      ctx.body = { Ok: true, Data: res };
    } else {
      ctx.body = { Ok: false, Data: "发送短信失败" };
    }
  },
  queryDetail: async (ctx: Context, next) => {
    let Phone = ctx.query.Phone;
    let res = await smsClient.queryDetail({
      PhoneNumber: Phone,
      SendDate: "20180324",
      PageSize: "10",
      CurrentPage: "1"
    });
    if (res.Code == "OK") {
      let detail = (res as AliDayuQueryDetailSuccessResponse).SmsSendDetailDTOs
        .SmsSendDetailDTO[0];
      if (detail) {
        let content = detail.Content;
        let code = content.substring(content.indexOf("科技验证码") + 5);
        ctx.body = { Ok: true, Data: code };
      } else {
        ctx.body = { Ok: false, Data: "最近没有发送验证码" };
      }
    } else {
      ctx.body = { Ok: false, Data: res };
    }
    if (ctx.body.Ok) {
      await next();
    }
  },
  checkAuthCode: async (ctx: Context, next) => {
    let { Phone, AuthCode } = ctx.request.body;
    console.log(Phone, AuthCode);
    if (/^1[0-9]{10}$/.test(Phone) == false) {
      ctx.body = { Ok: false, Data: "请输入合法的手机号" };
      return;
    }
    let today = new Date();
    let monthStr =
      today.getMonth() + 1 >= 10
        ? today.getMonth()
        : "0" + (today.getMonth() + 1);
    let str = "" + today.getFullYear() + monthStr + today.getDate();
    console.log(str);
    let res = await smsClient.queryDetail({
      PhoneNumber: Phone,
      SendDate: str,
      PageSize: "10",
      CurrentPage: "1"
    });
    if (res.Code == "OK") {
      let detail = (res as AliDayuQueryDetailSuccessResponse).SmsSendDetailDTOs
        .SmsSendDetailDTO[0];
      if (detail) {
        let content = detail.Content;
        let code = content.substring(content.indexOf("科技验证码") + 5);
        if (code == AuthCode) {
          ctx.body = { Ok: true, Data: code };
          await next();
        } else {
          ctx.body = { Ok: false, Data: "验证码错误" };
        }
      } else {
        ctx.body = { Ok: false, Data: "最近没有发送验证码" };
      }
    } else {
      ctx.body = { Ok: false, Data: res };
    }
  },
  /** */
  listFenxiaoUsers: async (ctx: Context) => {
    let fenxiaoUsers = await db.fenxiao.fenxaioUserModel
      .find()
      .populate("Parent")
      .exec();
    ctx.body = { Ok: true, Data: fenxiaoUsers };
  },
  authFxUserLogin: async (ctx: Context, next) => {
    let fxUserId = ctx.query.fxUserId;
    if (fxUserId) {
      let fxUser = await db.fenxiao.fenxaioUserModel.findById(fxUserId).exec();
      ctx.body = { fxUser };
    } else {
      // 防止undfined
      ctx.body = {};
    }

    await next();
  },
  submitShop: async (ctx: Context) => {
    let fxUser = ctx.body.fxUser;

    if (fxUser) {
      let submitShop = ctx.request.body;
      if (!submitShop.images) submitShop.images = [];
      let imageIds = await service.cloud.storeImages(submitShop.images, "", "");
      var ids = imageIds.map(imageIds => imageIds._id);

      submitShop.reportUser = fxUser._id;
      submitShop.images = ids;
      submitShop.state = SubmitShopState.Wating;
      let newSubmitShop = await new db.bangwei.bangweiSubmitShopModel(
        submitShop
      ).save();
      ctx.body = { Ok: true, data: newSubmitShop };
    } else {
      ctx.body = { Ok: false, Data: "尚未登录,请先登录" };
    }
  },
  forgotPassword: async (ctx: Context) => {
    let { Phone, NewPassword } = ctx.request.body;
    let updateAction = await db.fenxiao.fenxaioUserModel
      .findOneAndUpdate({ Phone }, { Phone, NewPassword })
      .exec();
    let updateAction2 = await db.fenxiao.shopUserModel
      .findOneAndUpdate({ Phone }, { Phone, NewPassword })
      .exec();
  },
  getUserInfoById: async (ctx: Context) => {
    let { userId } = ctx.query;
    let userInfo = await db.fenxiao.fenxaioUserModel
      .findById(userId)
      .populate("Parent")
      .exec();
    if (userInfo) {
      let children = await db.fenxiao.fenxaioUserModel
        .find({ Parent: userId })
        .exec();
      userInfo["children"] = children;
      // 查找排名
      let before = await db.fenxiao.fenxaioUserModel
        .find({ $gt: { monthMoney: userInfo.monthMoney } })
        .count()
        .exec();
      let all = await db.fenxiao.fenxaioUserModel
        .find()
        .count()
        .exec();
      userInfo["bili"] = before / (all ? all : 1);
      ctx.body = { Ok: true, Data: userInfo };
    } else {
      ctx.body = { Ok: false, Data: "请先登录" };
    }
  },
  fxUserRelation: async (ctx: Context) => {
    let { userId } = ctx.query;
    console.log(userId);
    if (userId) {
      let fxUser = await db.fenxiao.fenxaioUserModel.findById(userId).exec();

      if (!fxUser) fxUser = {} as FenxiaoUser;
      if (fxUser) {
        let before = await db.fenxiao.fenxaioUserModel
          .find({ monthMoney: { $gt: fxUser.monthMoney } })
          .count()
          .exec();
        let all = await db.fenxiao.fenxaioUserModel
          .find()
          .count()
          .exec();
        var bili = before / (all ? all : 1);
        if (fxUser.Parent) {
          let parent = await db.fenxiao.fenxaioUserModel
            .findById(fxUser.Parent)
            .exec();
          let children = await db.fenxiao.fenxaioUserModel
            .find({ Parent: fxUser._id })
            .exec();
          ctx.body = {
            bili,
            fxUser,
            parent,
            children: []
          };
        } else {
          let children = await db.fenxiao.fenxaioUserModel
            .find({ Parent: fxUser._id })
            .exec();
          ctx.body = {
            Ok: true,
            Data: {
              bili,
              fxUser,
              parent: null,
              children: children
            }
          };
        }
      } else {
        ctx.body = { Ok: false, Data: "未找到用户" };
      }
    } else {
      ctx.body = { Ok: false, Data: "未知的用户" };
    }
  },
  fxUserMoney: async (ctx: Context) => {
    let { userId } = ctx.query;
    if (userId) {
      let fxUser = await db.fenxiao.fenxaioUserModel.findById(userId).exec();
      ctx.body = { Ok: true, Data: fxUser };
    } else {
      ctx.body = { Ok: true, Data: "未知用户" };
    }
  },
  fxUserSubmitRecords: async (ctx: Context) => {
    let { userId } = ctx.query;
    if (userId) {
      let submitShops = await db.bangwei.bangweiSubmitShopModel
        .find({ reportUser: userId })
        .exec();
      ctx.body = { Ok: true, Data: submitShops };
    } else {
      ctx.body = { Ok: false, Data: "未知的用户" };
    }
  },
  queryMySubmitShop: async (ctx: Context) => {
    let user = ctx.request.body;
    var wait: db.BangweiSubmitShop[] = [];
    var pass: db.BangweiSubmitShop[] = [];
    var fail: db.BangweiSubmitShop[] = [];



    if (user) {
      let userSubmitShops = await db.bangwei.bangweiSubmitShopModel
        .find({ reportUser: user._id })
        .exec();
      wait = userSubmitShops.filter(
        record => record.state == SubmitShopState.Wating
      );
      pass = userSubmitShops.filter(
        record => record.state == SubmitShopState.Pass
      );
      fail = userSubmitShops.filter(
        record => record.state == SubmitShopState.Fail
      );
      await ctx.render("process", {
        wait,
        pass,
        fail,
        rewardMoney: user.rewardMoney,
        rewardMoneyGain: user.rewardMoneyGain
      });
    } else {
      await ctx.render("process");
    }
  }


}



interface AliDayuQueryDetailSuccessResponse {
  TotalCount: number;
  /**OK */
  Message: string;
  RequestId: string;
  SmsSendDetailDTOs: {
    SmsSendDetailDTO: {
      SendDate: Date;
      SendStatus: number;
      ReceiveDate: Date;
      ErrCode: string;
      TemplateCode: string;
      Content: string;
      PhoneNum: string;
    }[];
  };
}
