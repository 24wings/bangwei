import mongoose = require('mongoose');

let shopUserReciveAddressSchema = new mongoose.Schema(
    {
        name: String,
        phone: String,
        region: String,
        city: String,
        area: String,
        createDt: { type: Date, default: Date.now },
        detailAddress: String,
        comment: String,// 备注
        publishRequire: String,
        publishContent: String,
        publishDt: { type: Date, default: Date.now },
        shopUser: { type: mongoose.Schema.Types.ObjectId, ref: 'shopuser' }
    })
export interface ShopUserReciveAddress extends mongoose.Document {
    name?: string;
    phone?: string;
    region?: string;
    city?: string;
    area?: string;
    detailAddress?: string;
    isDefault?: boolean;
    publishRequire?: string;
    publishContent?: string;
    shopuser?: string;
    publishDt: Date

}
export let shopUserReciveAddressModel = mongoose.model<ShopUserReciveAddress>('shopuser-recive-address', shopUserReciveAddressSchema);