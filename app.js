//app.js
var util = require('/utils/util.js');
var md5 = require('/utils/MD5.js');
var bMap = require('/pages/lib/baidu/bmap-wx.min.js');
var apiDomain = "https://api.900here.com";
/**
 * 登录服务器
 * 返回 Promise 
 */
function loginForServer(app, userInfo, callback) {
  var data = {
    openid: app.globalData.userOpenId,
    sitefrom: "weixin",
    nickname: userInfo.nickName,
    gtcid: "",
    from: "miniApp",
    version: app.globalData.appVersion,
    mac: "",
    profile: userInfo.avatarUrl
  }, data = app.getAPISign(data);
  wx.request({
    url: app.globalData.url.api.ologin,
    method: "GET",
    data: data,
    fail: function (res) {
      typeof callback == "function" && callback(res);
    },
    success: function (res) {
      console.log(res);
      app.globalData.userToken = res.data.token;
      app.globalData.userServerOpenId = res.data.data.openid;
      typeof callback == "function" && callback(res);
    }
  });
}
App({

  util: util,//注入工具类
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
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
  globalData: {
    haveNewMessage: false,
    //userInfo.gender  性别 0：未知、1：男、2：女 
    userInfo: {},
    userOpenId: "",//微信的openid
    userServerOpenId: "",//服务器上的openid
    userToken: "",
    location: {},
    bMapLocation: {},//百度地图获得的地址信息
    appVersion: "0.0.1",//本小程序版本
    systemInfo: {},//系统信息
    badWords: {},//敏感词
    bMapLocationName: "",//百度地图的位置名称
    url: {
      api: {
        getBadWords: apiDomain + "/badwordapi/getlist",//敏感词
        setReadMessage: apiDomain + "/noticeapi/settrendstatus",//设置通知动态已读状态
        pInfoList: apiDomain + "/noteapi/pinfolist",//商家纸条列表
        otherInfoList: apiDomain + "/noteapi/otherinfolist",//查看其他用户纸条
        delNote: apiDomain + "/noteapi/delinfo",//删除纸条
        myInfoList: apiDomain + "/noteapi/myinfolist",//我的纸条
        responInfo: apiDomain + "/noteapi/responinfo",//回复纸条
        resp: apiDomain + "/noteapi/getresponlist",//回复列表
        notice: apiDomain + "/noticeapi/gettrendlist",//通知动态列表
        uploadImage: apiDomain + "/noteapi/uploadpic",//上传图片
        addNote: apiDomain + "/noteapi/addinfo",//添加纸条
        ologin: apiDomain + "/memberapi/ologin",//微信qq微博登录
        codeToSessionKey: apiDomain + "/wx/index",//code 换取 session_key  params:code
        infoDetail: apiDomain + "/noteapi/infodetail",//纸条详情
        noteList: apiDomain + "/noteapi/infolist"//纸条列表
      }
    },
    bMapAK: "EG3dC6I07FCQzZH9k4BMVDdl7QPOUlfK",
    defaultHeader: "/pages/images/default-person.png",//默认头像
    confirmColor: "#a98b59",//确定按钮文字颜色
    noticePageSize: 20//通知页每次加载数据的条数
  },
  //获得当前点击元素的dataset value by key
  getValueFormCurrentTargetDataSet: function (event, key) {
    if (event.currentTarget && event.currentTarget.dataset) {
      return event.currentTarget.dataset[key];
    }
    else {
      return null;
    }
  },
  //把数组转换为  key=value&key1=value1...
  buildQuery: function (query) {
    var str = "", i = 0;
    for (var k in query) {
      if (i = 0) {
        str += k + "=" + query["k"];
      }
      else {
        str += "&" + k + "=" + query["k"];
      }
    }
    return str;
  },
  //获得接口签名
  getAPISign: function (params) {
    var pos = parseInt(Math.random() * 31) + 1;
    var key = util.getRandomKey(6);
    var query = "", i = 0, rtn = [];
    //first
    for (var pKey in params) {
      if (i == 0) {
        query += pKey + "=" + params[pKey];
      }
      else {
        query += "&" + pKey + "=" + params[pKey];
      }
      rtn[pKey] = params[pKey];
      i++;
    }
    query = md5.md5(encodeURIComponent(query));
    //second
    var b = query.substring(0, pos), e = query.substring(pos, query.length);
    query = b + key + e;
    query = md5.md5(query);
    rtn["sign"] = query;
    rtn["pos"] = pos;
    rtn["key"] = key;
    return rtn;
  },
  /**
   * 获得地理位置
   */
  getLocation: function (callback) {
    var that = this;
    //如果没有获取过或者离上次的获取时间超过十分钟则重新获取
    if (!that.globalData.location || !that.globalData.location.getTime || that.globalData.location.getTime + 10 * 60 * 1000 < new Date().getTime()) {
      this.getBMapLocation(function (res) {
        var wxMarkerData = res.wxMarkerData;
        that.globalData.location.latitude = wxMarkerData[0].latitude;
        that.globalData.location.longitude = wxMarkerData[0].longitude;
        that.globalData.location.getTime = new Date().getTime();
        console.log("that.globalData.location");
        console.log(that.globalData.location);
        if (typeof callback == "function") callback(that.globalData.location);
      });
    }
    else {
      if (typeof callback == "function") callback(that.globalData.location);
    }
  },
  //登录
  doLogin: function (callback) {
    var that = this;
    //判断是否有token
    if (that.globalData.userToken) {
      if (typeof callback == "function") callback(that.globalData.userToken);
    }
    //判断是否有openid
    else if (that.globalData.userOpenId) {
      //重新向服务器登录
      loginForServer(that, that.globalData.userInfo, function (res) {

        if (typeof callback == "function") callback(that.globalData.userToken);
      });
    }
    else {
      //先微信登录在登录服务器
      wx.login({
        success: function (res) {

          //获得openid session_key
          wx.request({
            url: that.globalData.url.api.codeToSessionKey,
            method: "GET",
            data: {
              code: res.code
            },
            fail: function (res) {
              console.log(res);
            },
            success: function (res) {

              that.globalData.userOpenId = res.data.openid;
              //获得用户信息
              wx.getUserInfo({
                success: function (res) {
                  that.globalData.userInfo = res.userInfo;

                  //登录服务器
                  loginForServer(that, res.userInfo, function (res) {

                    if (typeof callback == "function") callback(that.globalData.userToken);
                  });
                }
              });
            }
          });

        }
      });
    }
  },
  getSystemInfo: function () {
    var systemInfo = this.globalData.systemInfo;
    if (util.isEmptyObject(systemInfo)) {
      systemInfo = wx.getSystemInfoSync();
    }
    return systemInfo;
  },
  /**
   * rpx是px的多少倍   像素单位
   */
  getRpxAsPx: function () {
    var systemInfo = this.getSystemInfo(), rpxAsPx = 0;
    if (systemInfo.windowWidth) {
      rpxAsPx = 750 / systemInfo.windowWidth;
    }
    return rpxAsPx;
  },
  /**
   * rpx to px 像素单位
   */
  rpxToPx: function (rpx, callback) {
    var rpxAsPx = this.getRpxAsPx(0);
    return rpx / rpxAsPx;
  },
  map: new bMap.BMapWX({ ak: "EG3dC6I07FCQzZH9k4BMVDdl7QPOUlfK" }),
  /**
   * 获得百度地图定位
   */
  getBMapLocation: function (callback) {
    var that = this;
    this.map.regeocoding({
      fail: function (res) {
        console.log(res);
        if (typeof callback == "function") callback(res);
      },
      success: function (res) {
        console.log(res);
        that.globalData.bMapLocation = res;
        if (typeof callback == "function") callback(res);
      }
    });
  },
  /**
   * 获得street从百度地图
   */
  getStreetFromBMap: function (callback) {
    var bMapLocation = this.globalData.bMapLocation;
    if (bMapLocation.originalData && bMapLocation.originalData.result && bMapLocation.originalData.result.addressComponent && bMapLocation.originalData.result.addressComponent.street) {
      if (typeof callback == "function") callback(bMapLocation.originalData.result.addressComponent.street);
    }
    else {
      this.getBMapLocation(function (bMapLocation) {
        if (bMapLocation.originalData && bMapLocation.originalData.result && bMapLocation.originalData.result.addressComponent && bMapLocation.originalData.result.addressComponent.street) {
          if (typeof callback == "function") callback(bMapLocation.originalData.result.addressComponent.street);
        }
        else {
          if (typeof callback == "function") callback("");
        }
      });
    }
  },
  /**
  * 获得street从百度地图 同步
  */
  getStreetFromBMapSyc: function () {
    var bMapLocation = this.globalData.bMapLocation;
    if (bMapLocation.originalData && bMapLocation.originalData.result && bMapLocation.originalData.result.addressComponent && bMapLocation.originalData.result.addressComponent.street) {
      return bMapLocation.originalData.result.addressComponent.street;
    }
    else {
      return "";
    }
  },
  getLocationNameFromBMapSyc: function () {
    var bMapLocation = this.globalData.bMapLocation;
    if (bMapLocation.originalData && bMapLocation.originalData.result) {
      var result = bMapLocation.originalData.result, locationName = "";
      if (result.poiRegions && result.poiRegions.length > 0) {
        locationName = result.poiRegions[0].name;
      }
      else if (result.addressComponent && result.addressComponent.street) {
        locationName = result.addressComponent.street;
      }
      return locationName;
    }
    return "";
  },
  onLaunch: function () {

  },
  showCheckNetworld:function(){
    wx.showModal({
      title: '',
      content: '请检查网络',
      showCancel:false,
      confirmColor:this.globalData.confirmColor,
      success: function(res) {
      }
    });
  }
});
