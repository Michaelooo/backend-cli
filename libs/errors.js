module.exports = {
	AuthError: { code: 17, msg: "用户尚未登录" },
	PermissionError: { code: 18, msg: "用户权限不足" },
	UnknownError: { code: 11, msg: "系统错误，请稍候重试" },
	ParamMissing: { code: 12, msg: "缺少传入参数" },
	ParamError: { code: 13, msg: "传入参数错误" },
	InterfError: { code: 14, msg: "内部接口错误，请稍候重试" },
	EmptyError: { code: 15, msg: "内部接口错误，请稍候重试" },
	DataError: { code: 16, msg: "内部接口数据有误" } // 有数据，但与预期不同
};
