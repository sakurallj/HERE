// pages/shop/detail/detail.js
var app = getApp()
Page({
  data:{
    scrollViewXWidth:375,//环境图片scroll-view 宽度
    images:[//环境图片
      "http://img02.tooopen.com/images/20160506/tooopen_sl_161735234856.jpg",
      "http://img02.tooopen.com/images/20160409/tooopen_sl_158839182699.jpg",
      "http://img02.tooopen.com/images/20160430/tooopen_sl_161072421856.jpg",
      "http://img02.tooopen.com/images/20160509/tooopen_sl_162007252717.jpg",
      "http://img02.tooopen.com/images/20160429/tooopen_sl_161028675674.jpg",
      "http://img02.tooopen.com/images/20160415/tooopen_sl_159426452743.jpg"
    ],
    shop:{
      name:"刘得华健身房",
      desc:"健身，上瘾了，根本停不下来",
      address:"珠江新城金穗路侨鑫国际20楼",
      distanct:"400m",
      longitude:113.2643635541,
      latitude:23.1290650841,
      scale:16,
      phone:"13800138000",
      announcement:[
        {
          image:"/pages/images/store-icon1.png",
          id:"",
          content:"新会员办年卡，立享6折优惠"
        },
        {
          image:"/pages/images/store-icon2.png",
          id:"",
          content:"邀请三个以上好友办会员，享受三个月的免费健身服务。"
        }
      ]
    }
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
     var sy = wx.getSystemInfoSync();
     this.setData({
       scrollViewXWidth:sy.windowWidt ?sy.windowWidt :375
     });
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
  previewEnvImages:function(event){
    var index = app.getValueFormCurrentTargetDataSet(event,"envImgIndex");
    wx.previewImage({
      current: this.data.images[index]?this.data.images[index]:"", // 当前显示图片的http链接
      urls: this.data.images // 需要预览的图片http链接列表
    });
  },
  gotoMap:function(){
    wx.navigateTo({
      url: '/pages/shop/map/map?shop='+JSON.stringify(this.data.shop)
    });
  },
  callPhone:function(){
    wx.makePhoneCall({
      phoneNumber: this.data.shop.phone
    });
  }
})