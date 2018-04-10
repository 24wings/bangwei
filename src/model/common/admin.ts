import mongoose = require('mongoose');

let adminSchema = new mongoose.Schema({
    nickname: String,
    username: String,
    password: String,
    lastLoginDt: { type: Date },
    createDt: { type: Date, default: Date.now },
});

interface Admin extends mongoose.Document {
    nickname?: string;
    username?: string;
    password?: string;
    lastLoginDt?: Date;
    createDt?: Date;
}
export let adminModel = mongoose.model<Admin>('admin', adminSchema);