const Errors = require("../libs/errors");
const _ = require("lodash");

module.exports = async (ctx, next) => {
	try {
		await next();
		if (this.rspBody) {
			this.body = this.rspBody;
		} else if (typeof this.rspCode === "number") {
			this.body = this.rspBody = {
				code: this.rspCode,
				msg: this.rspMsg || Errors.UnknownError.msg
			};
		} else if (this.rspData) {
			this.body = this.rspBody = {
				code: 0,
				data: this.rspData
			};
		}
	} catch (err) {
		if (err == null) {
			err = new Error(Errors.UnknownError.msg);
		} else if (_.isString(err)) {
			err = new Error(err);
		}
		this.type = "application/json";
		if (err.rspBody) {
			this.status = 200;
			this.body = err.rspBody;
		} else {
			this.status = err.status || 500;
			this.body = this.rspBody = {
				code: Errors.UnknownError.code,
				msg: err.message
			};
		}
	}
};
