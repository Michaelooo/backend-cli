"use strict";
const logger = require("./logger");
let rp = require("request-promise");

require("request-debug")(rp, function(type, data, r) {
	// put your request or response handling logic here
	// Todo: request-post data lost? response json.stringify broken?
	var debugId = data.debugId;
	var body = data.body;
	var myDate = new Date();
	if (type === "request") {
		var uri = data.uri;
		var method = data.method;
		var userId = data.headers.userId;
		var more = body ? "" : "-" + body + userId ? "" : "userId:" + userId;
		var reqMsTime = myDate.getTime();
		logger.debug(
			`${debugId}-request-${reqMsTime}-${method}-${uri}-${body}` + more
		);
	}

	if (type === "response") {
		var statusCode = data.statusCode;
		var respMsTime = myDate.getTime();
		logger.debug(
			`${debugId}-response-${respMsTime}-${statusCode}-` +
				JSON.stringify(body || "").slice(0, 1200)
		);
	}
});

// default catch for non-200 return the error
function defaultErrMsg(err) {
	try {
		return `${err.name}-${err.message}-${err.options.url}`;
	} catch (e) {
		return JSON.stringify(err).slice(0, 300);
	}
}
module.exports = rp;
