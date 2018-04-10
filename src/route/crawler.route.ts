import Router = require("koa-router");
import db = require("../model");
import iconv = require("iconv-lite");
import util = require("util");
let crawlerRouter = new Router();
let decoder = new util["TextDecoder"]();
let encoder = new util["TextEncoder"]();
crawlerRouter.all("/listPages", async (ctx, next) => {
  let url = ctx.query.url;
  let pages = await db.pageModel
    .find({ url: new RegExp(url) })
    .limit(10)
    .exec();
  switch (ctx.query.encoding) {
    case "gbk":
      pages.forEach(page => {
        //   icon
        page.html = iconv.decode(Buffer.from(page.html), "gb2312");
      });
      break;
    default:
      break;
  }

  ctx.body = { ok: true, data: pages };
});

export { crawlerRouter };
