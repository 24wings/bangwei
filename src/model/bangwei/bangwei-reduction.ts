import mongoose = require("mongoose");

let bangweiReductionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  value: { type: Number, default: 0 },
  //
  everyUser: { type: Boolean, default: true },
  createDt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

export interface BangweiReduction extends mongoose.Document {
  title: string;
  value: number;
  everyUser: boolean;
  createDt: Date;
  active: boolean;
}

export let bangweiReductionModel = mongoose.model<BangweiReduction>(
  "bangwei-reduction",
  bangweiReductionSchema
);
