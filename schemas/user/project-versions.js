// 项目版本信息
"use strict";

let mongoose = require("mongoose");
let Schema = require("mongoose").Schema;
let { Mixed, ObjectId } = Schema.Types;

module.exports = {
  schema: {
    project_id: { type: ObjectId, require: true }, //项目Id
    current_version: { type: String }, //项目当前版本
    last_version: { type: String }, // 上个版本号
    package_type: { type: String }, // 包类别，通用包，环境包
    version_type: { type: String, require: false }, //版本类别，主版本，版本，修订
    package_url: {
      uat: { type: String },
      test: { type: String },
      production: { type: String }
    }, //包url
    last_publish_time: { type: Date }, //当前版本的最新发布时间
    create_at: { type: Date }, //版本新增时间
    update_at: { type: Date }, //版本更新时间
    content: { type: String, require: false }, //升级内容
    size: { type: String, require: false }, //包大小
    deployStatus: {type: String, enum: [0,1,2,3,4,5] }  //发布状态
  },
  options: {
    collection: "project-versions"
  }
};
