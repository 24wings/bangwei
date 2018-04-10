import superagent = require("superagent");
import cheerio = require("cheerio");
import colors = require("colors");
import url = require("url");
import db = require("../../model");
import http = require("http");
import https = require("https");
import lowdb = require("lowdb");
import path = require("path");
// const FileSync = require("lowdb/adapters/FileSync");

// const adapter = new FileSync(
//   path.resolve(__dirname, "../../../data", "555lu.json")
// );

// const localDb = lowdb(adapter);
// Set some defaults
// localDb.defaults({ crawlQueue: [], hadCrawlQueue: [] }).write();

export class Crawl {
  // private crawlQueue: string[] = [];
  // private get crawlQueue() {
  //   return localDb.get("crawlQueue");
  // }
  // private hadCrawlQueue: string[] = [];
  // private get hadCrawlQueue() {
  //   return localDb.get("hadCrawlQueue");
  // }

  /**下载整个网站 */
  async linkCrawler(
    startUrl: string,
    acceptRegex?: RegExp[],
    stepTime: number = 500
  ) {
    // this.crawlQueue.set({}).write();
    let started = await db.crawlQueueModel.findOne({
      projectName: startUrl,
      url: startUrl
    });
    console.log("start");
    if (!started) {
      await new db.crawlQueueModel({
        projectName: startUrl,
        url: startUrl
      }).save();
    }

    let seed = await db.crawlQueueModel
      .findOne({ projectName: startUrl, isVisited: false })
      .exec();

    if (!seed) {
      throw new Error("not found seed");
    } else {
      console.log(`start ${seed.url}`);

      let isEnd = false;

      while (!isEnd) {
        let seedUrl: string = (seed as any).url;
        let page: any = await db.hadCrawlModel.findOne({ url: seedUrl }).exec();

        let html;
        if (page) {
          console.log(colors.green(`downloaded  ${seedUrl}`));
          html = page.html;
        } else {
          await this.sleep(stepTime);
          html = await this.download(seedUrl);

          if (html) {
            await new db.hadCrawlModel({ url: seedUrl, html: html }).save();
          } else {
            await (seed as any).update({ isVisited: true }).exec();
            seed = await db.crawlQueueModel
              .findOne({ isVisited: false })
              .exec();
            if (!seed) isEnd = true;
            continue;
          }
        }
        let links: string[] = this.getLinks(html);
        links = links
          .map(link => url.resolve(seedUrl, link))
          .map(link => {
            let pageUrl = url.parse(link);
            if (pageUrl.hash) {
              link = link.replace(pageUrl.hash, "");
            }
            return link;
          })
          .filter(
            link =>
              !link.startsWith("javascript") &&
              url.parse(link).hostname == url.parse(startUrl).hostname
          );

        links = this.unique(links);

        for (let link of links) {
          let exit = await db.hadCrawlModel.findOne({ url: link }).exec();
          if (!exit) {
            console.log("push link ", link);
            await new db.crawlQueueModel({
              url: link,
              projectName: startUrl
            }).save();
          } else {
            console.log(`alread had download url: ${exit.url}`.yellow);
          }
        }
        await (seed as any).update({ isVisited: true }).exec();
        seed = await db.crawlQueueModel.findOne({ isVisited: false }).exec();
        if (!seed) isEnd = true;

        //   console.log(this.crawlQueue);

        //   console.log(links);
      }
    }
  }
  private sleep(time: number) {
    return new Promise(resolve => setTimeout(() => resolve(), time));
  }

  private async download(url: string, retry = 3) {
    let html: string = "";
    console.log(colors.yellow(`downloading ${url}`));
    try {
      html = await this.Get(url);
    } catch (e) {
      if (e) {
        console.log(`error:${e}`.red);
        if (retry > 0) {
          retry--;
          html = await this.Get(url);
          console.log(colors.red(`retry ${url}    is  ${retry} times`));
        }
      }
    }

    return html;
  }

  private getLinks(html: string): string[] {
    // console.log(`parse`, html);
    let $ = cheerio.load(html);
    let hrefs: string[] = [];
    $("a").each((i, a) => {
      let href = a.attribs.href;
      if (href) {
        hrefs.push(href);
      }
    });
    return hrefs;
  }

  private Get(urlStr: string, retry = 3): Promise<string> {
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
  // 最简单数组去重法
  private unique(array: string[]) {
    var n: string[] = []; //一个新的临时数组
    //遍历当前数组
    for (var i = 0; i < array.length; i++) {
      //如果当前数组的第i已经保存进了临时数组，那么跳过，
      //否则把当前项push到临时数组里面
      if (n.indexOf(array[i]) == -1) n.push(array[i]);
    }
    return n;
  }
}

let crawl = new Crawl();
crawl.linkCrawler("https://m.555lu.vip").then(res => console.log(""));
