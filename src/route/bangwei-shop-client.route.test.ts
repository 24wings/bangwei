import { bwscApi } from './bangwei-shop-client.route';
import { Get, Post } from '../test-util';
import request = require('request');
import { expect, } from 'chai';
import 'mocha';
import { debug } from 'util';
import { BangweiOrderState } from '../model/bangwei';

let serverIp = "http://118.31.72.227"
let shopUserId = "5acb58523bafa11c70ac6913"
/**测试获取用户信息 */
describe(bwscApi.getShopUserInfo, () => {

    it(`${bwscApi.getShopUserInfo}  success`, async () => {
        request.get(serverIp + bwscApi.getShopUserInfo + '?shopUserId=' + shopUserId, (err, res, body) => {
            expect(res.statusCode).to.equal(200);
            expect(typeof JSON.parse(res.body)).to.equal('object')
        })
    });

});
describe(bwscApi.listShopUserOrders, () => {

    it(`${bwscApi.listShopUserOrders} success all`, async () => {
        let data = await Get(bwscApi.listShopUserOrders, { shopUserId });
        // console.log(data);
        expect(data.ok).to.equal(true)
        expect(Array.isArray(data.data)).to.equal(true);
    })
    it(`${bwscApi.listShopUserOrders} success unpay-orders `, async () => {
        let data = await Get(bwscApi.listShopUserOrders, { shopUserId, state: BangweiOrderState.Unpay });
        expect(data.ok).to.equal(true)
        expect(Array.isArray(data.data)).to.equal(true);
    })
    it(`${bwscApi.listShopUserOrders} success send-orders `, async () => {
        let data = await Get(bwscApi.listShopUserOrders, { shopUserId, state: BangweiOrderState.SendProduct });
        expect(data.ok).to.equal(true)
        expect(Array.isArray(data.data)).to.equal(true);
    })
    it(`${bwscApi.listShopUserOrders} success finish-orders `, async () => {
        let data = await Get(bwscApi.listShopUserOrders, { shopUserId, state: BangweiOrderState.Finish });
        expect(data.ok).to.equal(true)
        expect(Array.isArray(data.data)).to.equal(true);
    })

})


let orderId = '5ac82b67db7cfa1520c3046b';
describe(bwscApi.getUnpayOrderDetail, () => {

    it(`${bwscApi.getUnpayOrderDetail} success`, async () => {
        let rtn = await Get(bwscApi.getUnpayOrderDetail, { orderId });
        // console.log(rtn);
        expect(rtn.ok).to.equal(true);
        expect(!!rtn.data.order).to.equal(true)
        expect(Array.isArray(rtn.data.tickets)).to.equal(true)
        expect(!!rtn.data.product).to.equal(true)

    })
})
/*** 测试支付接口 */
describe(bwscApi.payOrder, () => {
    it(`${bwscApi.payOrder} no tickets fail  nomoney`, async () => {
        // console.log(bwscApi.payOrder);
        let rtn = await Post(bwscApi.payOrder, { truePayMoneyNum: 1000 }, { orderId });
        console.log(rtn);
        expect(rtn.ok).to.equal(false)
    })
    it(`${bwscApi.payOrder} no tickets  success `, async () => {
        let rtn = await Post(bwscApi.payOrder, { truePayMoneyNum: 3000 }, { orderId });
        console.log(rtn)
        expect(rtn.ok).to.equal(true)
    })
})