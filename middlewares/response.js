const Errors = require("../libs/errors");
const _ = require("lodash");

module.exports = async (ctx, next) => {
	try {
		await next();
		if (ctx.rspBody) {
			ctx.body = ctx.rspBody;
		} else if (typeof ctx.rspCode === "number") {
			ctx.body = ctx.rspBody = {
				code: ctx.rspCode,
				msg: ctx.rspMsg || Errors.UnknownError.msg
			};
		} else if (ctx.rspData) {
			ctx.body = ctx.rspBody = {
				code: 0,
				data: ctx.rspData
			};
		}
	} catch (err) {
		if (err == null) {
			err = new Error(Errors.UnknownError.msg);
		} else if (_.isString(err)) {
			err = new Error(err);
		}
		ctx.type = "application/json";
		if (err.rspBody) {
			ctx.status = 200;
			ctx.body = err.rspBody;
		} else {
			ctx.status = err.status || 500;
			ctx.body = ctx.rspBody = {
				code: Errors.UnknownError.code,
				msg: err.message
			};
		}
	}
};
