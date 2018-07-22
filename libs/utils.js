/*
 * Created Date: Friday, July 13th 2018, 2:24:29 pm
 * Author: Michael Cheng
 * -----
 * Last Modified: 
 * Modified By: 
 * -----
 * 通用方法库：
 * ------------------------------------
 */

// 通用记录日志方法
const config = require("../config");
const Promise = require("bluebird");
const mongo = require("../db/mongo");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const unzip = require("unzip");
const compressing = require("compressing");
const mkdirp = require("mkdirp");
const Rsync = require("rsync");
const path = require("path");
const fs = require("fs");
const FtpClient = require('ftp-client');
const commonError = require("./response").commonError;
const resErr = require("./errors");
const Log = mongo.model("logs");

// 传入ctx.req
const getClientIp = function(req) {
  return req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
};

const log = async (ctx, options) => {
  let domain = getClientIp(ctx.req);
  let owner = ctx.username;
  let create_at = new Date();
  let defalut = {
    owner,
    domain,
    create_at,
    project_info: options.project_id ? options.project_id : ObjectId(),
    project_version_info: options.project_version_id ? options.project_version_id : ObjectId(),
    
  };
  let newOptions = Object.assign({}, defalut, options);

  try {
    await Log.create(newOptions);
  } catch (err) {
    return commonError(ctx, err, resErr.UnknownError.code, err.toString());
  }
};

// ftp 传文件
const updateCDN = async (ctx, project) => {
  let tmpPath = config.uploadSavePath;  // dev, ./tmp/   test  /data/package/
  let base = tmpPath + project;
  let ftpConfig = {
    host: '',
    port: 21,
    user: '',
    password: ''
  };
  let options = {
    logging: 'basic'
  };
  let upOption = {
    baseDir: base,
    overwrite: 'none'
  }
  let source = base + '/**';
  let target = 'hd/webpub/' + project + '/';

  let fct = new FtpClient(ftpConfig, options);
  return new Promise((resolve, reject)=> {
    fct.connect(()=>{
      fct.upload(source, target, upOption, (r) => {
        console.log(source,target,r);
        resolve(r);
      })
    })
  })
}

// node-rsync promise
const rsyncPromise = async (ctx, source, target) => {
  let rsync = new Rsync()
    .shell("ssh")
    .flags("cavzP")
    .source(source)
    .destination(target);

  return new Promise((resolve, reject) => {
    rsync.execute(
      function(error, code, cmd) {
        if (error) {
          reject(error);
          console.log("error", error.toString());
          return;
        }
        console.log("sync", code, cmd);
        resolve('ok')
      },
      function(data) {
        console.log("progessing", data.toString());
        
      },
      function(data) {
        console.log("error", data.toString());
        if (data) {
          reject(error);
          console.log("error", error.toString());
          return;
        }
      }
    );
  });
};

// 解压文件夹
const compressingStream = async (ctx, source, target, options) => {
  return new Promise((resolve, reject) => {
    let isExist = fs.existsSync(source);
    if (!isExist) {
      reject(new Error('file not exist'))
      return;
    }
    let targetExist = fs.existsSync(target);
    if (!targetExist) {
      mkdirp.sync(target);
    }
    fs.createReadStream(source)
      .on('error', function (error) {
        reject(error)
      })
      .pipe(new compressing.zip.UncompressStream())
      .on('error', function (error) {
        reject(error)
      })
      .on("finish", function() {
        resolve("ok");
      })
      .on("entry", function(header, stream, next) {
        
        stream.on("end",next);
        setTimeout(() => {
          resolve('ok');
        }, 2000);
        

        let fileName = header.name;
        let type = header.type;
        if(options && !/^__MACOSX\//.test(fileName)){
          fileName = path.join(options.prefix, fileName);
        }

        let reg = /^\d|\s/;
        if (reg.test(fileName)) {
          reject(new Error(fileName + "文件名称不合法,不允许空格或者数字开头"));
        }
        if (!/^__MACOSX\//.test(fileName) && type === "file") {
          stream.pipe(fs.createWriteStream(path.join(target, fileName)));
        } else if (!/^__MACOSX\//.test(fileName) && type === "directory") {
          // directory
          mkdirp(path.join(target, fileName), err => {
            if (err) return reject(err);
            stream.resume();
          });
        }
      });
  });
};

// 解压一个目录，特殊规则，去除__macosx文件，对于名称不合法的文件会提示文件失效
// ****弃用，大文件会导致提示签名失败的错误
const unzipStream = async (ctx, source, target) => {
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
      .on("entry", function(entry) {
        let fileName = entry.path;
        let type = entry.type; // 'Directory' or 'File'
        let size = entry.size;
        let reg = /^\d|\s/;
        if (reg.test(fileName)) {
          reject(new Error(fileName + "文件名称不合法,不允许空格或者数字开头"));
          return;
        }
        if (!/^__MACOSX\//.test(fileName) && type === "File") {
          entry
            .pipe(fs.createWriteStream(path.join(target, fileName)))
            .on("error", function(error) {
              reject(error);
              return;
            })
            .on("close", function() {
              resolve("ok");
              return;
            });
        } else if (!/^__MACOSX\//.test(fileName) && type === "Directory") {
          mkdirp(path.join(target, fileName));
        }
      });
  });
};

// 列出一个目录下的所有文件
const ls = async function(dir, reg, _pending, _result) {
  _pending = _pending ? _pending++ : 1;
  _result = _result || [];

  if (!path.isAbsolute(dir)) {
    dir = path.join(process.cwd(), dir);
  }

  let stat = fs.lstatSync(dir);

  if (stat.isDirectory()) {
    let files = await new Promise((resolve, reject) => {
      fs.readdir(dir, (err, files) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(files);
      });
    });
    files.forEach(function(part) {
      console.log(part);
      lsSync(path.join(dir, part), reg, _pending, _result);
    });
    if (--_pending === 0) {
      return _result;
    }
  } else {
    if (!reg) {
      _result.push(dir);
      return;
    }
    if (!reg.test(dir)) return;
    _result.push(dir);
    if (--_pending === 0) {
      return _result;
    }
  }
};

const lsSync = function(dir, reg, _pending, _result) {
  _pending = _pending ? _pending++ : 1;
  _result = _result || [];

  if (!path.isAbsolute(dir)) {
    dir = path.join(process.cwd(), dir);
  }

  // if error, throw it
  let stat = fs.lstatSync(dir);

  if (stat.isDirectory()) {
    let files = fs.readdirSync(dir);
    files.forEach(function(part) {
      lsSync(path.join(dir, part), reg, _pending, _result);
    });
    if (--_pending === 0) {
      return _result;
    }
  } else {
    if (!reg) {
      _result.push(dir);
      return;
    }
    if (!reg.test(dir)) return;

    _result.push(dir);

    if (--_pending === 0) {
      return _result;
    }
  }
};

module.exports = {
  log,
  ls,
  lsSync,
  unzipStream,
  compressingStream,
  rsyncPromise,
  updateCDN
};
