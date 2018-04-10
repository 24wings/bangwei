import http = require("http");
import https = require("https");
import url = require("url");

export class HttpClient {
  Get(urlStr: string, retry = 3): Promise<string> {
    return new Promise(resolve => {
      let client = url.parse(urlStr).protocol == "http" ? http : https;

      let request = (client as any).get(urlStr, res => {
        // console.log(`STATUS: ${res.statusCode}`);
        // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding("utf8");
        let data = "";
        res.on("data", chunk => {
          data += chunk;
        });
        res.on("error", async () => {
          if (retry > 0) {
            retry--;
            let html = await this.Get(urlStr, retry);
            resolve(html);
          }
        });
        res.on("end", () => {
          resolve(data);
        });
      });
    });
  }
}
