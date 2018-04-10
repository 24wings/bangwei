import superagent = require("superagent");

async function test() {
  let res = await superagent.get("https://www.baidu.com").end();
  console.log(res.header);
}

test();
