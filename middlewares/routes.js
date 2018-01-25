/*
 * @Author: lizhonghui
 * @Date:   2016-09-05 17:19:59
 * @Last Modified by:   lizhonghui
 * @Last Modified time: 2016-09-06 17:12:21
 */

const Router = require("koa-router");
const fs = require("fs");
const path = require("path");
const logger = require("../libs/logger");

function autoLoadAppsRouter(cpath, controller_root) {
	if (!controller_root) {
		controller_root = cpath;
	}
	let routers = [];

	let file_list = fs.readdirSync(cpath);
	file_list.forEach(function(name) {
		let file_path = path.join(cpath, name);
		let relative_to_root = path
			.relative(controller_root, cpath)
			.replace(path.sep, "/");
		let file_prefix = name.replace(".js", "");
		let prefix = "";

		if (file_prefix == "index") {
			file_prefix = "";
			prefix = "/" + relative_to_root;
		} else {
			prefix = "/" + relative_to_root + "/" + file_prefix;
		}

		//如果是控制器根目录,相对路径会是空值,需要特殊处理
		if (relative_to_root == "") {
			prefix = "/" + file_prefix;
		}

		if (name[0] == ".") {
			return logger.warn("ignore hidden file/directory: " + file_path);
		}
		if (fs.lstatSync(file_path).isDirectory()) {
			routers = routers.concat(autoLoadAppsRouter(file_path, controller_root));
		} else {
			if (!/.+(?=\.js)/.test(name)) {
				return logger.warn("ignore invalid router file: " + file_path);
			}
			let router = new Router({
				prefix
			});
			require(file_path)(router);
			routers.push(router);
		}
	});
	return routers;
}

module.exports = controller => {
	const controller_root = path.resolve(controller);
	return autoLoadAppsRouter(controller_root);
};
