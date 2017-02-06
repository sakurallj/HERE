//app.js
var util = require('/utils/util.js');
var md5 = require('/utils/MD5.js');
var apiDomain = "https://note900.com";
App({
  onLaunch: function () {
  },
  util:util,//注入工具类
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null,
    url:{
      api:{
        infoDetail:apiDomain+"/noteapi/infodetail",//纸条详情
        noteList:apiDomain+"/noteapi/infolist"//纸条列表
      }
    }
  },
  //获得当前点击元素的dataset value by key
  getValueFormCurrentTargetDataSet:function(event,key){
    if(event.currentTarget&&event.currentTarget.dataset ){
      return  event.currentTarget.dataset[key];
    }
    else{
      return null;
    }
  },
  //把数组转换为  key=value&key1=value1...
  buildQuery:function(query){
    var str = "",i=0;
    for(var k in query){
      if(i=0){
        str+=k+"="+query["k"];
      }
      else{
        str+="&"+k+"="+query["k"];
      }
    }
    return str;
  },
  //获得接口签名
  getAPISign:function(params){
    var pos = parseInt(Math.random()*31)+1;
    var key = util.getRandomKey(6);
    var query = "",i=0;
    //first
    for(var pKey in params){
      if(i==0){
        query+=pKey+"="+params[pKey];
      }
      else{
        query+="&"+pKey+"="+params[pKey];
      }
      i++;
    }
    //second
    var b=query.substring(0,pos),e=query.substring(pos,query.length);
    query = b+key+e;
    query = md5.md5(query);
    return {
      sign:query,
      pos:pos,
      key:key
    };
  } 
})