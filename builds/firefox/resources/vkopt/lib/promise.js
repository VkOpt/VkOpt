var {Cu}  = require('chrome');

Cu.import("resource://gre/modules/Promise.jsm");
if (!Promise.all) { //Support for FF 24.0
  Promise = (function () {
    var obj = {};
    for (var prop in Promise) {
       if(Promise.hasOwnProperty(prop)) {
          obj[prop] = Promise[prop];
       }
    }
    obj.all = function (arr) {
      var d = new Promise.defer(), results = [], stage = arr.length;
      function next (succeed, i, result) {
        results[i] = result;
        stage -= 1;
        if (!succeed) d.reject(result);
        if (!stage) d.resolve(results);
      }
      arr.forEach((e, i) => e.then(next.bind(this, true, i), next.bind(this,false, i)));
      return d.promise;
    }
    Object.freeze(obj);
    return obj;
  })();
}

exports.Promise = Promise;