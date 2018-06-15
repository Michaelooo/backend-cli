const _ = require("lodash");
const mongoose = require("mongoose");
const requireTree = require("require-tree");
let Grid = require("gridfs-stream");
const logger = require("../libs/logger");
const config = require("../config");

mongoose.Promise = require("bluebird");
mongoose.set("debug", true);
Grid.mongo = mongoose.mongo;

let client = mongoose.createConnection(
	config.mongoose.uri,
	config.mongoose.options
);

client.on("error", function(err) {
	logger.error("mongoose err:%j", err);
});

client.on("connecting", function() {
	logger.info(config.mongoose.uri + " connecting");
});

client.on("connected", function() {
	logger.info(config.mongoose.uri + " connected");
});

client.on("disconnected", function() {
	logger.info(config.mongoose.uri + " disconnected");
});

client.on(
	"reconnected",
	_.debounce(function() {
		logger.info(config.mongoose.uri + " reconnected");
	}, 3000)
);

client.on("close", function() {
	logger.info(config.mongoose.uri + " close");
});

// 添加 schema,指定目录
let Schema = mongoose.Schema;
let schemasConfig = requireTree("../schemas/user");

// schema 中间件
function schemaMiddleware(name, newSchema) {
	if (name == "users" || name == "roles") {
    newSchema.pre("create", function(next) {
      this.update({}, { $set: { create_at: new Date() } });
      next();
    });
    newSchema.pre("update", function(next) {
      this.update({}, { $set: { updated_at: new Date() } });
      next();
    });
    newSchema.pre("save", function(next) {
      this.create_at = new Date();
      next();
    });
  }
}

// 规范化管理 schema ， 同一功能模块的放在同一文件夹
_.forEach(schemasConfig, (config, name) => {
	if (config.schema) {
		createSchema(name, config.schema, config.options, config.indexes);
	} else {
		_.forIn(config, (value, key) => {
			if (!value.schema) {
				logger.error("ERROR: not support db schema format");
				return;
			}
			createSchema(key, value.schema, value.options, value.indexes);
		});
	}
});

function createSchema(name, schema, options, indexes) {
	let newSchema = new Schema(schema, options);

	if (indexes) {
		_.forEach(indexes, indexOptions => {
			newSchema.index(...indexOptions);
		});
	}
	client.model(name, newSchema);
}

module.exports = client;
// module.exports.GridFs = Grid(client.db, mongoose.mongo);
