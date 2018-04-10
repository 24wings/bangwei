import mongoose = require('mongoose');



/**
 * 
 * @param base64 {
  "public_id": "ygzxwxmflekucvqcrb8c",
  "version": 1427018743,
  "signature": "4618ba7c3461b6531cb9d2f16b06ce672af793b6",
  "width": 854,
  "height": 480,
  "format": "mp4",
  "resource_type": "video",
  "created_at": "2017-03-22T10:05:43Z",
  "tags": [  ],
  "bytes": 9094354,
  "type": "upload",
  "etag": "7e3977ca45a2c2a063e4f29fa3ecdfdd",
  "url": "http://res.cloudinary.com/demo/video/upload/v1427018743/ygzxwxmflekucvqcrb8c.mp4",
  "secure_url": "https://res.cloudinary.com/demo/video/upload/v1427018743/ygzxwxmflekucvqcrb8c.mp4",
  "audio": {
    "codec": "aac",
    "bit_rate": "246679",
    "frequency": 48000,
    "channels": 2,
    "channel_layout": "stereo"
  },
  "video": {
    "pix_format": "yuv420p",
    "codec": "h264",
    "level": 31,
    "bit_rate": "5170819"
  },
  "frame_rate": 29.97002997002997,
  "bit_rate": 5424041,
  "duration": 13.4134
}

 */
let cloudinaryVideoSchema = new mongoose.Schema({
    public_id: String,
    version: Number,
    signature: String,
    width: Number,
    height: Number,
    format: String,
    resource_type: String,
    created_at: { type: Date, default: Date.now },
    tags: [String],
    bytes: Number,
    type: String,
    etag: String,
    url: String,
    secure_url: String,
    audio: {
        codec: String,
        bit_rate: String,
        frequency: Number,
        channel: Number,
        channel_layout: String
    },
    video: {
        pix_format: String,
        codec: String,
        level: Number,
        bit_rate: String,
    },
    frame_rate: Number,
    bit_rate: Number,
    duration: Number
});
interface CloudinaryVideo extends mongoose.Document {
    public_id?: string;
}

export let cloudinaryVideoModel = mongoose.model<CloudinaryVideo>('cloudinary-video', cloudinaryVideoSchema);