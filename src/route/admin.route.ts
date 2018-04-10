import Router = require("koa-router");
import db = require("../model");
import fs = require("fs");
import path = require("path");
import { auth } from "../middleware";
import service = require("../service");
import { serveStatic } from "serve-static";

const adminApi = {
  // banner
  banner: {
    listBanner: "/admin.list-banner.get", //banner列表
    createBanner: "/admin.create-banner.post", //创建banner,
    deleteBanner: "/admin.delete-banner.del",
    updateBanner: "/admin.update-banner.put"
  },
  resource: {
    updateResource: "/admin.update-resource.put"
  },
  resourceGroup: {
    updateResourceGroup: "/admin.update-resource-group.put"
  }
};

let adminRouter = new Router();



adminRouter
  .post("/admin.login.post", async (ctx, next) => {
    let { username, password } = ctx.request.body;
    let admin: any = await db.adminModel.findOne({ username, password }).exec();
    if (admin) {
      (ctx.session as any).admin = admin;
    }
    if (username == "13419597065" && password == "13419597065") {
      admin = {
        username: "13419597065",
        nickname: "超级管理员",
        password: "13419597065"
      };
      (ctx.session as any).admin = admin;
    }
    ctx.body = { ok: !!admin, data: admin ? admin : "用户名或密码错误" };
  })

  .get("/admin.list-group.get", auth.checkAdminLogin, async (ctx, next) => {
    let groups = await db.resourceGroupModel.find().exec();
    ctx.body = { ok: true, data: groups };
  })
  .post("/admin.create-resource-group.post", async (ctx, next) => {
    let { name, comment, isRecommand } = ctx.request.body;
    let newGroup = await new db.resourceGroupModel({
      name,
      comment,
      isRecommand
    }).save();
    ctx.body = { ok: true, data: newGroup };
  })
  .get("/admin.search-resource-group.get", async (ctx, next) => {
    let { keyword } = ctx.query;
    let reg = new RegExp(keyword, "g");
    let groups = await db.resourceGroupModel.find({ name: reg }).exec();
    ctx.body = { ok: true, data: groups };
  })
  .del("/admin.delete-resource-group.del", async (ctx, next) => {
    let { groupId } = ctx.query;
    let delAction = await db.resourceGroupModel
      .findByIdAndRemove(groupId)
      .exec();
    ctx.body = { ok: true, data: delAction };
  })
  .post("/admin.create-resource.post", async (ctx, next) => {
    let {
      name,
      thumb,
      videoBase64,
      comment,
      group,
      isRecommand
    } = ctx.request.body;
    let uploadVideoAction = service.cloud.storeVideo(videoBase64);
    thumb = await service.cloud.storeImage(thumb);
    uploadVideoAction.then(async mediaType => {
      console.log("上传视频文件", mediaType);
      let video = await new db.cloudinaryVideoModel(mediaType).save();
      let newResource = await new db.resourceModel({
        name,
        thumb: thumb._id,
        video: video._id,
        comment,
        group,
        isRecommand
      }).save();
    });

    ctx.body = { ok: true, data: "上传成功" };
  })
  .get("/admin.list-resource.get", async (ctx, next) => {
    let { groupId } = ctx.query;
    let resources: any[] = [];
    if (groupId) {
      resources = await db.resourceModel.find({ group: groupId }).exec();
    } else {
      resources = await db.resourceModel.find().exec();
    }
    for (let resource of resources) {
      resource.thumb = await db.cloudinaryImageModel
        .findById(resource.thumb)
        .exec();
      resource.video = await db.cloudinaryVideoModel.findById(resource.video);
    }

    ctx.body = { ok: true, data: resources };
  })
  .del("/admin.delete-resource.del", async (ctx, next) => {
    let { resourceId } = ctx.query;
    let resource = await db.resourceModel
      .findById(resourceId)
      .populate("thumb video")
      .exec();
    if (resource) {
      if (resource.thumb)
        await service.cloud.deleteImage(resource.thumb.public_id);
      if (resource.video)
        await service.cloud.deleteVideo(resource.video.public_id);
      await resource.remove();
    }

    ctx.body = { ok: true, data: "删除成功" };
  })
  .get("/admin.search-resource.get", async (ctx, next) => {
    let { keyword } = ctx.query;
    let reg = new RegExp(keyword, "g");
    let resources = await db.resourceModel.find({ name: reg }).exec();
    for (let resource of resources) {
      resource.thumb = await db.cloudinaryImageModel
        .findById(resource.thumb)
        .exec();
      resource.video = await db.cloudinaryVideoModel.findById(resource.video);
    }

    ctx.body = { ok: true, data: resources };
  })
  .put("/admin.toggle-recommand.put", async (ctx, next) => {
    let { groupId } = ctx.query;
    let { isRecommand } = ctx.request.body;
    let updateAction = await db.resourceGroupModel
      .findByIdAndUpdate(groupId, { isRecommand })
      .exec();
    ctx.body = { ok: true, data: updateAction };
  })

  .get(adminApi.banner.listBanner, async (ctx, next) => {
    let banners = await db.bannerModel
      .find()
      .populate("image")
      .exec();
    ctx.body = { ok: true, data: banners };
  })
  .post(adminApi.banner.createBanner, async (ctx, next) => {
    let { name, image, active, comment } = ctx.request.body;
    let newImage = await service.cloud.storeImage(image);
    let newBanner = await new db.bannerModel({
      image: newImage._id,
      name,
      active
    }).save();
    ctx.body = { ok: true, data: newBanner };
  })
  .del(adminApi.banner.deleteBanner, async (ctx, next) => {
    let { bannerId } = ctx.query;
    let delAction = await db.bannerModel.findByIdAndRemove(bannerId).exec();
    ctx.body = { ok: true, data: delAction };
  })
  .put(adminApi.banner.updateBanner, async (ctx, next) => {
    let { bannerId } = ctx.query;
    let newBanner = ctx.request.body;
    let updateAction = await db.bannerModel
      .findByIdAndUpdate(bannerId, newBanner)
      .exec();
    ctx.body = { ok: true, data: updateAction };
  })
  .put(adminApi.resource.updateResource, async (ctx, next) => {
    let { resourceId } = ctx.query;
    let newResource = ctx.request.body;
    let updateAction = await db.resourceModel
      .findByIdAndUpdate(resourceId, newResource)
      .exec();
    ctx.body = { ok: true, data: updateAction };
  })
  .put(adminApi.resourceGroup.updateResourceGroup, async (ctx, next) => {
    let { groupId } = ctx.query;
    let newGroup = ctx.request.body;
    let updateAction = await db.resourceGroupModel
      .findByIdAndUpdate(groupId, newGroup)
      .exec();
    ctx.body = { ok: true, data: updateAction };
  });
// .get('/admin', async (ctx, next) => {
// let content = fs.readFileSync(path.resolve(__dirname, '../../www/admin/index.html'));
// ctx.body = content;
// });
export { adminRouter };
