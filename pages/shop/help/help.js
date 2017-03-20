// pages/shop/help/help.js
Page({
  data: {
    src: "https://www.900here.com/var/uploads/upload/1489490364_48231.jpg"
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    });

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  onShareAppMessage: function () {
    return {
      title: '加入HERE留言系统',
      path: '/pages/shop/help/help'
    }
  },
  bindLoad: function () {
    wx.hideToast();
  },
  bindError:function(){
    this.setData({
      src:"/pages/images/help-default.jpg"
    });
  }
})