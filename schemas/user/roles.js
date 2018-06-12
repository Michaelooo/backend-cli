"use strict";

let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let { Mixed, ObjectId } = mongoose.Schema.Types;

//用户权限表

module.exports = {
	schema:{
		accountId: { type: String, required: true },
		name: { type: String, required: true },
		role: [{ type: String, enum: ["A", "B", "Admin"] }],
		permissions: [{ type: String }]
	},
	option:{
		collection: "roles"
	}
};
