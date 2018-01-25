"use strict";

let mongoose = require("mongoose");
let Schema = require("mongoose").Schema;
let ObjectId = mongoose.Schema.Types.ObjectId;
let { Mixed, ObjectId } = mongoose.Schema.Types.Mixed;

let dbSchema = new mongoose.schema({
	schema: {
		name: { type: String, unique: true },
		email: { type: String },
		password: { type: String, default: "pass1234" },
		describe: { type: String }
	},
	options: {
		collection: "users"
	}
});

//用户
module.exports = mongoose.model("users", dbSchema);
