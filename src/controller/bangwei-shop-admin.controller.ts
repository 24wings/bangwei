import { BangweiProduct } from '../model';
import db = require('../model');
import service = require('../service');
import { Context } from '../route/util';

export let bangweiShopAdminCtrl = {
    porductGroupList: async (ctx, next) => {
        let groups = await db.bangwei.bangweiProductGroupModel
            .find()
            .populate("image")
            .exec();

        ctx.body = { ok: true, data: groups };
    },
    createProductGroup: async (ctx, next) => {
        let { groupName, price, summary, image } = ctx.request.body;
        // 将base64图片转换成数据库的数据
        let cloudImage = await service.cloud.storeImage(image);
        let newGroup = await new db.bangwei.bangweiProductGroupModel({
            image: cloudImage._id,
            groupName,
            price,
            summary
        }).save();
        ctx.body = { ok: true, data: newGroup };
    },

    productGroupUpdate: async (ctx, next) => {
        let _id = ctx.query._id;
        let { groupName, summary, image } = ctx.request.body;
        let cloudImage = await service.cloud.storeImage(image);
        let group = await db.bangwei.bangweiProductGroupModel.findById(_id).exec();
        if (group) {
            await group.update({ groupName, summary, image: cloudImage._id }).exec();
            ctx.body = { ok: true, data: "modify group success" };
        } else {
            ctx.body = { ok: false, data: "group  not found" };
        }
    },

    productGroupDelete: async (ctx, next) => {
        let _id = ctx.query._id;
        let delAction = await db.bangwei.bangweiProductGroupModel
            .findByIdAndRemove(_id)
            .exec();
        ctx.body = { ok: true, data: delAction };
    },

    productList: async ctx => {
        let { groupId, active } = ctx.query;

        let products: BangweiProduct[] = [];
        let query: any = {};
        if (active) {
            query.active = active;
        }
        /**根据分组id查找产品 */

        if (groupId) {
            query.group = groupId;
        }
        products = await db.bangwei.bangweiProductModel
            .find(query)
            .populate("images")
            .exec();
        ctx.body = { ok: true, data: products };
    },
    /**
     * procuct
     *   name: string;
    price: number;
    discount: number;
    createDt: Date;
    images: any[];
    summary: string;
    active: boolean;
     */
    productCreate: async ctx => {
        let {
            name,
            price,
            summary,
            discount,
            images,
            group,
            minScore,
            unit
        } = ctx.request.body;
        images = images ? images : [];
        if (name && price && summary && discount && group) {
            let cloudImages = await service.cloud.storeImages(images, "", "");
            let newProduct = await new db.bangwei.bangweiProductModel({
                name,
                price,
                summary,
                discount,
                group,
                unit,
                minScore,
                images: cloudImages.map(image => image._id)
            }).save();

            ctx.body = { ok: true, data: newProduct };
        } else {
            ctx.body = { ok: false, data: "parameters not validate" };
        }
    },
    productUpdate: async ctx => {
        let { _id } = ctx.query;
        let {
            name,
            price,
            summary,
            discount,
            images,
            minScore,
            unit
        } = ctx.request.body;
        if (name && price && summary && discount) {
            let cloudImages = await service.cloud.storeImages(images, "", "");
            let imageIds = cloudImages.map(image => image._id);
            console.log(imageIds);
            let updateAction = await db.bangwei.bangweiProductModel
                .findByIdAndUpdate(_id, {
                    name,
                    price,
                    summary,
                    discount,
                    images: imageIds,
                    minScore,
                    unit
                })
                .exec();
            ctx.body = { ok: true, data: updateAction };
        } else {
            ctx.body = { ok: false, data: "parameters not validate" };
        }
    },
    productDelete: async ctx => {
        let { _id } = ctx.query;
        let delAction = await db.bangwei.bangweiProductModel
            .findByIdAndRemove(_id)
            .exec();
        ctx.body = { ok: true, data: delAction };
    },
    productActive: async ctx => {
        let { productId } = ctx.query;
        let updateAction = await db.bangwei.bangweiProductModel
            .findByIdAndUpdate(productId, { active: true })
            .exec();
        ctx.body = { ok: true, data: updateAction };
    },
    productUnactive: async ctx => {
        let { productId } = ctx.query;
        let updateAction = await db.bangwei.bangweiProductModel
            .findByIdAndUpdate(productId, { active: false })
            .exec();
        ctx.body = { ok: true, data: updateAction };
    },

    listUsers: async (ctx: Context) => {
        let { state } = ctx.query;
        if (state) {
            let users = await db.fenxiao.shopUserModel.find({ state }).exec();
            ctx.body = { ok: true, data: users };

        } else {
            let users = await db.fenxiao.shopUserModel.find().exec();
            ctx.body = { ok: true, data: users };

        }



    },
    updateUser: async (ctx: Context) => {
        let { userId } = ctx.query;
        let { nickname, openId } = ctx.request.body;
        let updateAction = await db.fenxiao.shopUserModel
            .findByIdAndUpdate(userId, { nickname, openId })
            .exec();
        ctx.body = { ok: true, data: updateAction };
    },
    deleteUser: async (ctx: Context) => {
        let { userId } = ctx.query;
        let delAction = await db.fenxiao.shopUserModel
            .findByIdAndRemove(userId)
            .exec();
        ctx.body = { ok: true, data: delAction };
    },

    /**正式线上不同 ,线上用微信授权登录*/
    createUser: async (ctx: Context, next) => {
        let { openid, nickname } = ctx.request.body;
        if (openid && nickname) {
            let existUser = await db.fenxiao.shopUserModel
                .findOne({ openid })
                .exec();
            if (existUser) {
                ctx.body = { ok: false, data: "already  had  existUser" };
            } else {
                let newUser = await new db.fenxiao.shopUserModel({
                    openid,
                    nickname
                }).save();

                let reductions = await db.bangwei.bangweiReductionModel
                    .find({ everyUser: true, active: true })
                    .exec();
                for (let reduction of reductions) {
                    let newTicket = await new db.bangwei.bangweiTicketModel({
                        reduction: reduction._id,
                        user: newUser._id,
                        active: true
                    }).save();
                }

                ctx.body = { ok: true, data: newUser };
            }
        }
    },

    createReduction: async (ctx: Context, next) => {
        let { title, value, everyUser, active } = ctx.request.body;
        let newReduction = await new db.bangwei.bangweiReductionModel({
            title,
            value,
            everyUser,
            active
        }).save();
        ctx.body = { ok: true, data: newReduction };
    },
    listReduction: async (ctx: Context, next) => {
        let reductions = await db.bangwei.bangweiReductionModel.find().exec();
        ctx.body = { ok: true, data: reductions };
    },
    updateReduction: async (ctx: Context, next) => {
        let { reductionId } = ctx.query;
        // let { title, value, everyUser, active } = ctx.request.body;
        let updateAction = await db.bangwei.bangweiReductionModel
            .findByIdAndUpdate(reductionId, ctx.request.body)
            .exec();
        ctx.body = { ok: true, data: updateAction };
    },
    delelteReduction: async (ctx: Context, next) => {
        let { reductionId } = ctx.query;
        let delAction = await db.bangwei.bangweiReductionModel
            .findByIdAndRemove(reductionId)
            .exec();
        ctx.body = { ok: true, data: delAction };
    }
};
