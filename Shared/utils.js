'use strict';

exports.Log = function (name) {
    var _this = this
    _this.name = name

    function init (name) {
        return function Log (msg) {
            if (arguments.length > 1){
                var newMsg = ""
                for (var i = 0; i < arguments.length; i++) {
                    newMsg += arguments[i] +", "
                };
                msg = newMsg
            }
            var date = new Date().toJSON().substring(0, 19).replace('T', ' ');
            console.log(date + " {" + _this.name + "} >> " + msg)
        };
    }
    return init(_this.name)
}


// https://dreaminginjavascript.wordpress.com/2008/08/22/eliminating-duplicates/

exports.containsDuplicate = function(arr) {
  var i,
      len=arr.length,
      out=[],
      obj={};

  for (i=0;i<len;i++) {
    obj[arr[i]]=0;
  }
  for (i in obj) {
    out.push(i);
  }
  return out.length == arr.length? false: true;
}
