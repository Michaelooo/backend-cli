const Promise = require("bluebird");
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const Stream = require("stream");

const config = require("../config");
const logger = require("./logger");
const mongo = require("../db/mongo");
const GridFs = mongo.GridFs;

module.exports = {
	removeFileById,
	removeFiles,
	saveFileFromLocalFile,
	fileInfoById,
	fileStreamById,
	saveFileFromBuffer
};

function removeFileById(rid) {
	let pr = new Promise((reslove, reject) => {
		GridFs.remove({ _id: rid }, err => {
			if (err) {
				return reject(err);
			}
			reslove();
		});
	});
	return pr;
}

function removeFiles(ids) {
	return Promise.map(ids, id => {
		return removeFileById(id);
	});
}

function saveFileFromLocalFile(id, filePath, fileName, fileType, metadata) {
	let pr = new Promise((reslove, reject) => {
		//创建文件读取流传送给gridfs写入流
		let readStream = fs.createReadStream(filePath);
		let writestream = GridFs.createWriteStream({
			_id: id,
			content_type: fileType, //mime
			metadata: metadata || {}, //附加元数据,暂时用不上
			filename: fileName //文件名
		});

		readStream.on("error", err => {
			reject(err);
		});

		//drain, finish, pipe, unpipe, error, open, close
		writestream
			.on("error", err => {
				reject(err);
			})
			.on("close", fileInfo => {
				reslove(fileInfo);
			});

		readStream.pipe(writestream);
	});
	return pr;
}

function fileInfoById(id) {
	let option = { _id: id };

	return new Promise((reslove, reject) => {
		//promiseify转换会报错..
		GridFs.findOne(option, (err, file) => {
			if (err) {
				return reject(err);
			}
			reslove(file);
		});
	});
}

function fileStreamById(id) {
	return GridFs.createReadStream({ _id: id });
}

/**
 * 保存buffer到mongodb
 * @param id
 * @param buffer
 * @param desc
 */
function saveFileFromBuffer(id, file, desc) {
	let pr = new Promise((reslove, reject) => {
		//创建文件读取流传送给gridfs写入流

		let readStream = fs.createReadStream(file);

		let writestream = GridFs.createWriteStream({
			_id: id,
			desc: desc //描述
		});

		readStream.on("error", err => {
			console.log("readStream error: " + err);
			reject(err);
		});

		//drain, finish, pipe, unpipe, error, open, close
		writestream
			.on("error", err => {
				console.log("writestream error: " + err);
				reject(err);
			})
			.on("close", fileInfo => {
				reslove(fileInfo);
			});
		readStream.pipe(writestream);
	});
	return pr;
}
