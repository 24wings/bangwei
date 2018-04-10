import fs = require("fs");
import db = require("../model");
import path = require("path");
import cheerio = require("cheerio");
let dirname = "m.555lu.vip";
let dataDirPath = path.resolve(__dirname, "../../data", dirname);

interface UrlObject {
  absFilepath: string;
  urlPath: string;
  htmlContent?: string;
}

/**
 * 文件夹扫描器 ,配合 wget -r   -o download.log     url   命令更好
 *
 *
 *
 */
export class FileScanner {
  private allfiles: string[] = [];

  private travel(dir, callback, finish) {
    let ctrl = this;
    fs.readdir(dir, function(err, files) {
      (function next(i) {
        if (i < files.length) {
          var pathname = path.join(dir, files[i]);

          fs.stat(pathname, (err, stats) => {
            if (stats.isDirectory()) {
              ctrl.travel(pathname, callback, function() {
                next(i + 1);
              });
            } else {
              callback(pathname, function() {
                next(i + 1);
              });
            }
          });
        } else {
          finish && finish();
        }
      })(0);
    });
  }

  start(dataDirPath): Promise<{ relatePath: string; absolutePath: string }[]> {
    return new Promise(resolve => {
      this.travel(
        dataDirPath,
        (files, next) => {
          // console.log(allfiles, files);
          this.allfiles.push(files);
          next();
        },
        () => {
          console.log(this.allfiles);
          let result = this.allfiles.map(file => {
            return {
              relatePath: file.replace(dataDirPath, dirname).replace("_", "?"),
              absolutePath: file
            };
          });
          //   console.log(relateFiles.pop());
          //   console.log(this.allfiles.pop());
          resolve(result);
        }
      );
    });
  }
  async extractImages(link: string): Promise<string[]> {
    let results = await this.start(link);
    let images: string[] = [];

    for (let item of results) {
      let html = fs.readFileSync(item.absolutePath, "utf8");
      let $ = cheerio.load(html);
      $("img").each(imgEl => images.push($(imgEl).attr("src")));
    }
    return images;
  }
}
/*
new FileScanner().start(dataDirPath).then(async res => {
  for (let i in res) {
    let result = res[i];

    // 前面50个50个的判断

    let item = await db.luModel.findOne({ url: result.relatePath }).exec();
    if (item) {
      console.log(`${i} alread in database:`, result.relatePath);
    } else {
      fs.readFile(result.absolutePath, (err, data) => {
        if (err) {
          console.log(`err`, err);
        } else {
          new db.luModel({ url: result.relatePath, data }).save().then(item => {
            console.log(`${i}:  join database:`, item.url);
          });
        }
      });
    }
  }
});

*/

new FileScanner()
  .extractImages(dataDirPath)
  .then(images => console.log(images));
