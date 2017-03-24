// pages/person/my/my.js
var app = getApp();
Page({
  data: {
    app: app
  },
  onLoad: function (options) {
    var that = this;
    app.doLogin(function (res) {
      console.log(res);
      that.setData({
        userInfo: {
          nickName: app.globalData.userInfo.nickName,
          avatarUrl: app.globalData.userInfo.avatarUrl ? app.globalData.userInfo.avatarUrl : app.globalData.defaultHeader,
          sOpenId: app.globalData.userServerOpenId
        }
      });
      
    });
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    var that = this;
    app.doLogin(function (res) {
       //获得消息
      var data = {
        page: 1,
        wxapp: 1,
        token: res
      }, data = app.getAPISign(data);
      wx.request({
        url: app.globalData.url.api.notice,
        method: "GET",
        data: data,
        fail: function (res) {
          console.log(res);
        },
        success: function (res) {

          that.setData({
            haveNewMessage: res.data.unread > 0
          });
        }
      });
    });
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})