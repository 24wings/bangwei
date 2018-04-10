import mongoose = require("mongoose");

let luSchema = new mongoose.Schema({
  url: String,
  html: String,
  createDt: { type: Date, default: Date.now }
});

export interface Page extends mongoose.Document {
  url: string;
  html: string;
  createDt: Date;
}

export let luModel = mongoose.model<Page>("lu", luSchema);
