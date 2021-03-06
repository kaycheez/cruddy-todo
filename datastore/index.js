const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((error, nextNumber) => {
    fs.writeFile(path.join(exports.dataDir, `${nextNumber}.txt`), text, err => {
      if (err) {
        throw err;
      }
      let todo = {
        id: nextNumber,
        text: text
      };
      callback(null, todo);
    });
  });
};

exports.readOne = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, `${id}.txt`), (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, { id: id, text: new Buffer(data).toString() });
    }
  });
};

exports.readAll = callback => {
  fs.readdir(exports.dataDir, (err, fileNames) => {
    var promises = fileNames.map(fileName => {
      return new Promise((resolve, reject) => {
        exports.readOne(fileName.slice(0, 5), (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    });

    Promise.all(promises).then(items => callback(null, items));
  });
};

exports.update = (id, text, callback) => {
  exports.readOne(id, (error, todo) => {
    if (error) {
      return callback(new Error(`No item with id: ${id}`));
    }
    fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, error => {
      if (error) {
        return callback(error);
      }
      let todo = {
        id: id,
        text: text
      };
      // console.log(todo);
      callback(null, todo);
    });
  });
};

exports.delete = (id, callback) => {
  fs.unlink(`${exports.dataDir}/${id}.txt`, err => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};
// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
