import mongoose = require('mongoose');


let bannerSchema = new mongoose.Schema({
    name: String,
    comment: String,
    active: { type: Boolean, default: true },
    createDt: { type: Date, default: Date.now },
    image: { type: mongoose.Schema.Types.ObjectId, ref: 'cloudinary-image' },
    sort: { type: Number, default: 0 }
})
export interface Banner extends mongoose.Document {
    name: string;
    comment: string;
    active: boolean;
    createDt: Date;
    image: any;
    sort: number;
}


export let bannerModel = mongoose.model<Banner>('banner', bannerSchema);
