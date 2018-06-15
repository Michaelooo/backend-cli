module.exports = {
	uploadFileMaxByte: 200 * 1024 * 1024, //200mb
  	uploadSavePath: "./tmp", //开发机使用系统临时文件夹
	mongo: {
		uri: ""
	},
	mysql: {
		uri: "",
		minConn: 0,
		maxConn: 6,
		maxIdleTime: 3000
	},
	mongoose: {
		uri: ""
	}
};
