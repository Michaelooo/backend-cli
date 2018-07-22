module.exports = {
	mongo: {
		uri: ""
	},
	mysql: {
		uri: "",
		minConn: 0,
		maxConn: 6,
		maxIdleTime: 3000
	},
	session: {
    key: "sid",
    maxAge: 86400000,
    httpOnly: true
  },
	mongoose: {
		uri: ""
	}
};
