// pages/search/search.js
Page({
  data:{
    city:"需要服务器配合"
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    var city = wx.getStorageSync('city_alske');
    this.setData({
      city:city?city:"需要服务器配合"
    });
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  cancelSearch:function(){
    wx.navigateBack();
  },
  selectCity:function(){
    wx.navigateTo({
      url: '/pages/address/city/city'
    });
  }
})