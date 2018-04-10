import { RouterObject, Context } from "./util";
import http = require("http");
import service = require("../service");

import db = require("../model");

export let bangweiClientRouter = {
  checkUserLogin: async (ctx: Context, next) => {
    let user = (ctx.session as any).user;
    if (user) {
      ctx["user"] = user;
      await next();
    } else {
      ctx.redirect("/login");
    }
  },

  cacheGroups: async (ctx: Context, next) => {
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
    }
    let products: any[] = [];
    if (groups[0]) {
      products = groups[0].children;
    }
    (ctx.session as any).groups = groups;

    await next();
  },

  index: async (ctx: Context) => {
    let products: any[] = [];
    if ((ctx.session as any).groups[0]) {
      products = (ctx.session as any).groups[0].children;
    }
    console.log((ctx.session as any).user);
    await ctx.render("index", { products });
  },

  productDetail: async (ctx: Context) => {
    let { productId } = ctx.params;
    let product = await db.bangwei.bangweiProductModel
      .findById(productId)
      .populate("images")
      .exec();
    await ctx.render("product-detail", { product });
  },
  groupDetail: async (ctx: Context) => {
    let { groupId } = ctx.params;
    let group = await db.bangwei.bangweiProductGroupModel
      .findById(groupId)
      .exec();
    if (group) {
      let children = await db.bangwei.bangweiProductModel
        .find({ group: group._id })
        .exec();
      group.children = children;
      await ctx.render("group", { group });
    } else {
      await ctx.render("404");
    }
  },

  createOrderJson: async (ctx: Context, next) => {
    let { product, num, tickets } = await ctx.request.body;
    console.log((ctx.session as any).user, ctx.state.user);
    let user = (ctx.session as any).user || ctx.state.user;

    console.log(`createOrder`, user);
    if (!user) {
      ctx.body = { ok: false, data: "user not login" };
    } else {
      if (!tickets) {
        tickets = [];
      }
      if (product && num && num > 0) {
        let productEl = await db.bangwei.bangweiProductModel
          .findById(product)
          .exec();
        console.log(product, num);
        if (productEl) {
          let ticketEls = await db.bangwei.bangweiTicketModel
            .find({ user: user._id, _id: { $in: tickets }, active: true })
            .populate("reduction")
            .exec();

          let totalPrice = productEl.price * num;
          for (let ticketEl of ticketEls) {
            totalPrice -= ticketEl.reduction.value;
          }
          let newOrder = await new db.bangwei.bangweiOrderModel({
            product,
            user: user._id,
            num,
            tickets,
            state: db.bangwei.BangweiOrderState.Unpay,
            totalPrice
          }).save();
          let orders = await db.bangwei.bangweiOrderModel
            .find({
              state: db.bangwei.BangweiOrderState.Unpay,
              user: user._id
            })
            .populate("product")
            .exec();
          ctx.body = { ok: true, data: { product, num, orders } };
        } else {
          ctx.body = { ok: false, data: "not found product" };
        }
      } else {
        ctx.body = { ok: true, data: "parameter not validate" };
      }
    }
  },
  login: async (ctx: Context) => {
    await ctx.render("login");
  },
  loginDo: async (ctx: Context) => {
    let { nickname, openid } = ctx.request.body;
    let user = await db.fenxiao.shopUserModel
      .findOne({ nickname, openid })
      .exec();
    if (user) {
      (ctx.session as any).user = user;
      ctx.state.user = user;
      await ctx.redirect("/");
    } else {
      await ctx.render("login", { error: "用户名或密码错误" });
    }
  },
  userTickets: async (ctx: Context) => {
    let user = ctx.state.user || (ctx.session as any).user;
    if (user) {
      let tickets = await db.bangwei.bangweiTicketModel
        .find({ active: true, user: user._id })
        .populate("reduction")
        .exec();
      ctx.body = { ok: true, data: tickets };
    } else {
      ctx.body = { ok: false, data: "user not login" };
    }
  },
  userActiveOrdersJson: async (ctx: Context) => {
    let user = ctx.state.user || (ctx.session as any).user;
    let orders = await db.bangwei.bangweiOrderModel
      .find({ user: user._id })
      // .populate('product ')
      .exec();
    ctx.body = { ok: true, data: orders };
  },
  // check user login
  userShopingCart: async (ctx: Context) => {
    let user = ctx.state.user || (ctx.session as any).user;
    let orders = await db.bangwei.bangweiOrderModel
      .find({ user: user._id })
      .populate("product reductions")
      .exec();
    for (let order of orders) {
      order["product"].images = await db.cloudinaryImageModel
        .find({ _id: { $in: order["product"].images } })
        .exec();
    }

    await ctx.render("shoping-cart", { orders });
  },
  userRemoveOrder: async (ctx: Context) => {
    let orderId = ctx.query.orderId;
    let delAction = await db.bangwei.bangweiOrderModel
      .findOne({
        user: ctx["user"]._id,
        _id: orderId,
        state: db.bangwei.BangweiOrderState.Unpay
      })
      .remove()
      .exec();
    ctx.body = { ok: true, delAction };
  },
  addUserOrderNum: async (ctx: Context) => {
    let { orderId, num } = ctx.query;
    if (num < 1) {
      return (ctx.body = { ok: false, data: "订单数量不能小于1" });
    }
    let updateAction = await db.bangwei.bangweiOrderModel
      .findOneAndUpdate(
        {
          _id: orderId,
          state: db.bangwei.BangweiOrderState.Unpay,
          user: ctx["user"]._id
        },
        { num }
      )
      .exec();
    ctx.body = { ok: true, data: updateAction };
  },
  lessUserOrderNum: async (ctx: Context) => {
    let { orderId, num } = ctx.query;
    if (num < 1) {
      return (ctx.body = { ok: false, data: "订单数量小于1" });
    }
    let updateAction = await db.bangwei.bangweiOrderModel
      .findOneAndUpdate(
        {
          _id: orderId,
          state: db.bangwei.BangweiOrderState.Unpay,
          user: ctx["user"]._id
        },
        { num }
      )
      .exec();
    ctx.body = { ok: true, data: updateAction };
  }
};
