import mongoose = require("mongoose");

let bangweiProductGroupSchema = new mongoose.Schema({
  groupName: String,
  createDt: { type: Date, default: Date.now },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "bangwei-product" }],
  image: { type: mongoose.Schema.Types.ObjectId, ref: "cloudinary-image" },
  summary: { type: String, default: "" }
});

export interface BangweiProductGroup extends mongoose.Document {
  groupName: string;
  summary: string;
  createDt: Date;
  children: any[];
  image: string;
}

export let bangweiProductGroupModel = mongoose.model<BangweiProductGroup>(
  "bangwei-product-group",
  bangweiProductGroupSchema
);
