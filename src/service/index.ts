import QQAI = require("./qqai");
import QRCode = require("./qrcode");
import cloud = require("./cloudinary");
import { HttpClient } from "./http-client";
import { alidayu } from './alidayu';
export = {
  qqai: new QQAI("1106550426", "00WdwrKA54aXkVG6"),
  qrcode: new QRCode(),
  wechatJsApi: {},
  cloud,
  httpClient: new HttpClient(),
  alidayu
};
