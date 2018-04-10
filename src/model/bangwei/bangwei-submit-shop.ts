import mongoose = require("mongoose");

export enum SubmitShopState {
  Wating = 1,
  Pass,
  Fail
}

let bangweiSubmitShopSchema = new mongoose.Schema({
  shopName: { type: String },
  images: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "cloudinary-image" }],
    default: []
  },
  opreatorName: {
    type: String,
  },
  opreatorContact: { type: String },
  masterName: { type: String, },
  masterContact: { type: String, },
  // phone: { type: String, required: true },
  workNum: { type: Number, },
  roomNum: { type: Number },
  floorNum: { type: Number, },
  shopArea: { type: Number, },
  address: { type: String },
  createDt: { type: Date, default: Date.now },
  systemBrand: { type: String },
  diaryFee: { type: Number, default: 0 },
  telePhone: { type: String },
  reportUser: { type: mongoose.Schema.Types.ObjectId, ref: "fenxiao-user" },
  state: { type: Number, default: SubmitShopState.Wating },
  location: { lng: Number, lat: Number, address: String },
  monthMoney: { type: Number, default: 0 }
});

export interface BangweiSubmitShop extends mongoose.Document {
  opreatorName: string;
  opreatorContact: string;
  masterName: string;
  masterContact: string;
  phone: string;
  workNum: number;
  roomNum: number;
  shopName: string;
  floorNum: number;
  shopArea: number;
  address: string;
  createDt: Date;
  telePhone: string;
  reportUser: any;
  state: SubmitShopState;
  monthMoney: number;
}
export let bangweiSubmitShopModel = mongoose.model<BangweiSubmitShop>(
  "bangwei-submit-shop",
  bangweiSubmitShopSchema
);
