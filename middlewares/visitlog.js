const logger = require("../libs/logger");
const URL = require("url");

module.exports = async (ctx, next) => {
	let url = ctx.originalUrl;
	let pathname = URL.parse(url).pathname;
	let cgiKey = ["cgi", pathname.slice(1).replace(/\//g, "-")].join(".");
	let reqBody = ctx.request.body ? JSON.stringify(ctx.request.body) : null;
	logger.debug(`${ctx.reqId}-request-${url}` + (reqBody ? "-" + reqBody : ""));
	await next();
	if (ctx.rspBody && ctx.rspBody.code !== 0) {
		logger.debug(`${ctx.reqId}-response-${JSON.stringify(ctx.rspBody)}`);
	}
};
