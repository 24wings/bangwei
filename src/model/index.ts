import mongoose = require("mongoose");

mongoose.connect("mongodb://118.31.72.227:27017/tutu");

// 通用
export {
  cloudinaryImageModel,
  CloudinaryImage
} from "./common/cloudinary-image";
export { cloudinaryVideoModel } from "./common/cloudniary-video";

// 管理系统
export { adminModel } from "./common/admin";

// 资源管理
export { resourceGroupModel } from "./resource-group";
export { resourceModel } from "./resource";
// banner管理
export { bannerModel } from "./banner";

/// 网络爬虫
export { pageModel } from "./crawl";
export { qianbaiModel } from "./crawl/qianbai";
export { luModel } from "./crawl/lu";
export { crawlQueueModel } from "./crawlQueue";
export { hadCrawlModel } from "./had-crawl";

import {
  bangweiProductGroupModel,
  bangweiProductModel,
  bangweiReductionModel,
  // bangweiUserModel,
  BangweiProduct,
  BangweiProductGroup,
  BangweiReduction,
  // BangweiUser,
  BangweiOrder,
  BangweiOrderState,
  bangweiOrderModel,
  bangweiTicketModel,
  BangweiTicket,
  bangweiSubmitShopModel,
  BangweiSubmitShop
} from "./bangwei";

export let bangwei = {
  bangweiProductGroupModel,
  bangweiProductModel,
  bangweiReductionModel,
  // bangweiUserModel,
  bangweiOrderModel,
  BangweiOrderState,
  bangweiTicketModel,
  bangweiSubmitShopModel
};
export {
  BangweiProduct,
  BangweiProductGroup,
  BangweiReduction,
  // BangweiUser,
  BangweiTicket,
  BangweiSubmitShop
};

import {
  fenxaioUserModel,
  FenxiaoUser,
  ShopUser,
  shopUserModel,
  systemActionModel,
  ActionState,
  ShopUserReciveAddress,
  shopUserReciveAddressModel,
  payOrderModel,
  orderActionModel,
  FenxiaoUserState


} from "./fenxiao";
export * from './fenxiao';
export let fenxiao = {
  fenxaioUserModel,
  shopUserModel,
  systemActionModel,
  ActionState,
  shopUserReciveAddressModel,
  payOrderModel,
  orderActionModel,
  FenxiaoUserState
};
