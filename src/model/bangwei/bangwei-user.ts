import mongoose = require("mongoose");

let bangweiUserSchema = new mongoose.Schema({
  openid: String,
  nickname: String,
  createDt: { type: Date, default: Date.now },
  score: { type: Number, default: 0 }
});

export interface BangweiUser extends mongoose.Document {
  openid: string;
  nickname: string;
  createDt: Date;
}

export let bangweiUserModel = mongoose.model<BangweiUser>(
  "bangwei-user",
  bangweiUserSchema
);
