const Joi = require("joi");
const _ = require("lodash");
const promise = require("bluebird");
const Errors = require("./errors");

const JoiValidatePromise = promise.promisify(Joi.validate);

/**
 * [validateThrow 如果校验失败，throw error，如果成功，返回转换后的数据]，
 * @param  {[type]} argument [description]
 * @return {[type]}          [description]
 */
Joi.validateThrow = function() {
	let result = Joi.validate.apply(Joi, arguments);
	let err = result.error;
	if (err) {
		err.rspBody = _.extend({}, Errors.ParamError, {
			msg: result.error.message
		});
		throw err;
	} else {
		return result.value;
	}
};

module.exports = Joi;
