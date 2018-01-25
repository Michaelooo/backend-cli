const Sequelize = require("sequelize");
const logger = require("../libs/logger");
const config = require("../config");

logger.info("DB_URL:||" + config.mysql.uri);
module.exports = new Sequelize(config.mysql.uri, {
	dialect: "mysql", // 'postgres'
	dialectOptions: {
		charset: "utf8"
		// collate: 'utf8mb4_general_ci'
	},
	pool: {
		minConnections: config.mysql.minConn,
		maxConnections: config.mysql.maxConn,
		maxIdleTime: config.mysql.maxIdleTime
	},
	query: {
		raw: true
	},
	logging: function(msg) {
		// 需要的时候开启trace层级的调试
		// logger.debug(msg);
	}
});
