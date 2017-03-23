// pages/shop/detail/detail.js
var app = getApp();

function loadNotes(that, callback) {

  that.pageNum += 1;
  var data = {
    page: that.pageNum,
    partnerid: that.data.shop.id,
    wxapp: 1
    , address: app.getStreetFromBMapSyc()
  };
  if (app.globalData.userToken) {
    data.token = app.globalData.userToken;
  }
  data = app.getAPISign(data)
  //获得首页数据
  wx.request({
    url: app.globalData.url.api.pInfoList,
    method: "GET",
    data: data,
    header: {
      'content-type': 'application/json'
    },
    fail: function (res) {
      console.log("fail");
      console.log(res);
      wx.hideToast();
    },
    success: function (res) {
      console.log("success");
      console.log(res);
      if (res.data.errcode == 0) {
        var isLoadEmpty = res.data.data.length == 0;
        var notes = app.util.separateNotes(that, app, res.data.data, that.isRefresh), rawNotes = that.data.rawNotes;

        if (that.isRefresh) {
          rawNotes = res.data.data;
        }
        else {
          Array.prototype.push.apply(rawNotes, res.data.data);
        }
        that.setData({
          notes: notes,
          rawNotes: rawNotes,
          isLoadEmpty: isLoadEmpty,
          hasMore: res.data.more && res.data.more == 1
        });
      }
      else {
        that.setData({
          isDeleted: true
        });
      }
      wx.hideToast();
      wx.hideNavigationBarLoading();
      if (typeof callback == "function") callback(res);
    }
  });

}
Page({
  data: {
    notes: {
      coloums1: [],
      coloums2: [],
      coloums1Heigth: 0,//列高
      coloums2Heigth: 0//列高
    },
    shop: {
      name: "",
      image: "",
      id: ""
    },
    isShowFace: false,//是否展示商家背景图
    isFirstLoadEmpty: false,
    isLoadEmpty: false,
    hasMore: false,
    rawNotes: [],
    svColumnHeight: 0,
    haveNewMessage: false,
    isShowLoadMore: false,
    haveNetwork: true,
    onLoadOptions: {},
    isClickItem: false//防止重复点击纸条 导致跳转纸条详情页多次
  },
  isRefresh: false,
  pageNum: 0,
  onLoad: function (options) {
    console.log("onLoad");
    this.pageNum = 0;
    wx.showNavigationBarLoading();
    var that = this;
    //清楚残余的上次发表的纸条
    wx.removeStorageSync('comment_edit_message');
    wx.removeStorageSync('comment_pdetail_srnum');

    var shop = this.data.shop;
    shop.name = options.name;
    shop.image = options.image;
    shop.id = options.id;


    this.setData({
      shop: shop
    });

    this.setData({
      onLoadOptions: options
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
    console.log("onLoad");
    app.doLogin(function () {
      //获得消息
      var data = {
        page: 1,
        token: app.globalData.userToken
      }, data = app.getAPISign(data);
      wx.request({
        url: app.globalData.url.api.notice,
        method: "GET",
        data: data,
        fail: function (res) {
          console.log("doLogin");
          console.log(res);
        },
        success: function (res) {
          console.log("doLogin1");
          that.setData({
            haveNewMessage: res.data.unread > 0
          });
          loadNotes(that, function (res) {
            var partner = res.data.partner;
            if (partner) {
              var shop = {
                address: partner.address,
                name: partner.fdName,
                image: partner.fdLogo,
                id: options.id,
                face: partner.fdFace
              };
              that.setData({
                isFavorite: partner.isFavorite == 1,
                shop: shop
              });
            }
            that.setData({
              isFirstLoadEmpty: res.data.data && res.data.data.length == 0
            });
          });
        }
      });

    });
  },
  onReady: function () {
    // 页面渲染完成
    var sy = wx.getSystemInfoSync();

    var svColumnHeight = (750 / sy.windowWidth) * sy.windowHeight - 90;
    this.setData({
      svColumnHeight: svColumnHeight
    });
  },
  onShow: function () {
    var that = this;
    this.setData({
      isClickItem: false
    });
    if (app.globalData.userToken) {
      //获得消息
      var data = {
        page: 1,
        token: app.globalData.userToken
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
    }
    var res = wx.getStorageSync('comment_edit_message');
    console.log("resresresresres");
    console.log(res);
    if (res) {
      var images = res.imageUrls ? JSON.parse(res.imageUrls) : [], note = {
        addTime: "",
        address: res.address,
        avatar: app.globalData.userInfo.avatarUrl,
        commentnum: "0",
        content: res.content,
        contentar: res.contentar,
        fdNoteOpenID: "",
        id: res.id,
        latitude: app.globalData.location.latitude,
        longitude: app.globalData.location.longitude,
        meter: res.meter,
        nickName: app.globalData.userInfo.nickName,
        photo: images.length > 0 ? images[0] : ""
      };
      var rawNotes = this.data.rawNotes, rawNotes1 = [note];
      Array.prototype.push.apply(rawNotes1, rawNotes);
      console.log("rawNotes1");
      console.log(rawNotes1);
      var notes = app.util.separateNotes(that, app, rawNotes1, true);
      console.log("notes");
      console.log(notes);
      this.setData({
        notes: notes,
        rawNotes: rawNotes1
      });
    }
    //清空msg缓存
    wx.removeStorageSync('comment_edit_message');

    //更新纸条的回应数
    var sendRespNum = wx.getStorageSync('comment_pdetail_srnum');
    console.log("sendRespNum");
    console.log(sendRespNum);
    if (sendRespNum && sendRespNum.num > 0) {
      app.util.updateNoteRespNum(this, sendRespNum.coloumsIndex, sendRespNum.itemIndex, sendRespNum.rawNotesIndex, sendRespNum.num);
    }

    wx.removeStorageSync('comment_pdetail_srnum');
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  previewEnvImages: function (event) {
    var index = app.getValueFormCurrentTargetDataSet(event, "envImgIndex");
    wx.previewImage({
      current: this.data.images[index] ? this.data.images[index] : "", // 当前显示图片的http链接
      urls: this.data.images // 需要预览的图片http链接列表
    });
  },
  gotoMap: function () {
    wx.navigateTo({
      url: '/pages/shop/map/map?shop=' + JSON.stringify(this.data.shop)
    });
  },
  callPhone: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.shop.phone
    });
  },
  clickEdit: function () {
    if (this.data.isDeleted) {
      return;
    }
    wx.navigateTo({
      url: '/pages/comment/edit/edit?shopId=' + this.data.shop.id
    });
  },
  clickItem: function (event) {
    if (this.data.isClickItem) {
      return;
    }
    if (event.currentTarget && event.currentTarget.dataset && event.currentTarget.dataset.type) {
      var item = app.getValueFormCurrentTargetDataSet(event, "item");
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 10000
      });
      this.setData({
        isClickItem: true
      });
      wx.navigateTo({
        url: '/pages/comment/pdetail/pdetail?id=' + item.id + '&meter=' + item.meter + '&itemIndex=' + item.itemIndex + '&coloumsIndex=' + item.coloumsIndex + '&rawNotesIndex=' + item.rawNotesIndex
      });
    }
    else {
      wx.navigateTo({
        url: '/pages/comment/pdetail/pdetail'
      });
    }
  },
  scrollToLower: function () {
    if (this.data.hasMore) {
      loadNotes(this);
    }
  },
  onPullDownRefresh: function () {
    this.isRefresh = true;
    this.pageNum = 0;

    var that = this;
    wx.showNavigationBarLoading();
    //获得用户信息
    //调用登录接口
    app.doLogin(function () {
      loadNotes(that, function (res) {
        var partner = res.data.partner, shop = that.data.shop;
        if (partner) {
          var shop = {
            address: partner.address,
            name: partner.fdName,
            image: partner.fdLogo,
            id: shop.id,
            face: partner.fdFace
          };
          that.setData({
            isFavorite: partner.isFavorite == 1,
            shop: shop
          });
        }
        that.isRefresh = false;
        wx.stopPullDownRefresh();
      });
    });

  },
  onReachBottom: function () {
    if (!this.data.isLoadEmpty) {
      loadNotes(this);
    }
  },
  clickWarn: function () {
    wx.navigateTo({
      url: '/pages/message/message'
    });
  },
  loaded: function (event) {
    app.util.notesPhotoLoaded(this, app, event);
  },
  reloadForNotNetwork: function () {
    this.onLoad(this.data.onLoadOptions);
    var that = this;
    //判断是否有网络
    wx.getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        if (res.networkType == "none") {
          app.showCheckNetworld();
        }
        else {
          that.onLoad(that.data.onLoadOptions);
        }
      }
    });
  },
  bindFaceload: function () {
    this.setData({
      isShowFace: true
    });
  },
  loadedHeader: function (event) {
    app.util.notesHeaderLoaded(this, app, event);
  },
  onShareAppMessage: function () {
    var shop = this.data.shop;
    return {
      title: shop.name + '留言墙',
      path: 'pages/shop/detail/detail?id=' + shop.id + "&image=" + shop.image + "&name=" + shop.name
    }
  },
  clickHelp: function () {
    wx.navigateTo({
      url: '/pages/shop/help/help'
    });
  },
  doFavorite: function () {
    var that = this;
    app.doLogin(function (res) {
      console.log(res);
      var data = {
        token: app.globalData.userToken,
        id: that.data.shop.id
      }, data = app.getAPISign(data)
      //获得首页数据
      wx.request({
        url: app.globalData.url.api.addFavPartner,
        method: "GET",
        data: data,
        header: {
          'content-type': 'application/json'
        },
        fail: function (res) {
          console.log("fail");
          console.log(res);
          wx.hideToast();
        },
        success: function (res) {
          console.log("success");
          console.log(res);
          if (res.data) {
            if (res.data.errcode == 0 || res.data.errcode == 4) {
              wx.showToast({
                title: '收藏成功',
                icon: 'success',
                duration: 2000
              });
              that.setData({
                isFavorite: true
              });
            }
            else {
              wx.showModal({
                title: '',
                content: '收藏失败，请重试',
                showCancel: false,
                confirmText: "我知道了",
                confirmColor: app.globalData.confirmColor,
                success: function (res) { }
              });
            }
          }

        }
      });
    });
  },
  doCancelFavorite:function(){
    var that = this;
    app.doLogin(function (res) {
      console.log(res);
      var data = {
        token: app.globalData.userToken,
        id: that.data.shop.id
      }, data = app.getAPISign(data)
      //获得首页数据
      wx.request({
        url: app.globalData.url.api.delFavPartnerByPId,
        method: "GET",
        data: data,
        header: {
          'content-type': 'application/json'
        },
        fail: function (res) {
          console.log("fail");
          console.log(res);
          wx.hideToast();
        },
        success: function (res) {
          console.log("success");
          console.log(res);
          if (res.data) {
            if (res.data.errcode == 0  ) {
              wx.showToast({
                title: '已取消收藏',
                icon: 'success',
                duration: 2000
              });
              that.setData({
                isFavorite: false
              });
            }
            else {
              wx.showModal({
                title: '',
                content: '取消收藏失败，请重试',
                showCancel: false,
                confirmText: "我知道了",
                confirmColor: app.globalData.confirmColor,
                success: function (res) { }
              });
            }
          }

        }
      });
    });
  }
})