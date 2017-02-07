// pages/comment/pdetail/pdetail.js
var app = getApp();
Page({
  data:{
    message:{

    },
    app:app
  },
  onLoad:function(options){
    var that = this;
    wx.showNavigationBarLoading();
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
        res.data.data.content = app.util.decodeUTF8(res.data.data.content);
        res.data.data.showTimeText = app.util.formatShowTimeText(res.data.data.addTime);
        var len = res.data.data.resp.length;
        for(var i=0;i<len;i++){
          res.data.data.resp[i].showTimeText = app.util.formatShowTimeText(res.data.data.resp[i].addTime)
        }
        that.setData({
          message:res.data.data
        });
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