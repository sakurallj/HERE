// pages/comment/pdetail/pdetail.js
var app = getApp();
/**
 * 获得回应
 */
function getResp(that, callback) {
  that.pageNum += 1;
  var data = {
    id: that.data.id,
    page: that.pageNum
  }, data = app.getAPISign(data);
  wx.request({
    url: app.globalData.url.api.resp,
    method: "GET",
    data: data,
    fail: function (res) {
      console.log(res);
    },
    success: function (res) {

      var messageList = that.data.messageList, currentMessageListIndex = that.data.currentMessageListIndex, message = messageList[currentMessageListIndex];
      if (!message.resp) {
        message.resp = [];
      }
      Array.prototype.push.apply(message.resp, res.data.data);
      message.commentnum = res.data.commentnum;
      messageList[currentMessageListIndex] = message;
      that.setData({
        messageList: messageList
      });
      if (res.data && res.data.more == 1) {
        that.setData({
          isShowLoadMore: true
        });
      }
      else {
        that.setData({
          isShowLoadMore: false
        });
      }
      typeof callback == "function" && callback(res);
    }
  });
}
Page({
  data: {
    scrollViewXWidth: 375,// 图片scroll-view 宽度
    message: {

    },
    currentMessageListIndex: 0,//当前的messageList、messageIdList下标
    messageIdList: [],//保存 messages的 id
    messageList: [],//message list
    isShowWriteResp: false,
    onLoadOptions: {},
    haveNetwork: true,
    contentMainHeight: 0,
    contentMainCoverHeight: 0,
    currentImageIndex: 1,//当前图片
    totalImage: 0,//图片总数
    scrollLeft: 0,//向左滑动的距离
    isShowLoadMore: false,
    images: [],
    isSending: false,//是否发送回应
    showImages: [],
    isShowTypewriting: false,//是否展示输入法
    id: "",//纸条id
    app: app,
    bodyBgColor: "auto",
    bodyHeight: "100%",
    commentInputValue: "",
    placeholder: "",
    focus: false,
    hasFocus: false,
    isShare: false,
    sendRespNum: {
      num: 0,
      itemIndex: -1,
      coloumsIndex: -1
    },//当前发送回应的条数
    initInputValue: "",
    isFirstLoadEmpty: false,
    lastScrollDetail: {},//上次滚动的信息
    isReplyResp: false,//是否是回复回应
    currentResp: {}//当前被回复的回应
  },
  pageNum: 0,//回应页码
  onLoad: function (options) {
    this.pageNum = 0;
    wx.showNavigationBarLoading();
    this.setData({
      onLoadOptions: options,
      sendRespNum: {
        num: 0,
        itemIndex: options.itemIndex,
        coloumsIndex: options.coloumsIndex,
        rawNotesIndex: options.rawNotesIndex
      },
      commentId: options.commentId//
    });
    var that = this;

    that.setData({
      id: options.id,
      isShare: options.isShare == 1
    });
    wx.showNavigationBarLoading();
    //获得缓存中的ids
    var notesId = wx.getStorageSync("util_notes_id");
    if (notesId) {
      this.setData({
        messageIdList: notesId
      });
    }
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
          wx.request({
            url: app.globalData.url.api.infoDetail,
            method: "GET",
            data: {
              id: options.id
            },
            fail: function (res) {
              console.log(res);
            },
            success: function (res) {
              if (res.data.errcode == 0) {
                res.data.data.content = app.util.decodeUTF8(res.data.data.content);
                //
                var images = [], showImages = [], len = res.data.data.photos ? res.data.data.photos.length : 0;
                for (var i = 0; i < len; i++) {
                  images[i] = res.data.data.photos[i].fdURL;
                  showImages[i] = {
                    url: res.data.data.photos[i].fdURL,
                    isShow: false
                  }
                }
                //判断是否有地理位置
                res.data.data.meter = options.meter || options.meter == 0 ? options.meter : '';
                if (res.data.data.meter == '' && app.globalData.location.latitude) {
                  res.data.data.meter = app.util.formatDistance(parseInt(app.util.getPonitToPointDistance(
                    res.data.data.latitude,
                    res.data.data.longitude,
                    app.globalData.location.latitude,
                    app.globalData.location.longitude
                  )));

                }


                res.data.data.nickName = res.data.data.nickName ? res.data.data.nickName : "";
                res.data.data.avatar = res.data.data.avatar ? res.data.data.avatar : app.globalData.defaultHeader;

                that.setData({
                  message: res.data.data,
                  messageList: [res.data.data, res.data.data, res.data.data, res.data.data, res.data.data],
                  totalImage: len,
                  images: images,
                  showImages: showImages
                });
                getResp(that, function (res) {
                  wx.hideToast();
                  that.setData({
                    isFirstLoadEmpty: res.data.data && res.data.data.length == 0,
                    scrollIntoViewId: "resp_1223"
                  });
                  if (res.data.data && res.data.data.length == 0) {
                    that.setData({
                      bodyBgColor: "#fff",
                      bodyHeight: app.getSystemInfo().windowHeight + "px"
                    });
                  }
                  if (that.data.commentId) {
                    that.setData({
                      scrollIntoViewId: "resp_" + that.data.commentId,
                      commentId: null
                    });
                  }

                });
              }
              else {//纸条不存在
                that.setData({
                  isDeleted: true
                });
              }
              wx.hideNavigationBarLoading();
            }
          });
        }
      }
    });
  },
  onReady: function () {
    this.setData({
      contentMainHeight: app.getSystemInfo().windowHeight - app.rpxToPx(80) + "px",
      contentMainCoverHeight: app.getSystemInfo().windowHeight + "px"
    });
  },
  onShow: function () {
    // 页面显示

  },
  onHide: function () {
    // 页面隐藏
    console.log("onHide");
  },
  onUnload: function () {
    // 页面关闭
    console.log("onUnload");
    var sendRespNum = this.data.sendRespNum;
    if (sendRespNum.num > 0) {
      wx.setStorageSync("comment_pdetail_srnum", sendRespNum);
    }
  },
  previewImages: function (event) {
    var index = app.getValueFormCurrentTargetDataSet(event, "imgIndex");
    wx.previewImage({
      current: this.data.images[index] ? this.data.images[index] : "", // 当前显示图片的http链接
      urls: this.data.images // 需要预览的图片http链接列表
    });
  },
  loadMore: function () {
    wx.hideToast();
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    });
    getResp(this, function () {
      wx.hideToast();
    });
  },
  commentInput: function (event) {
    this.setData({
      commentInputValue: event.detail.value
    });

  },
  sendComment: function () {

    var commentInputValue = this.data.commentInputValue;
    if (!commentInputValue) {
      return;
    }
    var that = this;
    /*
    wx.showToast({
      title: '发表中',
      icon: 'loading',
      duration: 500
    });*/
    that.setData({
      isSending: true
    });
    app.doLogin(function () {
      var data = {
        token: app.globalData.userToken,
        infomationID: that.data.id,
        responID: that.data.isReplyResp && that.data.currentResp.id ? that.data.currentResp.id : "",
        fdReplytoMemberID: that.data.isReplyResp && that.data.currentResp.memberID ? that.data.currentResp.memberID : "",
        wxapp: 1
      }, data = app.getAPISign(data);
      data.content = app.util.formatContentForServer(commentInputValue);
      wx.request({
        url: app.globalData.url.api.responInfo + "?token=" + data.token + "&infomationID=" + data.infomationID + "&responID=" + data.responID + "&fdReplytoMemberID=" + data.fdReplytoMemberID + "&wxapp=1&pos=" + data.pos + "&key=" + data.key + "&sign=" + data.sign,
        method: "POST",
        data: data,
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        fail: function (res) {
          console.log(res);
        },
        success: function (res) {

          if (res.data.errcode == 0) {
            var r = [res.data.data];
            var message = that.data.message;
            if (!message.resp) {
              message.resp = r;
            }
            else {
              Array.prototype.push.apply(r, message.resp);
              message.resp = r;
            }
            if (!message.commentnum) {
              message.commentnum = 1;
            }
            else {
              message.commentnum = parseInt(message.commentnum) + 1;
            }
            that.setData({
              message: message
            });
          }
          wx.showToast({
            title: '回应成功',
            icon: 'success',
            duration: 1000
          });
          var sendRespNum = that.data.sendRespNum;
          sendRespNum.num++;

          that.setData({
            placeholder: " ",
            focus: false,
            isReplyResp: false,
            currentResp: {},
            initInputValue: "",
            bodyBgColor: "auto",
            bodyHeight: "auto",
            commentInputValue: "",
            isShowWriteResp: false,
            sendRespNum: sendRespNum,
            isSending: false
          });


        }
      });
    });
  },

  clickHeader: function (event) {
    var sOpenId = app.getValueFormCurrentTargetDataSet(event, "sopenid");
    var message = this.data.message;
    wx.navigateTo({
      url: '/pages/person/detail/detail?sOpenId=' + sOpenId + "&nickName=" + message.nickName + "&avatar=" + message.avatar
    });
  },
  clickRespItem: function (event) {

    if (this.data.isShowTypewriting) {
      return;
    }
    var resp = app.getValueFormCurrentTargetDataSet(event, "resp");
    console.log(resp);
    this.setData({
      placeholder: "@" + resp.author,
      focus: true,
      isShowWriteResp: true,
      currentResp: resp,
      initInputValue: "",
      isReplyResp: true
    });

  },
  swiperChange: function (event) {

    this.setData({
      currentImageIndex: event.detail.current + 1
    });
  },
  imageError: function (event) {

  },
  loaded: function (event) {
    var index = app.getValueFormCurrentTargetDataSet(event, "imgIndex");

    var showImages = this.data.showImages;
    if (showImages[index]) {

      showImages[index].isShow = true;

      this.setData({
        showImages: showImages
      });
    }
  },
  reloadForNotNetwork: function () {
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
  scroll: function (event) {
    if (event && event.detail && event.detail.scrollHeight) {
      this.setData({
        contentMainCoverHeight: event.detail.scrollHeight + "px"
      });
    }
  },
  bindconfirm: function (event) {
    this.sendComment();
  },
  showWriteResp: function () {
    this.setData({
      focus: true,
      isShowWriteResp: true,
      placeholder: "写点什么~",
      currentResp: {},
      isReplyResp: false
    });
  },
  unShowWriteResp: function () {
    this.setData({
      focus: false,
      currentResp: {},
      placeholder: " ",
      isShowWriteResp: false,
      isReplyResp: false
    });
  },
  loadedRespHeader: function (event) {
    var respIndex = app.getValueFormCurrentTargetDataSet(event, "respIndex"), message = this.data.message;
    if (message.resp[respIndex]) {
      message.resp[respIndex].isHeaderLoaded = true;
      this.setData({
        message: message
      });
    }
  },
  onShareAppMessage: function () {
    var message = this.data.message;
    return {
      title: message.nickName + '的纸条',
      path: 'pages/comment/pdetail/pdetail?isShare=1&id=' + message.id
    }
  },
  goHomePage: function () {
    wx.navigateTo({
      url: '/pages/index/index'
    });
  }
});