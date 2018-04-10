import mongoose = require('mongoose');

export enum ActionState {
    FenxiaoSubmitShopPassAction = 1,
    FenxiaoSubmitShopFailAction,
}


var systemActionSchema = new mongoose.Schema({

    title: String,
    actionType: { type: Number, default: 0, required: true },
    createDt: { type: Date, default: Date.now },
});
interface SystemAction extends mongoose.Document {
    title: string;
    actionType: ActionState;
    createDt: Date;

}


export let systemActionModel = mongoose.model('system-action', systemActionSchema);