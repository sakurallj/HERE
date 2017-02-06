// pages/shop/map/map.js
Page({
  data:{
    mapHeight:0//地图的高度
  },
  onLoad:function(options){
    var sy = wx.getSystemInfoSync(),height=0;
    if(sy.windowWidth&&sy.windowHeight){
      //减去 城市顶部的那个栏
      height = sy.windowHeight - (sy.windowWidth/750)*160;
    }
    this.setData({
      mapHeight:height,
      shop:JSON.parse(options.shop)
       
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