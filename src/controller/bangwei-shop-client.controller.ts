import { Context } from '../route/util';
import db = require('../model');
import service = require('../service');
import { ShopUser, OrderActionState, ActionState, } from '../model';
import { BangweiOrderState } from '../model/bangwei';


export let bangweiShopClientCtrl = {
    loginWithWechat: async (ctx: Context) => {
        ctx.redirect(`/getAuthUrl?url=http://shopclient.airuanjian.vip`)
    },
    authUser: async (ctx: Context, next) => {
        let userId = ctx.query.userId;

        if (!!userId && userId != "") {
            let user = await db.fenxiao.shopUserModel.findById(userId).exec();
            ctx.body = user;
        } else {
            ctx.body = { ok: false, data: "required userId login" };
        }
        if (ctx.body) {
            await next();
        } else {
            ctx.body = { ok: false, data: "user not login" };
        }
    },
    payOrder: async (ctx: Context) => {
        console.log(ctx.query.orderId);
        let { orderId } = ctx.query;
        // truePayMoneyNum应该是订单支付
        let { tickets, truePayMoneyNum } = ctx.request.body;
        if (!tickets) tickets = [];
        tickets = await db.bangwei.bangweiTicketModel
            .find({ _id: { $in: tickets }, active: true })
            .populate("reduction")
            .exec();

        let order = await db.bangwei.bangweiOrderModel
            .findById(orderId)
            .populate("product")
            .exec();

        /**计算商品总价   =  订单的商品的价格*订单的商品的折扣比例 /100 * 订单的商品数量   - 可用的优惠券数量 *   */

        if (order) {
            if (order.state != db.bangwei.BangweiOrderState.Unpay) {
                ctx.body = { ok: false, data: "order is alread pay" };
            } else {
                let totalReduction = 0;
                for (let ticket of tickets) {
                    totalReduction += ticket.reduction.value;
                }

                let totalFee =
                    order.product.price * order.product.discount / 100 * order.num -
                    totalReduction;
                console.log(`应该支付${totalFee} 实际支付${truePayMoneyNum}`);
                /**误差在一元以内 */
                if (totalFee - truePayMoneyNum > -1 && totalFee - truePayMoneyNum < 1) {
                    let payOrderSuccess = await db.bangwei.bangweiOrderModel
                        .findByIdAndUpdate(orderId, {
                            state: db.bangwei.BangweiOrderState.SendProduct,
                            useTickets: tickets.map(ticket => ticket._id),
                            truePayMoneyNum
                        })
                        .exec();
                    await db.bangwei.bangweiTicketModel
                        .find({ _id: { $in: tickets.map(ticket => ticket._id) } })
                        .update({ active: false })
                        .exec();

                    ctx.body = { ok: true, data: payOrderSuccess };
                } else {
                    ctx.body = { ok: false, data: "money is not correct" };
                }
            }
        } else {
            ctx.body = { ok: false, data: "not found order" };
        }
    },
    getPayOrderParams: async (ctx: Context) => {
        let test = true;
        if (test) {
            ctx.body = {
                ok: true,
                data: {}
            };
        } else {
            ctx.body = { ok: false, data: "not finish api interface" };
        }
    },

    orderDetail: async (ctx: Context) => {
        let { orderId } = ctx.query;
        let order = await db.bangwei.bangweiOrderModel.findById(orderId).exec();
        if (order) {
            order.product = await db.bangwei.bangweiProductModel
                .findById(order.product)
                .populate("images")
                .exec();
            ctx.body = { ok: true, data: order };
        } else {
            ctx.body = { ok: false, data: "product not found" };
        }
    },

    listGroupAndProducts: async (ctx: Context) => {
        let groups = await db.bangwei.bangweiProductGroupModel
            .find()
            .populate("products image")
            .exec();
        for (let group of groups) {
            let products = await db.bangwei.bangweiProductModel
                .find({ group: group._id })
                .limit(4)
                .populate("images")
                .exec();
            group.children = products;
            ctx.body = { ok: true, data: groups };
        }
    },
    productDetail: async (ctx: Context) => {
        let product = await db.bangwei.bangweiProductModel
            .findById(ctx.query.productId)
            .populate("images")
            .exec();
        ctx.body = { ok: true, data: product };
    },
    checkUserLogin: async (ctx: Context) => {
        let user = await db.fenxiao.shopUserModel
            .findById(ctx.query.userId)
            .exec();
        ctx.body = { ok: !!user, data: !!user ? true : "用户尚未登录" };
    },
    userLogin: async (ctx: Context) => {
        let { nickname, openid } = ctx.request.body;
        let user = await db.fenxiao.shopUserModel
            .findOne({ nickname, openid })
            .exec();
        if (user) {
            ctx.body = { ok: true, data: { msg: "login success", user: user } };
        } else {
            ctx.body = { ok: false, data: "login fail " };
        }
    },
    userActiveTickets: async (ctx: Context) => {
        let userId = ctx.body;
        let activeTickets = await db.bangwei.bangweiTicketModel
            .find({ user: userId, active: true })
            .populate("reduction")
            .exec();
        ctx.body = { ok: true, data: activeTickets };
    },
    userUnpayOrders: async (ctx: Context) => {
        let { shopUserId } = ctx.query;
        let orders = await db.bangwei.bangweiOrderModel
            .find({ user: shopUserId, state: db.bangwei.BangweiOrderState.Unpay })
            .exec();
        for (let order of orders) {
            order.product = await db.bangwei.bangweiProductModel
                .findById(order.product)
                .populate("images")
                .exec();
        }
        ctx.body = { ok: true, data: orders };
    },
    userCreateOrder: async (ctx: Context) => {
        let { shopUserId } = ctx.query;
        let { product, num, tickets, reciveAddressId } = ctx.request.body;
        let shopUser = await db.fenxiao.shopUserModel.findById(shopUserId).exec()

        if (!shopUser) {
            ctx.body = { ok: false, data: "user not login" };
        } else {
            if (product && num && num > 0) {
                let productEl = await db.bangwei.bangweiProductModel
                    .findById(product)
                    .exec();
                console.log(product, num);
                if (productEl) {
                    let totalPrice = productEl.price * num;

                    let newOrder = await new db.bangwei.bangweiOrderModel({
                        product,
                        user: shopUser._id,
                        num,
                        state: db.bangwei.BangweiOrderState.Unpay,
                        totalPrice,
                        reciveAddress: reciveAddressId
                    }).save();
                    // 增加创建订单记录的操作
                    let createOrderAction = await new db.fenxiao.orderActionModel({ state: OrderActionState.CreateOrderAndWaitPay, shopUser: shopUserId, order: newOrder._id }).save();

                    // let orders = await db.bangwei.bangweiOrderModel
                    //   .find({
                    //     state: db.bangwei.BangweiOrderState.Unpay,
                    //     user: shopUser._id
                    //   })
                    //   .populate("product")
                    //   .exec();

                    ctx.body = { ok: true, data: newOrder };
                } else {
                    ctx.body = { ok: false, data: "not found product" };
                }
            } else {
                ctx.body = { ok: true, data: "parameter not validate" };
            }
        }
    },
    addUserOrderNum: async (ctx: Context) => {
        let { orderId, shopUserId } = ctx.query;
        let order = await db.bangwei.bangweiOrderModel.findById(orderId).exec();

        if (order) {
            let num = order.num;

            if (num < 1) {
                return (ctx.body = { ok: false, data: "订单数量不能小于1" });
            }
            let updateAction = await db.bangwei.bangweiOrderModel
                .findOneAndUpdate(
                    {
                        _id: orderId,
                        // state: db.bangwei.BangweiOrderState.Unpay,
                        // user: shopUserId
                    },
                    { num: num + 1 }
                )
                .exec();
            ctx.body = { ok: true, data: updateAction };
        } else {
            ctx.body = { ok: false, data: '该订单已取消' }
        }
    },
    lessUserOrderNum: async (ctx: Context) => {

        let { orderId, shopUserId } = ctx.query;
        let order = await db.bangwei.bangweiOrderModel.findById(orderId).exec();

        if (order) {
            let num = order.num;
            // num = num - 1;
            if (num < 1) {
                return (ctx.body = { ok: false, data: "订单数量必须不小于1" });
            } else {
                let updateAction = await db.bangwei.bangweiOrderModel
                    .findOneAndUpdate(
                        {
                            _id: orderId,
                            state: db.bangwei.BangweiOrderState.Unpay,
                            user: shopUserId
                        },
                        { num: num - 1 }
                    )
                    .exec();
                ctx.body = { ok: true, data: updateAction };
            }
        } else {
            ctx.body = { ok: false, data: '该订单已取消' }
        }
    },
    userHistoryOrders: async (ctx: Context) => {
        let user = ctx.body;
        let orders = await db.bangwei.bangweiOrderModel
            .find({
                user: user._id,
                state: { $ne: db.bangwei.BangweiOrderState.Unpay }
            })
            .exec();
        for (let order of orders) {
            order.product = await db.bangwei.bangweiProductModel
                .findById(order.product)
                .exec();
        }
        ctx.body = { ok: true, data: orders };
    },
    getGroupAndProducts: async (ctx: Context) => {
        let { groupId } = ctx.query;
        if (groupId) {
            let group = await db.bangwei.bangweiProductGroupModel.findById(groupId).exec();
            if (group) {
                group.children = await db.bangwei.bangweiProductModel.find({ group: groupId }).exec();
                ctx.body = { ok: true, data: group }
            } else {
                ctx.body = { ok: false, data: 'not found group' };
            }
        } else {
            ctx.body = { ok: false, data: 'not required groupId' };
        }
    },
    addCollect: async (ctx: Context) => {
        console.log(ctx.query.shopUserId, ctx.query.productId);
        await db.fenxiao.shopUserModel.findByIdAndUpdate(ctx.query.shopUserId, { $addToSet: { collects: ctx.query.productId } }).exec();
        let user = await db.fenxiao.shopUserModel.findById(ctx.query.shopUserId).exec();
        ctx.body = { ok: true, data: user };
    },
    getUserCollect: async (ctx: Context) => {
        let { shopUserId } = ctx.query;
        let shopUser = await db.fenxiao.shopUserModel.findById(shopUserId).exec();

        if (shopUser) {
            let products = await db.bangwei.bangweiProductModel.find({ _id: { $in: shopUser.collects } }).populate('images').exec();
            ctx.body = { ok: true, data: products }
        } else {
            ctx.body = { ok: true, data: [] };
        }
    },
    listUserUnpayOrder: async (ctx: Context) => {
        let { shopUserId } = ctx.query;
        let products = await db.bangwei.bangweiOrderModel.find({ user: shopUserId }).exec();
        ctx.body = { ok: true, data: products };
    },
    removeUnPayOrders: async (ctx: Context) => {
        let { shopUserId, orderIds } = ctx.query;
        let removeAction = await db.bangwei.bangweiOrderModel
            .find({
                user: shopUserId,
                state: db.bangwei.BangweiOrderState.Unpay,
                _id: { $in: orderIds }
            })
            .remove().exec();
        ctx.body = { ok: true, data: removeAction };
    },
    getShopUserInfo: async (ctx: Context) => {
        let { shopUserId } = ctx.query;
        let shopUser = await db.fenxiao.shopUserModel.findById(shopUserId).exec();
        ctx.body = { ok: true, data: shopUser };
    },
    updateShopUserInfo: async (ctx: Context) => {
        let { shopUserId } = ctx.query;
        let { headimgurl, Nickname, Sex, birthDay } = ctx.request.body;
        let updateObj = {};
        if (Nickname) updateObj['Nickname'] = Nickname;
        if (Sex) updateObj['Sex'] = Sex;
        if (birthDay) updateObj['birthDay'] = birthDay;

        if (!(headimgurl as string).startsWith('http')) {
            let newCloudImage = await service.cloud.storeImage(headimgurl);
            updateObj['headimgurl'] = newCloudImage.url;
        }
        let updateAction = await db.fenxiao.shopUserModel.findByIdAndUpdate(shopUserId, updateObj).exec();
        ctx.body = { ok: true, data: updateAction };

    },
    getShopUserCollects: async (ctx: Context) => {
        let { shopUserId } = ctx.query;
        let user = await db.fenxiao.shopUserModel.findById(shopUserId).exec();
        if (user) {
            let collects = user.collects;
            let collectProducts = await db.bangwei.bangweiProductModel.find({ _id: { $in: collects } }).populate('images').exec();
            ctx.body = { ok: true, data: collectProducts };
        } else {
            ctx.body = { ok: false, data: '尚未登陆' };
        }
    },
    removeShopUserCollect: async (ctx: Context) => {
        let { shopUserId, collectId } = ctx.query;
        let updateAction = await db.fenxiao.shopUserModel.findByIdAndUpdate(shopUserId, { $pull: { collects: collectId } }).exec();
        ctx.body = { ok: true, data: updateAction }
    },
    getHistoryViewProducts: async (ctx: Context) => {
        let { shopUserId } = ctx.query;
        let shopUser = await db.fenxiao.shopUserModel.findById(shopUserId).exec();
        if (shopUser) {
            let historyViews = shopUser.historyView;
            let viewProducts = historyViews.map(view => view.product);
            let products = await db.bangwei.bangweiProductModel.find({ _id: { $in: viewProducts } }).exec();

            let result = historyViews.map((view, i) => {
                return { product: products[i], year: view.year, month: view.month, date: view.date }
            })

            ctx.body = { ok: true, data: result }
        } else {
            ctx.body = { ok: false, data: '用户尚未登陆' };
        }
    },
    addHistoryViewProduct: async (ctx: Context) => {
        let { shopUserId, productId } = ctx.query;
        let shopUser = await db.fenxiao.shopUserModel.findById(shopUserId).exec();
        if (shopUser) {
            let exist = shopUser.historyView.find(view => view.product == productId)
            if (exist) {
                ctx.body = { ok: true, data: '已经添加过浏览记录' }
            } else {
                let now = new Date();

                let addViewProductAction = await db.fenxiao.shopUserModel.findByIdAndUpdate(shopUserId, { $addToSet: { historyView: { product: productId, year: now.getFullYear(), month: now.getMonth(), date: now.getDate() } } }).exec();
                ctx.body = { ok: true, data: addViewProductAction }
            }
        } else {
            ctx.body = { ok: false, data: "用户尚未登陆" }
        }
    },
    shopUserReciveAddress: async (ctx: Context) => {
        let { shopUserId, } = ctx.query;
        let shopUser = await db.fenxiao.shopUserModel.findById(shopUserId).exec();
        if (shopUser) {
            let reciveAddress = await db.fenxiao.shopUserReciveAddressModel.find({ shopUser: shopUserId }).exec();
            if (shopUser.detailAddress) {
                let defaultReciveAddress = reciveAddress.find(address => address._id == (shopUser as ShopUser).defaultReciveAddress)
                if (defaultReciveAddress) defaultReciveAddress.isDefault = true;
                ctx.body = { ok: true, data: defaultReciveAddress }
            }
        } else {
            ctx.body = { ok: false, data: '用户尚未登陆' }
        }
    },
    createShopUserReciveAddress: async (ctx: Context) => {
        let { shopUserId } = ctx.query;
        let { phone, area, city, region, publishRequire, publishContent, name, detailAddress, publishDt, comment } = ctx.request.body;
        let newReciveAddress = await new db.fenxiao.shopUserReciveAddressModel({ phone, area, city, region, publishRequire, publishContent, name, detailAddress, publishDt, comment }).save();
        ctx.body = { ok: true, data: newReciveAddress };
    },
    setDefaultUserReciveAddress: async (ctx: Context) => {
        let { shopUserId, reciveAddressId } = ctx.query;
        let updateAction = await db.fenxiao.shopUserModel.findByIdAndUpdate(shopUserId, { defaultReciveAddress: reciveAddressId }).exec();
        ctx.body = { ok: true, data: updateAction }
    },
    updateReciveAddress: async (ctx: Context) => {
        let { shopUserId, reciveAddressId } = ctx.query;
        let updateObj = ctx.request.body;
        let updateAction = await db.fenxiao.shopUserReciveAddressModel.findById(shopUserId, updateObj).exec();
        ctx.body = { ok: true, data: updateAction };
    },
    listShopUserOrders: async (ctx: Context) => {
        let { shopUserId, state } = ctx.query;
        if (state) {
            let orders = await db.bangwei.bangweiOrderModel.find({ user: shopUserId, state }).exec();
            ctx.body = { ok: true, data: orders }
        } else {
            let orders = await db.bangwei.bangweiOrderModel.find({ user: shopUserId }).exec();
            ctx.body = { ok: true, data: orders }
        }
    },
    // 支付接口, 模拟已经支付成功
    payForOneOrder: async (ctx: Context) => {
        let { shopUserId, orderId } = ctx.query;
        let payUpdate = await db.bangwei.bangweiOrderModel.findOneAndUpdate({ user: shopUserId, _id: orderId }, { state: BangweiOrderState.SendProduct }).exec();
        if (payUpdate) {
            let newPayAction = await new db.fenxiao.orderActionModel({ state: OrderActionState.PayOrderAndAwaitSendProduct, shopUser: shopUserId, order: orderId }).save();
        }
        ctx.body = { ok: true, data: payUpdate }
    },
    payForManyOrder: async (ctx: Context) => {
        let { shopUserId } = ctx.query;
        let { orderIds } = ctx.request.body;
        let updateAction = await db.bangwei.bangweiOrderModel.find({ _id: { $in: orderIds }, shopUser: shopUserId }).update({ state: BangweiOrderState.SendProduct }).exec();
        ctx.body = { ok: true, data: updateAction }
    },
    getUnpayOrderDetail: async (ctx: Context) => {
        let { orderId } = ctx.query;
        let order = await db.bangwei.bangweiOrderModel.findById(orderId).exec();
        if (order) {
            let tickets = await db.bangwei.bangweiTicketModel.find({ user: order.user, active: true }).exec();
            let product = await db.bangwei.bangweiProductModel.findById(order.product).populate('images').exec();
            ctx.body = { ok: true, data: { order, tickets, product } };
        } else {
            ctx.body = { ok: false, data: '订单不存在' }
        }

    }
}
