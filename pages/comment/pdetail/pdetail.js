// pages/comment/pdetail/pdetail.js
var app = getApp();
Page({
  data:{},
  onLoad:function(options){
    console.log(options);
    wx.request({
      url:app.globalData.url.api.infoDetail,
      method:"GET",
      data:{
        id:options.id
      },
      fail:function(res){
        console.log(res);
      },
      success: function(res) {
        console.log(res);
        wx.hideNavigationBarLoading();
      }
    });
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})