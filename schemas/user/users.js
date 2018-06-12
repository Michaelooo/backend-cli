"use strict";

let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let { Mixed, ObjectId } = mongoose.Schema.Types;

//用户
module.exports = {
	schema: {
		name: { type: String, unique: true },
		email: { type: String },
		password: { type: String, default: "pass1234" },
		describe: { type: String }
	},
	option: {
		collection: "users"
	}
};
