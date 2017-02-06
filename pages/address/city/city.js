var citysModel = require('../../lib/citys/citys.js')
Page({
  data:{
      citys:[],
      scrollIntoViewId:"city_fc_B",
      scollViewHeight:0
  },
  onLoad:function(options){ 
    //获得屏幕的高度
    var sy = wx.getSystemInfoSync(),height=0;
    if(sy.windowWidth&&sy.windowHeight){
      //减去 城市顶部的那个栏
      height = sy.windowHeight - (sy.windowWidth/750)*90;
    }
    this.setData({
      scollViewHeight:height,
      citys:citysModel.getGroup()
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
  },
  cancelSelect:function(){
    wx.navigateBack({});
  },
  clickFirstChar: function(event) {
    if(event.currentTarget&&event.currentTarget.dataset&& event.currentTarget.dataset.char){
      this.setData({
        scrollIntoViewId:"city_fc_"+event.currentTarget.dataset.char
      });
    }
  },
  selectedCity:function(event){
    if(event.currentTarget&&event.currentTarget.dataset&& event.currentTarget.dataset.city){
      wx.setStorage({
        key:"city_alske",
        data:event.currentTarget.dataset.city,
        success:function(){
          wx.navigateBack();
        }
      });
    }
  }
})