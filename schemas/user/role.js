"use strict";

let mongoose = require("mongoose");
let Schema = require("mongoose").Schema;
let ObjectId = mongoose.Schema.Types.ObjectId;
let { Mixed, ObjectId } = mongoose.Schema.Types.Mixed;

//用户权限表
let dbSchema = new mongoose.Schema(
	{
		accountId: { type: String, required: true },
		name: { type: String, required: true },
		role: [{ type: String, enum: ["A", "B", "Admin"] }],
		permissions: [{ type: String }]
	},
	{
		collection: "roles"
	}
);

dbSchema.index({ accountId: 1, accountType: 1 }, { unique: true });

module.exports =mongoose.model("roles", dbSchema);
