// pages/message/message.js
Page({
  data:{
    messages:[
      {
        name:"琪琪",
        headerImage:"/pages/images/test.png",
        type:"reply",
        typeText:"回应了你的纸条",
        time:"11:57",
        contentImage:"/pages/images/test2.png",
        content:"这周末你们要不要一起去自驾游娄源呢？这周末你们要不要一起去自驾游娄源呢？"
      },
      {
        name:"琪琪",
        headerImage:"/pages/images/test.png",
        type:"reply",
        typeText:"回应了你的纸条",
        time:"11:04",
        contentImage:"",
        content:"这周末你们要不要一起去自驾游娄源呢？这周末你们要不要一起去自驾游娄源呢？"
      },
      {
        name:"琪琪",
        headerImage:"/pages/images/test.png",
        type:"reply",
        typeText:"回应了你的纸条",
        time:"01:56",
        contentImage:"/pages/images/test.png",
        content:"这周末你们要不要一起去自驾游娄源呢？这周末你们要不要一起去自驾游娄源呢？"
      }
    ]
  },
  pageIndex:1,
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
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
  loadMore:function(){
    var messages = this.data.messages;
    Array.prototype.push.apply(messages, messages);
    console.log(messages);
    this.setData({
      messages:messages
    });
  }
})