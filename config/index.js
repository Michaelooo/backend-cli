const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const logger = require("../libs/logger");

let config = require("./base");

let env = "dev",
	debug = false;
switch (process.env.NODE_ENV) {
	case "dev":
	case "development":
		env = "dev";
		debug = true;
		break;
	case "test":
		env = "test";
		break;
	case "uat":
		env = "uat";
		break;
	case "prod":
	case "production":
		env = "prod";
		break;
}

var envFilePath = path.join(__dirname, `env/${env}.js`);
if (fs.existsSync(envFilePath)) {
	try {
		var envConfig = require(envFilePath);
		if (envConfig) {
			config = _.merge(config, envConfig);
		}
	} catch (_) {
		logger.info(`加载${env}配置文件失败`);
	}
}

module.exports = config;
