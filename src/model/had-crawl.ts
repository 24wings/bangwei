import mongoose = require("mongoose");

let hadCrawlSchema = new mongoose.Schema({
  url: String,
  html: String,
  createDt: { type: Date, default: Date.now }
});

export interface Page extends mongoose.Document {
  url: string;
  html: string;
  createDt: Date;
}

export let hadCrawlModel = mongoose.model<Page>("had-crawl", hadCrawlSchema);
