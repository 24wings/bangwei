import mongoose = require("mongoose");

let queueSchema = new mongoose.Schema({
  projectName: String,
  url: { type: String, required: true },
  isVisited: { type: Boolean, default: false },
  createDt: { type: Date, default: Date.now },
  lastModifyDt: { type: Date, default: Date.now }
});

export interface CrawlQueue extends mongoose.Document {
  projectName: string;
  url: string;
  createDt: Date;
  lastModifyDt: Date;
  isVisited: boolean;
}

export let crawlQueueModel = mongoose.model<CrawlQueue>(
  "crawl-queue",
  queueSchema
);
