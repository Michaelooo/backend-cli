module.exports = {
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
	mongoose: {
		uri: ""
	}
};
