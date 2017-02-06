//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo: {}
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
  },
  clickEdit:function(){
    wx.navigateTo({
      url: '/pages/comment/edit/edit'
    });
  },
  clickItem:function(event){
    if(event.currentTarget&&event.currentTarget.dataset&& event.currentTarget.dataset.type){
      if(event.currentTarget.dataset.type=="shop"){
        wx.navigateTo({
          url: '/pages/shop/detail/detail'
        });
      }
      else{
        wx.navigateTo({
          url: '/pages/comment/pdetail/pdetail'
        });
      }
    }
    wx.navigateTo({
      url: '/pages/comment/pdetail/pdetail'
    });
  },
  clickWarn:function(){
    wx.navigateTo({
      url: '/pages/message/message'
    });
  },
  clickSearch:function(){
    wx.navigateTo({
      url: '/pages/search/search'
    });
  }
})
