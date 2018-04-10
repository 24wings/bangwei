import { RouterObject, Context } from "./util";
import http = require("http");
import service = require("../service");
import url = require("url");
import db = require("../model");
export let crawlRouter = {
  getHtml: async (ctx: Context) => {
    let { url: link } = ctx.request.body;
    console.log(link);
    let page = await db.pageModel.findOne({ url: link }).exec();
    if (page) {
      page.html;
      ctx.body = { ok: true, data: { html: page.html, isNew: false } };
    } else {
      let html = await service.httpClient.Get(link);
      let newPage = await new db.pageModel({ url: link, html }).save();
      if (newPage) {
        ctx.body = { ok: true, data: { html: newPage.html, isNew: true } };
      } else {
        ctx.body = { ok: false, data: newPage };
      }
    }
  }
};
