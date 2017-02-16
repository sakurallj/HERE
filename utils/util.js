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
function formatShowTimeText(second){
    var nT = new Date(),nY = nT.getFullYear(),nM = nT.getMonth()
    ,nD = nT.getDay(),nH = nT.getHours(),nm = nT.getMinutes();
    var t = new Date(second*1000),Y = t.getFullYear(),M = t.getMonth()
    ,D = t.getDay(),H = t.getHours(),m = t.getMinutes();
    if(nY!=Y||nM!=M||nD!=D){
        return "1天前";
    }
    else{
        var t = new Date(second*1000);
        console.log(t);
        return H+":"+m;
    }
}
/**
 * 把content format 成不敏感的 主要是替换特殊字符
 */
function formatContentForServer(content){
    return content.replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\~/g, "%7E")
    .replace(/\!/g, "%21").replace(/\*/g, "%2A").replace(/\'/g, "%27");
}

/**
 * 去掉前后的空格
 */
function trim(str)
{ 
    return str.replace(/(^\s*)|(\s*$)/g, ""); 
}
/**
 * 判断是不是中文  
 */
function isChinese(str){  //
    var reCh=/[u00-uff]/;  
    return !reCh.test(str);  
}  
/**
 * 判断文本长度
 */
function formatShowText(str){  
    var showStr="",len=str.length,strlen=0;  
    var txtval =  trim(str);  
    for(var i=0;i<len;i++){  
     if(isChinese(txtval.charAt(i))==true){  
      strlen=strlen+1;//中文为1个字符  
     }else{  
      strlen=strlen+0.5;//英文0.5个字符  
     } 
     if(strlen>29){
       return str.substring(0,i)+"...";
     } 
    }  
}  
/**
 * 分割notes成两列
 */
function separateNotes(that,app,data,isRefresh){
  console.log(isRefresh);
  var length = data.length,
  coloums1Heigth=isRefresh?0:that.data.notes.coloums1Heigth,
  coloums2Heigth=isRefresh?0:that.data.notes.coloums2Heigth,
  coloums1=isRefresh?[]:that.data.notes.coloums1,
  coloums2=isRefresh?[]:that.data.notes.coloums2;           
  for(var i=0;i<length;i++){
    //note 结构
    //"id": "195", 
    //"content": "116", 
    //"longitude": "113.260572", 
    //"latitude": "23.135633", 
    //"addTime": "1486307788", 
    //"fdNoteOpenID": "5717368126", 
    //"nickName": "9527", 
    //"avatar": "http://900here.com/var/uploads/upload/1486092461_36567.jpg",
    //"photo": null, 
    //"commentnum": "0"
    var note = data[i];
    if(note.content&&note.content.indexOf("\\u")>=0){
        note.content = app.util.decodeUTF8(note.content);
    }
    var textHeight = 0;
    if(note.content){
      var rawLen = note.content?note.content.length:0
        ,ascllLen = app.util.getAscllLength(note.content);
      var trueLen = rawLen-ascllLen+Math.ceil(ascllLen/2);
      var line = Math.ceil((trueLen*28)/304);
      if(line>3){
        note.content = formatShowText(note.content);
        console.log(note.content);
      }
      line=line>3?3:line;
      textHeight = line*44;
    }
    if(!note.content&&note.ispartner!=1){
      continue;
    }
    note.fdName = note.fdName ?note.fdName :"";
    note.nickName = note.nickName ?note.nickName :"";
    note.avatar = note.avatar ?note.avatar :app.globalData.defaultHeader;
    note.isPhotoLoaded = false;
    
    if(coloums1Heigth<=coloums2Heigth){
      note.itemIndex = coloums1.length;
      note.coloumsIndex =  1;
      coloums1.push(note);
      if(note.ispartner==1){
        coloums1Heigth += 360;//商家的高度 
      }
      else{
        if(note.photo){
          coloums1Heigth+=150;//图片高度
        }
        coloums1Heigth+= textHeight+119;//119为item最小高度 textHeight为文字高度
      }
      
    }
    else{
      note.itemIndex = coloums2.length;
      note.coloumsIndex =  2;
      coloums2.push(note);
      if(note.ispartner==1){
        coloums2Heigth += 360;//商家的高度 
      }
      else{
        if(note.photo){
          coloums2Heigth+=150;//图片高度
        }
        coloums2Heigth+= textHeight+119;//119为item最小高度 textHeight为文字高度
      }
    }
    console.log(coloums1Heigth+">>"+coloums2Heigth);
  }
  return {
    coloums1:coloums1,
    coloums2:coloums2,
    coloums1Heigth:coloums1Heigth,//列高
    coloums2Heigth:coloums2Heigth//列高
  };
}
/**
 * 判断是不是空的对象 {}  new Object()
 */
function isEmptyObject(obj){
  for(var key in obj){
     return false;
   };
   return true;
}
/**
 * 处理 notes  图片 加载
 */
function notesPhotoLoaded(that,app,event){
  var coloumsIndex = app.getValueFormCurrentTargetDataSet(event,"coloumsIndex"),
      itemIndex = app.getValueFormCurrentTargetDataSet(event,"itemIndex"),
      notes = that.data.notes;
  if(coloumsIndex==1){
    if(notes.coloums1[itemIndex]){
      notes.coloums1[itemIndex].isPhotoLoaded = true;
      that.setData({
        notes:notes
      });
    }
  }
  else{
    if(notes.coloums2[itemIndex]){
      notes.coloums2[itemIndex].isPhotoLoaded = true;
      that.setData({
        notes:notes
      });
    }
  }
}
module.exports = {
  formatTime: formatTime,
  getRandomKey:getRandomKey,
  decodeUTF8:decodeUTF8,
  getAscllLength:getAscllLength,
  formatShowTimeText:formatShowTimeText,
  formatContentForServer:formatContentForServer,
  trim:trim,
  separateNotes:separateNotes,
  isEmptyObject:isEmptyObject,
  notesPhotoLoaded:notesPhotoLoaded
}
