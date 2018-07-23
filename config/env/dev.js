module.exports = {
	uploadFileMaxByte: 200 * 1024 * 1024, //200mb
  	uploadSavePath: "./tmp", //开发机使用系统临时文件夹
	mongo: {
		uri: ""
	},
	session: {
    key: "sid",
    maxAge: 86400000,
    httpOnly: true
  },
	mysql: {
		uri: "",
		minConn: 0,
		maxConn: 6,
		maxIdleTime: 3000
	},
	// 添加正确的mongo配置
	mongoose: {
    uri: "mongodb://localhost:27017/db/test",
    options: {
      user: "",
      pass: "",
      auth: {
        authdb: ""
      }
    }
  }
};
