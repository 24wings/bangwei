const SMSClient = require("@alicloud/sms-sdk");
const accessKeyId = "LTAIcMnaxxUG7dbk";
const secretAccessKey = "VhNgQZrGYz7dXpiCUS8r36mbLgy6db";

let smsClient = new SMSClient({ accessKeyId, secretAccessKey });


let signature = {
    bangwei: "邦为科技"
}

let templateCodes = {
    bangweiUserAuthCode: "SMS_127158851", // 验证码
    bangweiRegisterRequest: "SMS_130915509", // 短信通知
    bangweiVerifyPass: "SMS_130920608"   // 初审通过 ,邀请来邦为面试
}

export let alidayu = {
    sendRegisterMsg: async function (Phone: string) {

        return smsClient.sendSMS({
            PhoneNumbers: Phone,
            SignName: signature.bangwei,
            TemplateCode: templateCodes.bangweiRegisterRequest,
            TemplateParam: `{"code":"1234"}`
        });


    },
    sendUserRegisiterAuthCode: async function (Phone: string, code: string) {
        return this.sendSmsMsg(Phone,
            "邦为科技",
            "SMS_127158851",
            `{"code":"${code}"}`)
    },
    /**内部请求方法 */
    sendSmsMsg: async (PhoneNumbers: string, SignName: string, TemplateCode: string, TemplateParam = `{"code":"1234"}`) => {
        let res = await smsClient.sendSMS({ PhoneNumbers, SignName, TemplateCode, TemplateParam });
        if (res.Code == "Ok") {
            return res;
        } else {
            return false;
        }
    },
    bangweiVerifyPass: async function (Phone: string) {
        return this.sendSmsMsg(Phone, signature.bangwei, templateCodes.bangweiVerifyPass);
    }

}