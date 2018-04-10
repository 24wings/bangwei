import mongoose = require("mongoose");

let bangweiProductSchema = new mongoose.Schema({
  name: String,
  price: { type: Number, required: true },
  discount: { type: Number, required: true, default: 100 },
  createDt: { default: Date.now, type: Date },
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: "cloudinary-image" }],
  summary: { type: String, default: "尚未添加描述" },
  active: { type: Boolean, default: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "bangwei-product-group" },
  // 计量单位
  unit: { type: String, required: true },
  // 购买的最小积分
  minScore: { type: Number, default: 0 }
});

export interface BangweiProduct extends mongoose.Document {
  name: string;
  price: number;
  discount: number;
  createDt: Date;
  images: any[];
  summary: string;
  active: boolean;
}

export let bangweiProductModel = mongoose.model<BangweiProduct>(
  "bangwei-product",
  bangweiProductSchema
);
