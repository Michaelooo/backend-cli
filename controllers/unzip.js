const config = require('../config');
const Promise = require('bluebird');
const Joi = require('joi');
const mongo = require('../db/mongo');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const _ = require('lodash');
const logger = require('../libs/logger');
const auth = require('../middlewares/auth');
const commonError = require('../libs/response').commonError;
const resErr = require('../libs/errors');
const unzip = require('unzip');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const decompress = require('decompress');
const decompressUnzip = require('decompress-unzip');
let JoiValidatePromise = Promise.promisify(Joi.validate);

// const Project = mongo.model('projects');
const unzipSteam = async (ctx, source, target) => {
  let isExist = fs.existsSync(source);
  if (!isExist) {
    ctx.body = {
      code: 1,
      msg: "文件不存在"
    };
    return;
  }
  let targetExist = fs.existsSync(target);
  if (!targetExist) {
    mkdirp.sync(target);
  }
  return new Promise((resolve, reject) => {
    fs.createReadStream(source)
      .pipe(unzip.Parse())
      .on('entry', function (entry) {
        let fileName = entry.path;
        let type = entry.type; // 'Directory' or 'File'
        let size = entry.size;
        let reg = /^\d|\s/;
        if (reg.test(fileName)) {
          reject(new Error('文件名称不合法'));
        }
        if (fileName !== '__MACOSX') {
          entry.pipe(fs.createWriteStream(target))
            .on('error', function (error) {
              reject(error);
            }).on('close', function () {
              resolve(stream);
            });
        }
      })
  });
};

const validSrc = async (ctx, dir) => {
  let reg = /^\d|\s/;
  let readDirAsync = Promise.promisify(fs.readdir);
  let lstatAsync = Promise.promisify(fs.lstat);
  try {
    let fileList = await readDirAsync(dir);
    console.log('file', fileList);
    return Promise.all(fileList.map(file => {
      let filePath = path.join(dir, file);
      // return lstatAsync(filePath).then(stat => {
      //   if (stat.isDirectory()) {
      //     return await validSrc(ctx, filePath);;
      //   } else {
      //     return [file];
      //   }
      // });
      // let lstatFile = await lstatAsync(filePath);
      // if (lstatFile.isDirectory) {
      //   return await validSrc(ctx, filePath);
      // } else {
      //   return [file];
      // }
    }));
  } catch (err) {
    return commonError(ctx, err, resErr.UnknownError.code, err.toString());
  }
}

module.exports = router => {
  // plan b
  router.put('/b', async (ctx) => {
    let reg = /^\d|\s/;
    try {
      let isExist = fs.existsSync('ceshi.zip');
      if (!isExist) {
        ctx.body = {
          code: 1,
          msg: "文件不存在"
        };
        return;
      }

      let ss = await validSrc(ctx, './test');

      let targetExist = fs.existsSync('dist');
      if (!targetExist) {
        mkdirp.sync('output/path');
      }



      let res = await decompress('ceshi.zip', 'dist', {
        plugins: [
          decompressUnzip()
        ]
      });
      if (res) {
        ctx.body = {
          code: 0,
          msg: 'ok'
        }
      }

    } catch (err) {
      return commonError(ctx, err, resErr.UnknownError.code, err.toString());
    }

  });
  // plan a
  router.put('/', async (ctx) => {
    let reg = /^\d|\s/;
    try {


      let res = await unzipSteam(ctx, 'ceshi.zip', 'output/path');
      console.res('ss'.res)

    } catch (err) {
      return commonError(ctx, err, resErr.UnknownError.code, err.toString());
    }

  });
};
