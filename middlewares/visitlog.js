const logger = require("../libs/logger");
const URL = require("url");

module.exports = async (ctx, next) => {
	let url = this.originalUrl;
	let pathname = URL.parse(url).pathname;
	let cgiKey = ["cgi", pathname.slice(1).replace(/\//g, "-")].join(".");
	let reqBody = this.request.body ? JSON.stringify(this.request.body) : null;
	logger.debug(`${this.reqId}-request-${url}` + (reqBody ? "-" + reqBody : ""));
	await next();
	if (this.rspBody && this.rspBody.code !== 0) {
		logger.debug(`${this.reqId}-response-${JSON.stringify(this.rspBody)}`);
	}
};
