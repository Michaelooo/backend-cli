let fs      = require('fs');
let Promise = require('bluebird');
let path    = require('path');


let fileStat   = Promise.promisify(fs.stat);
let fileAccess = Promise.promisify(fs.access);
let fileDelete = Promise.promisify(fs.unlink);
let fileRename = Promise.promisify(fs.rename);

module.exports = {
  fileStat,
  fileAccess,
  fileDelete,
  fileRename,
  fileMove
};

//rename替代方案, 默认的rename在跨磁盘分区时会出错
function fileMove(fromPath, toPath) {
  let moveFilePromise = new Promise((resolve, reject) => {
    let rs = fs.createReadStream(fromPath);
    let ws = fs.createWriteStream(toPath);

    rs.on('error', (err) => {reject(err);});
    ws.on('error', (err) => {reject(err);});
    ws.on('close', () => {
      fileDelete(fromPath)
        .then(() => {resolve();})
        .catch(err => {reject(err);});
    });
    rs.pipe(ws);
  });
  return moveFilePromise;
}