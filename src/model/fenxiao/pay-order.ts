import mongoose = require('mongoose');


let payOrderSchema = new mongoose.Schema({
    money: Number,
    payTime: { type: Date, default: Date.now },
    wechatNo: { type: String },
});

export interface PayOrder extends mongoose.Document {
    money: number;
    payTime: Date;
    wechatNo: number;
}
export let payOrderModel = mongoose.model<PayOrder>('pay-order', payOrderSchema)
