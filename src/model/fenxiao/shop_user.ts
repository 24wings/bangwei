import mongoose = require("mongoose");
import { BangweiProduct } from "..";
import { ShopUserReciveAddress } from ".";

let shopUserSchema = new mongoose.Schema({
  Phone: String,
  Password: String,
  Nickname: String,
  nickname: String,
  city: String,
  province: String,
  country: String,
  headimgurl: String,
  language: String,
  openid: String,
  Sex: { type: Number, default: 1 },
  CreateDt: { type: Date, default: Date.now },
  WeChatId: { type: String },
  reciveRegion: { type: String },
  reciveCity: String,
  reciveArea: String,
  detailAddress: String,
  score: { type: Number, default: 0 },
  collects: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'bangwei-product' }], default: [] },
  historyView: { type: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'bangwei-product' }, year: Number, month: Number, date: Number }], default: [] },
  defaultReciveAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'shopuser-recive-address' }
});

export interface ShopUser extends mongoose.Document {
  Phone?: string;
  Password?: string;
  Nickanme?: string;
  Sex?: number;
  CreateDt?: Date;
  reciveRegion?: String; // 收货省
  reciveCity?: String; // 收货城市
  detailAddress?: String; // 详细地址
  collects?: BangweiProduct[]
  historyView: { product: BangweiProduct, year: number, month: number, date: number }[];
  defaultReciveAddress: ShopUserReciveAddress
}

export let shopUserModel = mongoose.model<ShopUser>(
  "shop-user",
  shopUserSchema
);
