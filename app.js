const koa = require("koa");
const app = (module.exports = new koa());
const logger = require("./libs/logger");
const config = require("./config");
require("./libs/catch");

process.on("uncaughtException", err => {
	console.log("uncaught error happen:");
	console.dir(err.stack);
	try {
		var killTimer = setTimeout(function() {
			process.exit(1);
		}, 30000);
		killTimer.unref();
	} catch (e) {
		logger.error("error when exit: %j", e.stack);
	}
});

app.on("error", function(err, ctx) {
	logger.error("server error, %j", err, err);
});

// cors
const cors = require("koa-cors");
app.use(
	cors({
		credentials: true
	})
);

// request id
const instanceMark = Math.random()
	.toString(36)
	.substr(2, 6);
var globalReqId = 0;
app.use(async (ctx, next) => {
	this.reqId = [instanceMark, globalReqId++].join(".");
	await next();
});

// body parser
const bodyParser = require("koa-bodyparser");
app.use(bodyParser());

// helmet
const helmet = require("koa-helmet");
app.use(
	helmet({
		frameguard: false
	})
);

// 上面frameguard:false 关不掉有问题
app.use(async (ctx, next) => {
	await next();
	// 默认X-Frame-Options: SAMEORIGIN会导致浏览器iframe标签抛错
	// https://www.ietf.org/rfc/rfc7034.txt
	ctx.response.remove("x-frame-options");
});

const visitlog = require("./middlewares/visitlog");
app.use(visitlog);

// 响应数据格式统一处理
const response = require("./middlewares/response");
app.use(response);

//var session = require('koa-session');
//app.use(session(app));

// 用户认证

// 路由
const routers = require("./middlewares/routes")("controllers");
routers.forEach(router => {
	app.use(router.routes());
});

// 压缩
const compress = require("koa-compress");
app.use(compress());

if (!module.parent) {
	let port = process.env.PORT || 3000;
	app.listen(port);
	logger.info("listening on port " + port);
}
