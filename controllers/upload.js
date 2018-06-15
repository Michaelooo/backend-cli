const config = require("../config");
const Promise = require("bluebird");
const inspect = require("util").inspect;
const BSON = require("bson");
const path = require("path");
const os = require("os");
const fs = require("fs");
const multer = require("koa-multer");
const fsLib = require("../libs/fs");
const Joi = require("joi");
const mongo = require("../db/mongo");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const _ = require("lodash");
const logger = require("../libs/logger");
const auth = require("../middlewares/auth");
const commonError = require("../libs/response").commonError;
const resErr = require("../libs/errors");
let JoiValidatePromise = Promise.promisify(Joi.validate);

const upload = multer({ dest: config.uploadSavePath }); // 上传临时目录

const downloadFile = (url, filename) => {
  return new Promise((resolve, reject) => {
    var stream = fs.createWriteStream(filename);
    request(url)
      .pipe(stream)
      .on("close", function(err) {
        if (err) return reject(err);
        resolve();
      });
  });
};

module.exports = router => {
  // 上传,支持多文件
  router.post("/", upload.single("file"), async ctx => {
    // let user = ctx.session;
    console.log("xxx", ctx.req.file);
    ctx.set("Access-Control-Allow-Origin", "*");
    const file = ctx.req.file;
    if(!file) {
      ctx.body = {
        code: 1,
        msg: "未找到文件"
      };
      return;
    }
    if (file.size >= config.uploadFileMaxByte) {
      ctx.body = {
        code: 1,
        msg: "上传文件过大"
      };
      return;
    }

    if (file.mimetype != "application/zip") {
      ctx.body = {
        code: 1,
        msg: "上传文件必须是zip格式"
      };
      return;
    }
    // 保存文件
    try {
      let fileInfo = {
        id: file.filename, // 是一个uuid
        filename: file.originalname,
        contentType: file.mimetype,
        size: file.size
      };

      let filePath = path.join(config.uploadSavePath, fileInfo.id);
      // 先存在本地临时目录，后续可以移动到特殊目录
      // await fsLib.fileMove(file, filePath);
      ctx.rspData = fileInfo;
    } catch (err) {
      return commonError(ctx, err, resErr.UnknownError.code, err.toString());
    }
  });

  // 下载
  router.get("/:id", async ctx => {
    let id = ctx.params.id;
    try {
      let filePath = path.join(config.uploadSavePath, id);

      let g = await fsLib.fileStat(filePath); //检查文件是否存在
      if (g.isFile() != true) {
        return commonError(ctx, err, resErr.UnknownError.code, "文件格式错误");
      }

      //检查是否有读取权限 不存在会抛错,此方法没有返回值
      await fsLib.fileAccess(filePath, fs.constants.R_OK); //node5及以下版本使用 fs.R_OK

      ctx.response.set(
        "Content-Type",
        "application/zip"
      );
      ctx.response.set(
        "Cache-Control",
        "no-cache, no-store, must-revalidate, proxy-revalidate"
      );

      ctx.response.body = fs.createReadStream(filePath);
    } catch (err) {
      ctx.response.status = 500;
      ctx.response.body = "未在服务器找到指定文件资源!";
    }
  });
};
