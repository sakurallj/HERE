var app = getApp();
function loadFavorite(that, callback, isAgain) {
  that.pageNum += 1;
  var data = {
    page: that.pageNum
  }, url = app.globalData.url.api.favPartnerList;
  if (that.data.userServerOpenId) {
    data.openid = that.data.userServerOpenId;
    url = app.globalData.url.api.otherFavPartnerList;
  }
  else {
    data.token = app.globalData.userToken;
  }
  data = app.getAPISign(data);

  wx.request({
    url: url,
    method: "GET",
    data: data,
    fail: function (res) {
      console.log(res);
      wx.hideToast();
      wx.hideNavigationBarLoading();
    },
    success: function (res) {
      console.log(res);
      if (res.data && res.data.errcode == 0 && res.data.data) {
        var oldFavorites = that.data.favorites, len = res.data.data.length;
        for (var i = 0; i < len; i++) {
          if (!res.data.data[i].fdDescription) {
            res.data.data[i].fdDescription = "";
          }
          res.data.data[i].isLoaded = false;
          res.data.data[i].fdDescription = app.util.formatShowText(res.data.data[i].fdDescription, 33);
        }
        Array.prototype.push.apply(oldFavorites, res.data.data);
        that.setData({
          favorites: oldFavorites,
          hasMore: res.data.more == 1
        });
        if (typeof callback == "function") callback(res);
      }
      else if (res.data && res.data.errcode == 1002) {//登录过期
        if (!isAgain) {
          app.loginForServer(app, app.globalData.userInfo, function () {
            that.pageNum -= 1;
            loadFavorite(that, callback, true);
          });
        }
        else {
          wx.showModal({
            title: '',
            content: '加载失败，请重试',
            showCancel: false,
            confirmText: "我知道了",
            confirmColor: app.globalData.confirmColor,
            success: function (res) { }
          });
        }
      }

    }

  });
}
Page({
  data: {
    favorites: [],
    haveNetwork: true,
    isFirstLoadEmpty: false
  },
  pageNum: 0,
  onLoad: function (options) {
    if (options.userServerOpenId && options.nickName) {
      wx.setNavigationBarTitle({
        title: options.nickName + '收藏的店家'
      });
    }
    wx.removeStorageSync('shop_detail_cancel_favorite_shop_id');
    this.pageNum = 0;
    var that = this;
    wx.showNavigationBarLoading();
    this.setData({
      onLoadOptions: options,
      favorites: [],
      userServerOpenId: options.userServerOpenId,
      hasMore: false,
      haveNetwork: true,
      isFirstLoadEmpty: false
    });

    //判断是否有网络
    wx.getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        if (res.networkType == "none") {
          that.setData({
            haveNetwork: false
          });
          wx.hideToast();
          wx.hideNavigationBarLoading();
        }
        else {
          that.setData({
            haveNetwork: true
          });
        }
      }
    });
    if (options.userServerOpenId) {
      loadFavorite(that, function (res) {
        if (res.data.errcode == 1 || res.data.data.length == 0) {
          that.setData({
            isFirstLoadEmpty: true
          });
        }
        wx.stopPullDownRefresh();
        wx.hideToast();
        wx.hideNavigationBarLoading();

      });
    }
    else {
      app.doLogin(function (res) {
        if (!app.globalData.userToken) {
          that.setData({
            isNotUserInfo: true
          });
          wx.hideToast();
          wx.hideNavigationBarLoading();
        }
        else {
          loadFavorite(that, function (res) {
            if (res.data.errcode == 1 || res.data.data.length == 0) {
              that.setData({
                isFirstLoadEmpty: true
              });
            }
            wx.stopPullDownRefresh();
            wx.hideToast();
            wx.hideNavigationBarLoading();

          });
        }
      });
    }

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    var cFShopId = wx.getStorageSync('shop_detail_cancel_favorite_shop_id');
    console.log(cFShopId);
    if (cFShopId) {
      var favorites = this.data.favorites, len = favorites.length;
      for (var i = 0; i < len; i++) {
        console.log(favorites[i]);
        if (favorites[i].partnerID == cFShopId) {
          favorites[i].isHide = true;
          break;
        }
      }
      this.setData({
        favorites: favorites
      });
    }
    wx.removeStorageSync('shop_detail_cancel_favorite_shop_id');
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  onPullDownRefresh: function () {

    this.onLoad(this.data.onLoadOptions);
  },
  reloadForNotNetwork: function () {
    this.onPullDownRefresh();
  },
  logoLoaded: function (event) {
    var index = app.getValueFormCurrentTargetDataSet(event, "index"), favorites = this.data.favorites;
    if (favorites[index]) {
      favorites[index].isLoaded = true;
      this.setData({
        favorites: favorites
      });
    }
  },
  onReachBottom: function () {
    wx.showNavigationBarLoading();
    loadFavorite(this, function () {
      wx.hideNavigationBarLoading();
    });
  },
  onShareAppMessage: function () {
    var options = this.data.onLoadOptions;
    console.log('pages/person/favorite/favorite?userServerOpenId=' + app.globalData.userServerOpenId);
    return {
      title: app.globalData.userInfo.nickName + '收藏的店家',
      path: 'pages/person/favorite/favorite?userServerOpenId=' + app.globalData.userServerOpenId + "&nickName=" + app.globalData.userInfo.nickName
    }
  }
})