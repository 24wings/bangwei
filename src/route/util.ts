import koa = require("koa");
import Router = require("koa-router");

export interface KeyValuePair<T> {
  [key: string]: T;
}

export type RouterObject = KeyValuePair<Router.IMiddleware>;
export type Context = koa.Context;
export type Next = koa.Middleware;
