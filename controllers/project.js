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

const Project = mongo.model('projects');


module.exports = router => {

  // 新增
  router.post('/save', async (ctx) => {
    // let user = ctx.session;
    let paramSchema = Joi.object().keys({
      project_name: Joi.string().required(),
      desc: Joi.string().optional(),
      owner: Joi.string().default('admin').required(),
      domain: Joi.string().default('10.0.0.0').required(),
      cgi_rule: Joi.array().items(Joi.object().keys({
        prefix: Joi.string().required(),
        uat_proxy: Joi.string().required(),
        test_proxy: Joi.string().required(),
        production_proxy: Joi.string().required(),
      }))
    });
    let param;
    try {
      param = await JoiValidatePromise(ctx.request.body, paramSchema, {allowUnknown: true });
    } catch (err) {
      return commonError(ctx, {}, resErr.ParamError.code, err.details[0].message.toString());
    }
    try {
      let oldProject = await Project.find({ project_name: param.project_name}).exec();
      if(oldProject.length > 0){
        return commonError(ctx, err, resErr.UnknownError.code, '存在同名项目名称，请重新选择');
      }else{
        let newParams = param;
        newParams.count = 0;
        await Project.create(newParams);
      }
    } catch (err) {
      return commonError(ctx, err, resErr.UnknownError.code, err.toString());
    }

    ctx.body = {
      code: 0,
      msg: 'ok'
    };
  });

  // 编辑
  router.post('/update/:id', async (ctx) => {

    let id = ctx.params.id;

    let paramSchema = Joi.object().keys({
      project_name: Joi.string().required(),
      desc: Joi.string().optional(),
      owner: Joi.string().default('admin').required(),
      domain: Joi.string().default('10.0.0.0').required(),
      cgi_rule: Joi.array().items(Joi.object().keys({
        prefix: Joi.string().required(),
        uat_proxy: Joi.string().required(),
        test_proxy: Joi.string().required(),
        production_proxy: Joi.string().required(),
      }))
    });

    let param;
    try {
      param = await JoiValidatePromise(ctx.request.body, paramSchema, {allowUnknown: true});
    } catch (err) {
      return commonError(ctx, {}, resErr.ParamError.code, err.details[0].message.toString());
    }
    try {
      let oldProject = await Project.findById(id).exec();
      // update
      if(oldProject){
        // let newParams = Object.assign({},oldProject,param);
        await Project.findByIdAndUpdate(id,{
          $set:{
            project_name: param.project_name,
            desc: param.desc,
            owner: param.owner,
            domain: param.domain,
            cgi_rule: param.cgi_rule
          }
        });
      }else{
        return commonError(ctx, {}, resErr.ParamError.code, "不存在此工程");
      }
    } catch (err) {
      return commonError(ctx, err, resErr.UnknownError.code, err.toString());
    }

    ctx.body = {
      code: 0,
      msg: 'ok'
    };
  });

  // 获取项目列表
  router.get('/get',async (ctx) => {

    let paramSchema = Joi.object().keys({
      offset: Joi.number().integer().min(0).default(0).optional(),
      limit: Joi.number().integer().min(1).max(100).default(10).optional(),
    });

    let param;
    try {
      param = await JoiValidatePromise(ctx.request.query, paramSchema, {allowUnknown: true});
    } catch (err) {
      return commonError(ctx, {}, resErr.ParamError.code, err.details[0].message.toString());
    }

    let projectList;
    try {
      projectList = await Project.find().skip(param.offset).limit(param.limit).populate('project_version').sort({ create_at: -1 }).exec();
      
    } catch (err) {
      return commonError(ctx, err, resErr.UnknownError.code, err.toString());
    }
    ctx.body = {
      code : 0,
      data : projectList
    }
  });

  // 获取项目单个信息
  router.get('/get/:id',async (ctx) => {

    let id = ctx.params.id;
    let projectList;
    try {
      projectList = await Project.findById(id).populate('project_version').exec();
      
    } catch (err) {
      return commonError(ctx, err, resErr.UnknownError.code, err.toString());
    }
    ctx.body = {
      code : 0,
      data : projectList
    }
  });

  // 删除项目
  router.put('/delete/:id',async (ctx) => {

    let id = ctx.params.id;
    let projectList;
    try {
      projectList = await Project.findById(id).exec();
      if(projectList.length == 0){
        return commonError(ctx, err, resErr.UnknownError.code, "项目不存在");
      } else {
        await Project.remove({ _id: ObjectId(id) }).exec();
      }
    } catch (err) {
      return commonError(ctx, err, resErr.UnknownError.code, err.toString());
    }
    ctx.body = {
      code : 0,
      msg : "ok"
    }
  });
};
