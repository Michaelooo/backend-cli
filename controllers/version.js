const config   = require('../config');
const Promise    = require('bluebird');
const Joi = require('joi');
const mongo = require('../db/mongo');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const _          = require('lodash');
const logger = require('../libs/logger');
const auth = require('../middlewares/auth');
const commonError = require('../libs/response').commonError;
const resErr = require('../libs/errors');
let JoiValidatePromise = Promise.promisify(Joi.validate);

const Version = mongo.model('project-versions');
const Project = mongo.model('projects');


module.exports = router => {

  // 新增版本
  router.post('/save', async (ctx) => {

    let paramSchema = Joi.object().keys({
      project_id: Joi.string().required(),
      current_version: Joi.string().required(), // 新版本
      package_type: Joi.string().valid('通用包', '环境包').default('通用包'),
      version_type: Joi.string().valid('主版本', '次版本', '修订').default('修订'),
			content:Joi.string().optional(),
			size: Joi.number().required(), // 包的大小
			package_url: {
				uat: Joi.string(),
				test: Joi.string(),
				production: Joi.string(),
			}
    });

    let param;
    try {
      param = await JoiValidatePromise(ctx.request.body, paramSchema, {allowUnknown: true});
    } catch (err) {
      return commonError(ctx, {}, resErr.ParamError.code, err.details[0].message.toString());
    }

    try {
      let oldVersion = await Version.find({ project_id: ObjectId(param.project_id) }).sort({ create_time: -1}).exec();
			if(oldVersion.length > 0 && oldVersion[0].current_version === param.version){
        return commonError(ctx, err, resErr.UnknownError.code, '已存在此版本号，请检查');
      }else{
        let newParams = param;
        await Version.create(newParams);

        // 每次新增或者更新版本信息，需更新project中的project_id
        let last_version = await Version.find({ project_id: ObjectId(param.project_id) }).sort({ create_time: -1}).exec();
        if(last_version.length > 0){
          let project_version = last_version[0]._id;
          await Project.findByIdAndUpdate(param.project_id,{
            $set:{
              project_version: ObjectId(project_version)
            }
          });
        }
      }
    } catch (err) {
      return commonError(ctx, err, resErr.UnknownError.code, err.toString());
    }

    ctx.body = {
      code: 0,
      msg: 'ok'
    };
  });

  // 编辑,只允许修改包和版本升级内容，
  router.post('/update/:id', async (ctx) => {

    let id = ctx.params.id;

    let paramSchema = Joi.object().keys({
      package_type: Joi.string().valid('通用包', '环境包').default('通用包'),
      version_type: Joi.string().valid('主版本', '次版本', '修订').default('修订'),
			content:Joi.string().optional(), // 升级内容
			package_url: {
				uat: Joi.string(),
				test: Joi.string(),
				production: Joi.string(),
			}
    });

    let param;
    try {
      param = await JoiValidatePromise(ctx.request.body, paramSchema, {allowUnknown: true});
    } catch (err) {
      return commonError(ctx, {}, resErr.ParamError.code, err.details[0].message.toString());
    }

    try {
      let old = await Version.findById(id).exec();
      // update
      if(old){
        // let newParams = Object.assign({},old,param);
        await Version.findByIdAndUpdate(id, {
          $set:{
            package_type: param.package_type,
            version_type: param.version_type,
            content: param.content,
            package_url: param.package_url,
          }
        });
      }else {
        return commonError(ctx, err, resErr.UnknownError.code, "不存在此条版本号");
      }
    } catch (err) {
      return commonError(ctx, err, resErr.UnknownError.code, err.toString());
    }

    ctx.body = {
      code: 0,
      msg: 'ok'
    };
  });

  // 获取项目的所有版本列表
  router.get('/get',async (ctx) => {

    let paramSchema = Joi.object().keys({
			project_id: Joi.string().required(),
      offset: Joi.number().integer().min(0).default(0).optional(),
      limit: Joi.number().integer().min(1).max(100).default(10).optional(),
    });

    let param;
    try {
      param = await JoiValidatePromise(ctx.request.query, paramSchema, {allowUnknown: true});
    } catch (err) {
      return commonError(ctx, {}, resErr.ParamError.code, err.details[0].message.toString());
    }

    let versionList;
    try {
      versionList = await Version.find({ project_id: param.project_id }).skip(param.offset).limit(param.limit).sort({ create_at: -1 }).exec();
      
    } catch (err) {
      return commonError(ctx, err, resErr.UnknownError.code, err.toString());
    }
    ctx.body = {
      code : 0,
      data : versionList
    }
  });

  // 获取项目的所有的某个版本信息,id=版本id
  router.get('/get/:id',async (ctx) => {

    let id = ctx.params.id;
    let versionList;
    try {
      versionList = await Version.findById(id).exec();
      
    } catch (err) {
      return commonError(ctx, err, resErr.UnknownError.code, err.toString());
    }
    ctx.body = {
      code : 0,
      data : versionList
    }
  });

  // 删除某个项目的具体版本
  router.put('/delete/:id',async (ctx) => {

    let id = ctx.params.id;
    let versionList;
    try {
      versionList = await Version.findById(id).exec();
      if(!versionList){
        return commonError(ctx, err, resErr.UnknownError.code, "项目不存在");
      } else {
        await Version.remove({ _id: ObjectId(id) }).exec();
      }
    } catch (err) {
      return commonError(ctx, err, resErr.UnknownError.code, err.toString());
    }
    ctx.body = {
      code : 0,
      data : "OK"
    }
  });

};
