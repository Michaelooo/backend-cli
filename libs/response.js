let resErr = require("./errors");

module.exports = { commonError };

/**
 * 通用错误处理方法
 * @param {Mixed} ctx koa this上下文
 * @param {Error} err 错误实例
 * @param {Number} err_code 错误码
 * @param {String} msg 响应消息
 */
function commonError(ctx, err, err_code, msg) {
	// 对象参数形式
	ctx.status = 200;
	if (arguments.length === 1) {
		ctx.rspCode = resErr.UnknownError.code;
		ctx.rspMsg = "Error happen!";
		return;
	}

	if (
		err_code == resErr.AuthError.code ||
		err_code == resErr.PermissionError.code
	) {
		ctx.status = 401;
	}

	ctx.rspCode = err_code;
	ctx.rspMsg = msg;
}
