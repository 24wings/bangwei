var cloudinary = require('cloudinary');
import path = require('path');
import fs = require('fs');
import { CloudinaryImage, cloudinaryImageModel } from '../model'
import db = require('../model');
let uploadDir = path.resolve(__dirname, '../../www/upload');
cloudinary.config({
    cloud_name: 'dnf1ydl7w',
    api_key: '688229757297621',
    api_secret: 'D-7VrFqtn6ayg6ItFNXSm52jcS0'
});
// See Configuration Options for more details and additional configuration methods.


export async function uploadImage(base64: string): Promise<CloudinaryImage> {
    return <any>new Promise(resolve => {
        cloudinary.v2.uploader.upload(base64,
            function (err, result) {
                if (err) console.log(err)
                resolve(result);

            });
    })

}

/** 讲base64图片上传,并返回数据 cloudinary 数据库对象 */
export async function storeImage(base64: string, ) {
    let result = await uploadImage(base64);

    return await new cloudinaryImageModel(result).save()
}

export async function storeImages(base64Arr: string[], adminId: string, appName: string): Promise<CloudinaryImage[]> {
    let imageItems: any[] = [];
    for (let base64 of base64Arr) {
        /** old image object */
        if (base64['_id']) {
            let imageItem = await db.cloudinaryImageModel.findById(base64['_id']).exec();
            imageItems.push(imageItem);
        } else {

            let imageItem = await storeImage(base64);
            imageItems.push(imageItem);
        }
    }
    return <any>imageItems;
}

export function storeVideo(base64: string) {
    let data = parseBase64(base64);
    let filename = Math.random() + '.' + data.mediaType;
    let filepath = path.resolve(__dirname, '../../www/upload/' + filename);
    var dataBuffer = new Buffer(data.content, 'base64');
    fs.writeFileSync(filepath, dataBuffer, { encoding: 'binary' });
    console.log('上传文件已完成', filepath);
    return uploadVideo(filepath)

}

function uploadVideo(filepath: string) {
    return new Promise(resolve => {
        cloudinary.uploader.upload(filepath, function (result) {

            resolve(result);
        }, { resource_type: "video" });
    })

}

function parseBase64(base64: string): { mediaType: string, content: string, prefix: string } {

    let prefixNum = base64.indexOf(',');
    let prefix = base64.slice(0, prefixNum + 1);
    var reg = /data:\w+\/\w+/g;
    let matches = base64.match(reg);
    if (matches && matches[0]) {
        // ["data:video/mp4"]
        let seg = matches[0].replace('data:', '').split('/');
        let content = base64.substring(prefixNum + 1);
        console.log(base64.slice(0, 100), content.slice(0, 100))
        if (seg.length = 2) {
            return {
                mediaType: seg[1],
                content,
                prefix
            }
        } else {
            return 'unkown' as any;
        }



    } else {
        return false as any;
    }

}

export function deleteVideo(public_id: string) {
    return new Promise(resolve => { cloudinary.uploader.destroy(public_id, function (result) { resolve(result), { resource_type: "video" } }); })
}

export function deleteImage(public_id: string) {
    return new Promise(resolve => {

        cloudinary.v2.uploader.destroy(public_id,
            function (error, result) {
                // console.log(result) 
                resolve(result)
            });

    })

}