var app = getApp();
function uploadImages(images){
  console.log(images);
  if(images.length>0){
    var imagePath = images.shift();
    wx.uploadFile({
      url: app.globalData.url.api.uploadImage, //仅为示例，非真实的接口地址
      filePath:imagePath,
      name: 'avatar',
      formData:{
        'token': app.globalData.userToken
      },
      success: function(res){
        console.log(res);
      }
    });
  }
}
function sendMessage(message){
  wx.showToast({
    title: '发表中',
    icon: 'loading',
    duration: 10000
  });
  //上传图片
  app.doLogin(function(){
    uploadImages(message.images);
  });
  return;
  //发送纸条
  var data={
    token:app.globalData.userToken,
    content:message.content,
    images:JSON.stringify(message.images),
    latitude:message.address.latitude,
    longitude:message.address.longitude,
    address:message.address.name,
  },data = app.getAPISign(data); 
  wx.request({
    url:app.globalData.url.api.addNote,
    method:"GET",
    data:data,
    fail:function(res){
      console.log(res);
    },
    success: function(res) {
      console.log(res);
      if(res.data.errcode==1002){//登录过期重新登录后再发布
        app.doLogin(function(){
          sendMessage(message);
        });
      }
      else{
        var str = JSON.stringify(message);
        wx.setStorage({
          key:"comment_edit_message",
          data:str,
          success:function(){
            wx.hideToast();
            wx.navigateBack();
          }
        });
      }
    }
  });
}
Page({
  data:{
    message:{
      id:"",
      content:"",
      images:[],
      addressShow:0,// 0 不显示  1显示
      address:{
        name:"请选择位置",
        address:"",
        latitude:"",
        longitude:""
      }
    }
  },
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
  chooseImage:function(){
    var that = this;
    wx.chooseImage({
      count: 8, // 默认9
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        var m = that.data.message;
        m.images=tempFilePaths;
        that.setData({
          message:m
        });
        console.log(that.data.message);
      }
    })
  },
  chooseLocation:function(){
    var that = this;
    wx.chooseLocation({
      success:function(res){
        var m = that.data.message;
        m.address = res;
        that.setData({
          message:m
        });
        console.log(that.data.message);
      },
      cancel:function(res){
        console.log(res);
      },
      fail:function(res){
        console.log(res);
      }
    });
  },
  inputMsg:function(event){
     var m = this.data.message;
      m.content = event.detail.value;
      this.setData({
        message:m
      });
  },
  previewImages:function(event){
    var index = app.getValueFormCurrentTargetDataSet(event,"imgIndex");
    wx.previewImage({
      current: this.data.message.images[index]?this.data.message.images[index]:"", // 当前显示图片的http链接
      urls: this.data.message.images // 需要预览的图片http链接列表
    });
  },
  //贴纸片
  sendMessage:function(){
    var that = this,message = that.data.message;
     //数据校验
    //判断是否有图片或评论
    if(!message.content&&message.images.length==0){
      wx.showModal({
        title: '',
        content: '请输入要发表的文字或图片',
        showCancel:false,
        confirmColor:"#a98b59",
        success: function(res) {}
      });
      return;
    }
    //判断是否选择了位置
    if(!message.address.longitude){
      app.getLocation(function(res){
        message.address.latitude=res.latitude;
        message.address.longitude=res.longitude;
        sendMessage(message);
      });
    }
    else{
      sendMessage(message);
    }
  }
})