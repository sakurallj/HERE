//app.js
var util = require('/utils/util.js');
var md5 = require('/utils/MD5.js');
var apiDomain = "https://note900.com";
/**
 * 登录服务器
 * 返回 Promise 
 */
function loginForServer(app,userInfo){
  return new Promise(function(resolve, reject) {
    var data={
      openid:app.globalData.userOpenId,
      sitefrom:"weixin",
      nickname:userInfo.nickName,
      gtcid:"",
      from:"miniApp",
      version:app.globalData.appVersion,
      mac:"",
      profile:userInfo.avatarUrl    
    }, data = app.getAPISign(data);
    wx.request({
      url:app.globalData.url.api.ologin,
      method:"GET",
      data:data,
      fail:function(res){
        reject(res);
      },
      success: function(res) {
        console.log(res);
        app.globalData.userToken = res.data.token;
        resolve(res);
      }
    });
  });
}
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
    //userInfo.gender  性别 0：未知、1：男、2：女 
    userInfo:{},
    userOpenId:"",
    userToken:"",
    location:{},
    appVersion:"0.0.1",//本小程序版本
    url:{
      api:{
        responInfo:apiDomain+"/noteapi/responinfo",//回复纸条
        resp:apiDomain+"/noteapi/getresponlist",//回复列表
        notice:apiDomain+"/noticeapi/gettrendlist",//通知动态列表
        uploadImage:apiDomain+"/noteapi/uploadpic",//上传图片
        addNote:apiDomain+"/noteapi/addinfo",//添加纸条
        ologin:apiDomain+"/memberapi/ologin",//微信qq微博登录
        codeToSessionKey:apiDomain+"/wx/index",//code 换取 session_key  params:code
        infoDetail:apiDomain+"/noteapi/infodetail",//纸条详情
        noteList:apiDomain+"/noteapi/infolist"//纸条列表
      }
    },
    confirmColor:"#a98b59",//确定按钮文字颜色
    noticePageSize:20//通知页每次加载数据的条数
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
    var query = "",i=0,rtn=[];
    //first
    for(var pKey in params){
      if(i==0){
        query+=pKey+"="+params[pKey];
      }
      else{
        query+="&"+pKey+"="+params[pKey];
      }
      rtn[pKey] = params[pKey];
      i++;
    }
    query = md5.md5(encodeURIComponent(query));
    //second
    var b=query.substring(0,pos),e=query.substring(pos,query.length);
    query = b+key+e;
    query = md5.md5(query);
    rtn["sign"] = query;
    rtn["pos"] = pos;
    rtn["key"] = key;
    return rtn;
  },
  /**
   * 获得地理位置
   */
  getLocation:function(callback){
    var that = this;
    //如果没有获取过或者离上次的获取时间超过十分钟则重新获取
    if(!that.globalData.location||!that.globalData.location.getTime||that.globalData.location.getTime+10*60*1000<new Date().getTime()){
      wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        var speed = res.speed;
        var accuracy = res.accuracy;
        res.getTime = new Date().getTime();
        that.globalData.location = res;
        if(typeof callback == "function")callback(that.globalData.location);
      }
    });      
    }
    else{
      if(typeof callback == "function")callback(that.globalData.location);
    }
  },
  //登录
  doLogin:function(callback){
    var that = this;
    //判断是否有token
    if(that.globalData.userToken){
      if(typeof callback == "function")callback(that.globalData.userToken);
    }
    //判断是否有openid
    else if(that.globalData.userOpenId){
      //重新向服务器登录
      loginForServer(that,that.globalData.userInfo).then(function(res){
        console.log(res);
        if(typeof callback == "function")callback(that.globalData.userToken);
      },function(res){});
    }
    else{
      //先微信登录在登录服务器
      wx.login({
        success: function (res) {
          console.log(res);
          //获得openid session_key
          wx.request({
            url:that.globalData.url.api.codeToSessionKey,
            method:"GET",
            data:{
              code:res.code
            },
            fail:function(res){
              console.log(res);
            },
            success: function(res) {
              console.log(res);
              that.globalData.userOpenId = res.data.openid;
              //获得用户信息
              wx.getUserInfo({
                success: function (res) {
                  that.globalData.userInfo = res.userInfo;
                  console.log(res);
                  //登录服务器
                  loginForServer(that,res.userInfo).then(function(res){
                    console.log(res);
                    if(typeof callback == "function")callback(that.globalData.userToken);
                  },function(res){console.log(res);});
                }
              });
            }
          });
        
        }
      });
    }
  }
});