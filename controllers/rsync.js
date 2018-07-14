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
const Rsync = require('rsync');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const decompress = require('decompress');
const decompressUnzip = require('decompress-unzip');
let JoiValidatePromise = Promise.promisify(Joi.validate);

// const Project = mongo.model('projects');
const rsyncFunc = async (ctx, source, target) => {
  let rsync = new Rsync()
    .shell('ssh')
    .flags('az')
    .source(source)
    .destination(target);
  
  return new Promise((resolve, reject) => {
    rsync.execute(function(error, code, cmd) {
        // we're done
        if(error){
          reject(error);
        }
    },function(data){
        // do things like parse progress
        console.log('data',data.toString());
        resolve(data);
    }, function(data) {
        // do things like parse error output
        reject(data.toString());
    });
  });
};


module.exports = router => {

  // plan a
  router.put('/', async (ctx) => {
    try {
      let res = await rsyncFunc(ctx, './dist', 'root@120.79.75.83:/fff');
      console.log('ss'.res);
      ctx.body = {
        code: 0,
        msg: res
      }
    } catch (err) {
      return commonError(ctx, err, resErr.UnknownError.code, err.toString());
    }

  });
};
