import mongoose = require('mongoose');


let resourceSchema = new mongoose.Schema({
    name: String,
    thumb: { type: mongoose.Schema.Types.ObjectId, ref: 'cloudinary-image' },
    comment: String,
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'cloudinary-video' },
    isRecommand: { type: Boolean, default: false },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'resource-group' },
    createDt: { type: Date, default: Date.now }

});
export interface Resource extends mongoose.Document {
    name?: string;
    thumb: any;
    comment: string;
    video: any;
    isRecommand: boolean;
    group: any;
    createDt: Date;
    // video:
}

export let resourceModel = mongoose.model<Resource>('resource', resourceSchema);