const request = require('request');


  module.exports = (url) => {

    return new Promise(function(resolve, reject) {
      request(url, function (error, response, body) {
        if (error) {
          reject(error);
        }else{
          resolve(body);
        }
      });
    });
w
  }
