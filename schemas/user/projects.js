// 项目基础信息
"use strict";

let mongoose = require("mongoose");
let Schema = require("mongoose").Schema;
let { Mixed, ObjectId } = Schema.Types;

let cgiSchema = new Schema({
  prefix: { type: String, required: true }, // 接口配置prefix
  uat_proxy: { type: String },
  test_proxy: { type: String },
  production_proxy: { type: String }
});

module.exports = {
  schema: {
    project_name: { type: String, require: true }, //项目名称
    // latest_version: { type: String, require: false }, //最新版本
    project_version: { type: ObjectId, ref: "project-versions" }, //项目当前版本信息
    count: { type: Number, require: true, default: 0 }, //项目发布次数
    owner: { type: String, require: true, default: "admin" }, //项目负责人
    domain: { type: String, require: true, default: "10.0.0.0" }, //项目挂靠域名
    last_publish_time: { type: Date }, //上次部署时间
    desc: { type: String, require: false }, //项目描述备注
    cgi_rule: [cgiSchema], //接口配置规则
    create_at: { type: Date },
    update_at: { type: Date }
  },
  options: {
    collection: "projects"
  }
};
