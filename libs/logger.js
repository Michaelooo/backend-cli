const winston = require("winston");
const moment = require("moment");
const config = require("../config");
const Logger = winston.Logger;
const File = winston.transports.File;
const Console = winston.transports.Console;

let formatter = function(options) {
	let time = moment().format("YYYY-MM-DD HH:mm:ss");
	return `[${time}]-[${options.level.toUpperCase()}]-${options.message}`;
};

let transports = [
	new Console({
		formatter: formatter
	})
];

// 如果不在eagle里
if (!config.eagle) {
	transports.push(
		new File({
			name: "common",
			filename: "logs/common.log",
			formatter: formatter
		})
	);
	transports.push(
		new File({
			name: "error",
			filename: "logs/error.log",
			level: "error",
			formatter: formatter
		})
	);
}

let logger = new Logger({
	level: config.log.level,
	transports: transports
});

module.exports = logger;
