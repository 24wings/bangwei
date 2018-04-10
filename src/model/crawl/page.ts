import mongoose = require("mongoose");

let pageSchema = new mongoose.Schema({
  url: String,
  html: String,
  createDt: { type: Date, default: Date.now },
  lastModifyDt: { type: Date, default: Date.now }
});

export interface Page extends mongoose.Document {
  url: string;
  html: string;
}
export let pageModel = mongoose.model<Page>("Page", pageSchema);
