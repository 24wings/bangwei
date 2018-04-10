import path = require("path");
import koa = require("koa");
import serve = require("koa-static");
import bodyparser = require("koa-bodyparser");
import views = require("koa-views");
import db = require("./model");
import { routers } from "./route";

import session = require("koa-session");
var session2 = require("koa-session2");
let error = require("koa-handle-error");
import { wechatRouter } from './route/wechat.route';
var swig = require("swig");
import "./service";
swig.setDefaults({ cache: false });

let app = new koa();

const CONFIG = {
  key: "koa:sess" /** (string) cookie key (default is koa:sess) */,
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  overwrite: true /** (boolean) can overwrite or not (default true) */,
  httpOnly: true /** (boolean) httpOnly or not (default true) */,
  signed: true /** (boolean) signed or not (default true) */,
  rolling: false /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. default is false **/
};

app.keys = ["some secret hurr"];
let server = app
  .use(async (ctx, next) => {
    //sads
    let whiteList = [
      // "http://localhost:4200",
      // "http://localhost:8080",
      // "http://localhost",
      "http://192.168.1.164"
    ];
    // console.log(ctx.req.headers)
    let origin = ctx.req.headers.origin;
    // if (/localhost/g.test(origin as string)) {
    ctx.set("Access-Control-Allow-Origin", '*');
    // } else {
    // ctx.set("Access-Control-Allow-Origin", "*");
    // }
    // if (whiteList.indexOf(ctx.host) == -1) {

    // } else {
    // ctx.set("Access-Control-Allow-Origin", "*");
    // }
    ctx.set(
      "Access-Control-Allow-Headers",
      "Content-Type,Content-Length, Authorization, Accept,X-Requested-With"
    );
    ctx.set("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    ctx.set("Access-Control-Allow-Credentials", "true");
    // ctx.set("X-Powered-By", ' 3.2.1')
    if (ctx.method == "OPTIONS") ctx.body = 200;
    else {
      /*让options请求快速返回*/
      await next();
    }
  })
  // .use(wechatRouter.replay)
  .use(serve(path.resolve(__dirname, "../www")))
  // .use(serve(path.resolve(__dirname,'../../keystone-demo/public')))
  .use(bodyparser({ jsonLimit: "1000mb", formLimit: "1000mb" }))
  .use(views(path.resolve(__dirname, "../views"), { map: { html: "swig" } }))

// .use(session(CONFIG, app))
// .use(async (ctx, next) => {
//   // if ((ctx.session as any).user) {
//   // ctx.state.user = (ctx.session as any).user;
//   // }
//   console.log((ctx.session as any).user, ctx.state.user);
//   //console.log(ctx.path, ctx.state.user, (ctx.session as any).user);
//   await next();
// })
for (let router of routers) {
  server.use(router.routes()).use(router.allowedMethods());
}
server.use(error(err => console.error(err)));

// 微信app-secret      7d1aec534959dc79b518472d66685671
//7d1aec534959dc79b518472d66685671

server.listen(80, () => {
  console.log(`${new Date().toLocaleDateString()}: server is runing`);
});
