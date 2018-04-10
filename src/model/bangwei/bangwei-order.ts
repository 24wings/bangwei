import mongoose = require("mongoose");

export enum BangweiOrderState {
  Unpay = 1,
  SendProduct,
  Finish,
  Commented
}

let bangweiOrderSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "bangwei-product" },
  num: { type: Number, default: 1 },

  user: { type: mongoose.Schema.Types.ObjectId, ref: "bangwei-user" },
  createDt: { type: Date, default: Date.now },
  totalPrice: { type: Number, required: true },
  state: { type: Number, default: BangweiOrderState.Unpay },

  truePayMoneyNumber: { type: Number },
  payDate: { type: Date },
  useTickets: { type: [{ type: mongoose.Schema.Types.ObjectId }], default: [] },
  reciveAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'shopuser-recive-address' }
});

export interface BangweiOrder extends mongoose.Document {
  product: any;
  num: number;
  reductions: any[];
  user: any;
  createDt: Date;
  state: any;
  payDate: Date;
  useTickets: any[];
  totalPrice: number;
}

export let bangweiOrderModel = mongoose.model<BangweiOrder>(
  "bangwei-order",
  bangweiOrderSchema
);
