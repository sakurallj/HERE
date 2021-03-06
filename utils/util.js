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
function getRandomKey(len) {
  var chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789", charsLength = chars.length;
  var rtn = "";
  for (var x = 0; x < len; x++) {
    var i = Math.floor(Math.random() * charsLength);
    rtn += chars.charAt(i);
  }
  return rtn;
}
/**
 * utf8 解码
 */
function decodeUTF8(str) {
  return str.replace(/(\\u)(\w{4}|\w{2})/gi, function ($0, $1, $2) {
    return String.fromCharCode(parseInt($2, 16));
  });
}
/**
 * 获得ascll字符的个数
 */
function getAscllLength(str) {
  if (/[a-zA-Z0-9\$\`\!\@\#\$\%\^\&\*\(\)\-\+\=\|\:\;\"\'\,\.\/\?\>\<]/i.test(str)) {
    return str.match(/[a-zA-Z0-9\$\`\!\@\#\$\%\^\&\*\(\)\-\+\=\|\:\;\"\'\,\.\/\?\>\<]/ig).length;
  }
  return 0;
}
function formatShowTimeText(second) {
  var nT = new Date(), nY = nT.getFullYear(), nM = nT.getMonth()
    , nD = nT.getDay(), nH = nT.getHours(), nm = nT.getMinutes();
  var t = new Date(second * 1000), Y = t.getFullYear(), M = t.getMonth()
    , D = t.getDay(), H = t.getHours(), m = t.getMinutes();
  if (nY != Y || nM != M || nD != D) {
    return "1天前";
  }
  else {
    var t = new Date(second * 1000);
   
    return H + ":" + m;
  }
}
/**
 * 把content format 成不敏感的 主要是替换特殊字符
 */
function formatContentForServer(content) {
  return content.replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\~/g, "%7E")
    .replace(/\!/g, "%21").replace(/\*/g, "%2A").replace(/\'/g, "%27");
}

/**
 * 去掉前后的空格
 */
function trim(str) {
  return str.replace(/(^\s*)|(\s*$)/g, "");
}
/**
 * 判断是不是中文  
 */
function isChinese(str) {  //
  var reCh = /[u00-uff]/;
  return !reCh.test(str);
}
/**
 * 获得文本长度
 */
function textLength(str) {
  var strlen = 0, len = str.length, txtval = trim(str);
  for (var i = 0; i < len; i++) {
    if (isChinese(txtval.charAt(i)) == true) {
      strlen = strlen + 1;//中文为1个字符  
    } else {
      strlen = strlen + 0.5;//英文0.5个字符  
    }
  }
  return strlen;
}
/**
 * 截取文本
 */
function formatShowText(str, sLen) {
  if (sLen == 0) {
    return "...";
  }
  var showStr = "", len = str.length, strlen = 0, sLen = sLen ? sLen : 29;
  var txtval = trim(str);
  for (var i = 0; i < len; i++) {
    if (isChinese(txtval.charAt(i)) == true) {
      strlen = strlen + 1;//中文为1个字符  
    } else {
      strlen = strlen + 0.5;//英文0.5个字符  
    }
    if (strlen > sLen) {
      return str.substring(0, i) + "...";
    }
  }
  return str;
}
/**
 * 获得note的展示高度
 */
function getNoteHeight(note){
  var height = 0,textHeight=0;
  //计算文本高度
  if (note.content) {
      var rawLen = note.content ? note.content.length : 0
        , ascllLen = getAscllLength(note.content) ;
      var trueLen = rawLen - ascllLen + Math.ceil(ascllLen / 2);
      var line = Math.ceil((trueLen * 28) / 304);
      line = line > 3 ? 3 : line;
      textHeight = line * 50;
    }
  //计算图片及基本高度
  if (note.ispartner == 1) {
      height += 390;//商家的高度 
  }
  else {
    if (note.photo) {
      height += 150;//图片高度
    }
    height += textHeight + 119;//119为item最小高度 textHeight为文字高度
  }
  return height;
}
/**
 * 分割notes成两列
 */
function separateNotes(that, app, data, isRefresh) {
  console.log("data");
  console.log(data);
  var length = data.length,
    coloums1Heigth = isRefresh ? 0 : that.data.notes.coloums1Heigth,
    coloums2Heigth = isRefresh ? 0 : that.data.notes.coloums2Heigth,
    coloums1 = isRefresh ? [] : that.data.notes.coloums1,
    coloums2 = isRefresh ? [] : that.data.notes.coloums2;
  for (var i = 0; i < length; i++) {
    var note = data[i];
    if (note.content && note.content.indexOf("\\u") >= 0) {
      note.content = decodeUTF8(note.content);
    }
    var noteHeight = 0;
    //计算行数 文本高度 及 截取文本
    if (note.content) {
  
      note.content = formatShowText(note.content);
    }
    if(note.address=="请选择位置"){
      note.address = "";
    }
    if(note.address){
      note.addressLength = textLength(note.address);
    }
    note.addressSpace = [];
    if(note.addressLength<11){
      var aFL = 10-note.addressLength;
      for(var aL =0;aL<=aFL;aL++){
        note.addressSpace[aL] = aL;
      }
    }
    
    noteHeight = getNoteHeight(note);
    //处理分词的文本
    if (note.contentar) {
      var contentar = note.contentar, contentarLen = contentar.length, tmpContent = "", tmpContentLength = 0;
      for (var tI = 0; tI < contentarLen; tI++) {
        var tmpLength = textLength(contentar[tI].word);
        if (tmpContentLength + tmpLength > 25) {
          var sLen = 25 - tmpContentLength;
          contentar[tI].word = formatShowText(contentar[tI].word, sLen);
          note.contentar = contentar.splice(0, tI + 1);
          break;
        }
        tmpContentLength += tmpLength;
      }
    }
    //没有文本则不展示 出 商家外
    if (!note.content && note.ispartner != 1) {
      continue;
    }
    note.fdName = note.fdName ? note.fdName : "";
    note.nickName = note.nickName ? note.nickName : "";
    note.avatar = note.avatar ? note.avatar : app.globalData.defaultHeader;
    note.isPhotoLoaded = false;
    note.isShow = true;
    note.rawNotesIndex = i;
    //处理距离

    if (coloums1Heigth <= coloums2Heigth) {
      note.itemIndex = coloums1.length;
      note.coloumsIndex = 1;
      coloums1.push(note);
      coloums1Heigth += noteHeight ; 
    }
    else {
      note.itemIndex = coloums2.length;
      note.coloumsIndex = 2;
      coloums2.push(note);
      coloums2Heigth += noteHeight ; 
    }
  }
  var notes = {
    coloums1: coloums1,
    coloums2: coloums2,
    coloums1Heigth: coloums1Heigth,//列高
    coloums2Heigth: coloums2Heigth//列高
  };
   
  return notes;
}
/**
 * 添加纸条到 column
 */
function addNoteToColumn(that, app, note){
  if(note.address=="请选择位置"){
    note.address = "";
  }
  if(note.address){
    note.addressLength = textLength(note.address);
  }
  note.addressSpace = [];
  if(note.addressLength<11){
    var aFL = 10-note.addressLength;
    for(var aL =0;aL<=aFL;aL++){
      note.addressSpace[aL] = aL;
    }
  }
  var  notes = that.data.notes,cNote = [note],  noteHeight = getNoteHeight(note);
  Array.prototype.push.apply(cNote, notes.coloums1);
  notes.coloums1 = cNote;
  notes.coloums1Heigth += noteHeight ; 
  /*
  if(notes.coloums1Heigth<=notes.coloums2Heigth){
    Array.prototype.push.apply(cNote, notes.coloums1);
    notes.coloums1 = cNote;
    notes.coloums1Heigth += noteHeight ; 
  }
  else{
    Array.prototype.push.apply(cNote, notes.coloums2);
    notes.coloums2 = cNote;
    notes.coloums2Heigth += noteHeight ; 
  }*/
  return notes;
}
/**
 * 判断是不是空的对象 {}  new Object()
 */
function isEmptyObject(obj) {
  for (var key in obj) {
    return false;
  };
  return true;
}
/**
 * 处理 notes  图片 加载
 */
function notesPhotoLoaded(that, app, event) {
  var coloumsIndex = app.getValueFormCurrentTargetDataSet(event, "coloumsIndex"),
    itemIndex = app.getValueFormCurrentTargetDataSet(event, "itemIndex"),
    notes = that.data.notes;
  if (coloumsIndex == 1) {
    if (notes.coloums1[itemIndex]) {
      notes.coloums1[itemIndex].isPhotoLoaded = true;
      that.setData({
        notes: notes
      });
    }
  }
  else {
    if (notes.coloums2[itemIndex]) {
      notes.coloums2[itemIndex].isPhotoLoaded = true;
      that.setData({
        notes: notes
      });
    }
  }
}
function notesHeaderLoaded(that, app, event){
  var coloumsIndex = app.getValueFormCurrentTargetDataSet(event, "coloumsIndex"),
    itemIndex = app.getValueFormCurrentTargetDataSet(event, "itemIndex"),notes = that.data.notes;
  if (coloumsIndex == 1) {
    if (notes.coloums1[itemIndex]) {
      notes.coloums1[itemIndex].isHeaderLoaded = true;
      that.setData({
        notes: notes
      });
    }
  }
  else {
    if (notes.coloums2[itemIndex]) {
      notes.coloums2[itemIndex].isHeaderLoaded = true;
      that.setData({
        notes: notes
      });
    }
  }
}
function updateNoteRespNum(that,coloumsIndex,itemIndex,rawNotesIndex,num){
  var notes = that.data.notes,rawNotes= that.data.rawNotes;
  if(rawNotes[rawNotesIndex]){
    rawNotes[rawNotesIndex].commentnum+= num;
  }
  if (coloumsIndex == 1) {
    if (notes.coloums1[itemIndex]) {
      notes.coloums1[itemIndex].commentnum+= num;
      that.setData({
        notes: notes,
        rawNotes:rawNotes
      });
    }
  }
  else {
    if (notes.coloums2[itemIndex]) {
      notes.coloums2[itemIndex].commentnum+= num;
      that.setData({
        notes: notes,
        rawNotes:rawNotes
      });
    }
  }
}
function toRad(d) { 
  return d * Math.PI / 180; 
}
/**
 * 获得两点间的距离
 */
function getPonitToPointDistance(lat1, lng1, lat2, lng2) {
  var dis = 0;
  var radLat1 = toRad(lat1);
  var radLat2 = toRad(lat2);
  var deltaLat = radLat1 - radLat2;
  var deltaLng = toRad(lng1) - toRad(lng2);
  var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
  return dis * 6378137;
}
 
function formatDistance(distance) {
  if (distance < 1000) {
    return distance + "m";
  }
  else if (distance < 10000) {
    return parseInt(distance / 1000) + "km";
  }
  else {
    return "...";
  }
}
/**
 * 转义正则表达式敏感的字符
 */
function formatReg(str){
  return str.replace(/(\(-'"|\[|\{|\\|\^|\$|\||\)|\?|\*|\+|\.|\]|\})/g,'\\$1');
}
/**
 *获得 敏感词
 */
function geBadWords(app,callback){
  var badWords = app.globalData.badWords;
  if(badWords.length>0){
    if(typeof callback == "function")callback({data:badWords,code:0});
  }
  else{
    badWords = [];
    wx.request({
      url:app.globalData.url.api.getBadWords,
      method:"GET",
      fail:function(res){
        console.log(res);
        if(typeof callback == "function")callback({data:[],code:1});
      },
      success: function(res) {
        console.log(res);
        if(res.data.errcode==0){
          var data = res.data.data ,length=data.length;
          for(var i=0;i<length;i++){
            var ws = data[i].fdFilter,wLength = ws.length;
            if(wLength){
              for(var j=0;j<wLength;j++){
                var w = formatReg(ws[j]);
                if(!w){
                  continue;
                }
                if( j==0){
                  badWords[i]={
                    id:data[i].id,
                    str:w
                  }
                }
                else{
                  badWords[i].str+="|"+w;
                }
              }
            }
          }
        }
        if(typeof callback == "function")callback({data:badWords,code:0});
      }
    });
  }
}
/**
 * 判断是否有敏感词
 */
function hasBadWord(app,content,callback){
  geBadWords(app,function(res){
    if(res.code==0){
      var data = res.data,length=data.length,isBad=[];
      for(var i=0;i<length;i++){
        if(!data[i].str){
          continue;
        }
        console.log(i);
        console.log(data[i]);

        var pattern = new RegExp(data[i].str,"g");
        if(pattern.test(content)){//包含
          isBad[data[i].id] = true;           
        }else{//不包含
            isBad[data[i].id] = false;    
        }
      }//for(var i=0;i<length;i++)
      console.log(isBad);
      if(isBad[1]||isBad[4]){
        if(typeof callback == "function")callback({msg:"包含政治、民族安全 包含黄赌毒枪支弹药",code:-10002});
        return;
      }
      else{
        var bLen = isBad.length;
        for(var j=0;j<bLen;j++){
          if(isBad[j]){
            if(typeof callback == "function")callback({msg:"包含敏感词",code:-10001});
            return;
          }
        }
        if(typeof callback == "function")callback({msg:"",code:0});
        return;
      }
    }
    else{
      if(typeof callback == "function")callback({msg:"获得敏感词失败",code:1});
      return;
    }
  });
}
module.exports = {
  formatTime: formatTime,
  getRandomKey: getRandomKey,
  decodeUTF8: decodeUTF8,
  getAscllLength: getAscllLength,
  formatShowTimeText: formatShowTimeText,
  formatContentForServer: formatContentForServer,
  trim: trim,
  separateNotes: separateNotes,
  isEmptyObject: isEmptyObject,
  notesPhotoLoaded: notesPhotoLoaded,
  getPonitToPointDistance: getPonitToPointDistance,
  formatDistance: formatDistance,
  addNoteToColumn:addNoteToColumn,
  notesHeaderLoaded:notesHeaderLoaded,
  updateNoteRespNum:updateNoteRespNum,
  geBadWords:geBadWords,
  hasBadWord:hasBadWord
}
