const _ = require("lodash");
const logger = require("./logger");
var FtpClient = require("ftp-client");
var config = {
	host: "",
	port: 21,
	user: "",
	password: ""
};
var base = "tmp/uploads";
// var source = base + '/**';
var target = "pub" + base;
var options = {
	logging: "basic"
};
var upOption = {
	baseDir: base,
	overwrite: "older"
};

module.exports = function asyncUploadFtp(filename) {
	return new Promise((resolve, reject) => {
		var fct = new FtpClient(config, options);
		let source = base + "/" + filename;
		let targetFile = target + "/" + filename;
		fct.connect(function() {
			fct.upload(source, target, upOption, result => {
				fct.ftp.end();
				if (_.isEmpty(result.errors) === false) {
					reject(result.errors);
					return;
				}
				resolve();
			});
		});
	});
};
