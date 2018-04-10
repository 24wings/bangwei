import mongoose = require("mongoose");

export let bangweiTicketSchema = new mongoose.Schema({
  reduction: { type: mongoose.Schema.Types.ObjectId, ref: "bangwei-reduction" },
  createDt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "shop-user" },
  active: { type: Boolean, default: true }
});

export interface BangweiTicket extends mongoose.Document {
  reduction: any;
  createDt: Date;
  user: any;
  active: true;
}

export let bangweiTicketModel = mongoose.model<BangweiTicket>(
  "bangwei-ticket",
  bangweiTicketSchema
);
