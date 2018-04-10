import mongoose = require('mongoose');
export enum OrderActionState {
    CreateOrderAndWaitPay,
    PayOrderAndAwaitSendProduct,
    SendingProduct,
    ConfirmOrderEnd
}

let orderActionSchema = new mongoose.Schema({
    state: { type: Number, default: OrderActionState.CreateOrderAndWaitPay },
    createDt: { type: Date, default: Date.now },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'bangwei-order', required: true },
    shopUser: { type: mongoose.Schema.Types.ObjectId, ref: 'shop-user' }
});
export interface OrderAction extends mongoose.Document {
    state: number;
    createDt: Date;
    order: any;
    shopUser: any;
}
export let orderActionModel = mongoose.model<OrderAction>('order-action', orderActionSchema);