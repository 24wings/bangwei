import Router = require("koa-router");
import Ctrl = require("../controller");
let fxAdminRouter = new Router();

let fxAdminApi = {
  listFenxiaoUsers: "/fenxiao-admin/all-fenxiao-users",
  listFenxiaoSubmitShops: "/fenxiao-admin/all-submit-shops",
  passFenxiaoSubmitShop: "/fenxiao-admin/pass-submit-shop",
  failSubmitShop: "/fenxiao-admin/fail-submit-shop",
  chooseParent: "/fenxiao-admin/choose-parent",
  listSystemAction: '/fenxiao-admin/actions',
  confirmVerifyUser: "/fenxiao-admin/confirm-verify-user", // 审核通过用户
  fullMemberFxUser: "/fenxiao-admin/full-member-fxuser",

};
fxAdminRouter
  .get(fxAdminApi.listFenxiaoUsers, Ctrl.fxAdminCtrl.listFxUsers)
  .get(fxAdminApi.listFenxiaoSubmitShops, Ctrl.fxAdminCtrl.listSubmitShops)
  .get(fxAdminApi.passFenxiaoSubmitShop, Ctrl.fxAdminCtrl.passSubmitShop)
  .get(fxAdminApi.failSubmitShop, Ctrl.fxAdminCtrl.failSubmitShop)
  .get(fxAdminApi.chooseParent, Ctrl.fxAdminCtrl.chooseParent)
  .get(fxAdminApi.listSystemAction, Ctrl.fxAdminCtrl.actions)
  .get(fxAdminApi.confirmVerifyUser, Ctrl.fxAdminCtrl.confirmVerifyUser)
  .get(fxAdminApi.fullMemberFxUser, Ctrl.fxAdminCtrl.fullMemberFxUser)
export { fxAdminRouter };
