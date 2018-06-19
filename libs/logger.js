const winston = require("winston");
const moment = require("moment");
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');
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

const logPath = path.join('./','logs');

// 如果不在eagle里,新建文件夹
if (!config.eagle) {
  if(fs.existsSync(logPath)){
   mkdirp(logPath, err => {
      if (err) console.error(err);
      else console.log('create file path success');
    })
  }
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
