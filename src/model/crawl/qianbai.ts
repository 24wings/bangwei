import mongoose = require("mongoose");

let qianbaiSchema = new mongoose.Schema({
  url: String,
  html: String,
  createDt: { type: Date, default: Date.now }
});

export interface Page extends mongoose.Document {
  url: string;
  html: string;
  createDt: Date;
}

export let qianbaiModel = mongoose.model<Page>("qianbai", qianbaiSchema);
