import mongoose = require("mongoose");


export enum FenxiaoUserState {
  WatingVerify = 1, // 待审核
  VerifyPass,   // 审核通过
  FullMember, // 正式会员
}
let fenxiaoUserSchema = new mongoose.Schema({
  Nickame: String,
  Phone: String,
  Password: String,

  CreateDt: { type: Date, default: Date.now },
  ReciveRegion: { type: String, default: "" },
  ReciveCity: { type: String, default: "" },
  ReciveArea: { type: String },
  Detail_address: { type: String },
  Sex: { type: Number, default: 1 },
  AuthCode: { type: String },
  WechatId: { type: String },
  Parent: { type: mongoose.Schema.Types.ObjectId, ref: "fenxiao-user" },
  totalMoney: { type: Number, default: 0 }, // 总额
  lessMoney: { type: Number, default: 0 }, // 余额
  monthMoney: { type: Number, default: 0 }, // 月收入
  canGainMoney: { type: Number, default: 0 }, // 可提现
  reportShops: {
    type: [
      { type: mongoose.Schema.Types.ObjectId, ref: "bangwei-submit-shop" }
    ],
    default: []
  },
  lastMonthMoney: { type: Number, default: 0 },
  rewardMoney: { type: Number, default: 0 },
  rewardMoneyGain: { type: Number, default: 0 },
  openid: { type: String, default: "" },
  nickname: { type: String, default: "" },
  sex: { type: Number, default: 1 },
  language: { type: String, default: "" },
  city: { type: String, default: "" },
  province: { type: [String], default: [] },
  country: { type: String, default: "" },
  headimgurl: { type: String, default: "" },
  state: { type: Number, default: FenxiaoUserState.WatingVerify }, // 默认用户状态为待审核状态哦

});

export interface FenxiaoUser extends mongoose.Document {
  Nickname: string;
  Phone: string;
  CreateDt: Date;
  totalMoney: number;
  monthMoney: number;
  Parent: any;
  rewardMoney?: number;
  rewardMoneyGain?: number;
  state: number;
}

export let fenxaioUserModel = mongoose.model<FenxiaoUser>(
  "fenxiao-user",
  fenxiaoUserSchema
);
