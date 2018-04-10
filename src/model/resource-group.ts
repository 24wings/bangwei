import mongoose = require('mongoose');
let resourceGroupSchme = new mongoose.Schema({ name: String, createDt: { type: Date, default: Date.now }, comment: String, isRecommand: { type: Boolean, default: false } });

interface ResourceGroup extends mongoose.Document {
    name?: string;
    createDt?: Date;
    comment: String;
}

export let resourceGroupModel = mongoose.model<ResourceGroup>('resource-group', resourceGroupSchme);