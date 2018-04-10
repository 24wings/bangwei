import { Context } from './util';
export let short = {
    queryMySubmitShop: async (ctx: Context) => {
        await ctx.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx800e2a542b39cf46&redirect_uri=http%3A%2F%2Fairuanjian.vip%2Ffenxiao%2Fquery-mysubmitshop&response_type=code&scope=snsapi_userinfo&state=state#wechat_redirect');
    }
}