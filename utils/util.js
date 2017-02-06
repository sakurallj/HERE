function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
/**
 * 获得包含字母和数字的key
 */
function getRandomKey(len){
  var chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789",charsLength = chars.length; 
  var rtn = ""; 
  for(var x=0; x<len; x++) { 
      var i = Math.floor(Math.random() * charsLength); 
      rtn += chars.charAt(i); 
  } 
  return rtn;
}
/**
 * utf8 解码
 */
function decodeUTF8(str){
    return str.replace(/(\\u)(\w{4}|\w{2})/gi, function($0,$1,$2){
        return String.fromCharCode(parseInt($2,16));
    }); 
}
/**
 * 获得ascll字符的个数
 */
function getAscllLength(str){
    if(/[a-zA-Z0-9\$\`\!\@\#\$\%\^\&\*\(\)\-\+\=\|\:\;\"\'\,\.\/\?\>\<]/i.test(str)){
        return str.match(/[a-zA-Z0-9\$\`\!\@\#\$\%\^\&\*\(\)\-\+\=\|\:\;\"\'\,\.\/\?\>\<]/ig).length;
    }
    return 0;
}
module.exports = {
  formatTime: formatTime,
  getRandomKey:getRandomKey,
  decodeUTF8:decodeUTF8,
  getAscllLength:getAscllLength
}
