var app = getApp();
//保存服务端图片的路径
var serverImagePaths = []; 
/**
 * 上传图片
 */
function uploadImages(images,callback){
  if(images.length>0){
    var imagePath = images.shift();
    wx.uploadFile({
      url: app.globalData.url.api.uploadImage+"?token="+app.globalData.userToken, //仅为示例，非真实的接口地址
      filePath:imagePath,
      name: 'avatar',
      formData:{
      },
      success: function(res){
        console.log(res);
        var data = JSON.parse(res.data);
        serverImagePaths[serverImagePaths.length] = data.data;
        wx.hideToast();
        wx.showToast({
          title: '上传图片中',
          icon: 'loading',
          duration: 10000
        });
        return uploadImages(images,callback);
      },
      fail:function(res){
        console.log(res);
      }
    });
  }
  else{
    if(typeof callback == "function")callback(serverImagePaths);
    return 1;
  }
}
function sendMessage(that,message){
  serverImagePaths = [];//serverImagePaths是此js的全局变量，这里要清空 服务端图片的路径 如果不清空会把上次发表的图片也加进来
  app.doLogin(function(){
    //上传图片
    wx.hideToast();
    wx.showToast({
      title: '上传图片中',
      icon: 'loading',
      duration: 10000
    });
    uploadImages(message.images,function(images){
      //发送纸条
      wx.hideToast();
      wx.showToast({
        title: '发表中',
        icon: 'loading',
        duration: 10000
      });
      var data={
        token:app.globalData.userToken,
        content:app.util.formatContentForServer(message.content),
        imageUrls:JSON.stringify(images),
        latitude:message.address.latitude,
        longitude:message.address.longitude,
        address:message.address.name,
      },rawData=data;
      if(that.data.shopId){
        data.fdPartnerID = that.data.shopId;
      }
      data = app.getAPISign(data); 
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
            console.log(res);
          }
          else{
            console.log(11212221);
            rawData.id = res.data.id;
            console.log(rawData);
            wx.setStorageSync("comment_edit_message",rawData);
            wx.hideToast();
            wx.navigateBack();
          }
        }
      });
    });
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
    },
    shopId:""
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    if(options.shopId){
      this.setData({
        shopId:options.shopId
      });
    }
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
      count: 9, // 默认9
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        var m = that.data.message;
        console.log(tempFilePaths);
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
    message.content = app.util.trim(message.content);
    if(!message.content&&message.images.length==0){
      wx.showModal({
        title: '',
        content: '请输入要发表的文字或图片',
        showCancel:false,
        confirmColor:app.globalData.confirmColor,
        success: function(res) {}
      });
      return;
    }
    wx.showToast({
      title: '发表中',
      icon: 'loading',
      duration: 10000
    });
    //判断是否选择了位置
    if(!message.address.longitude){
      app.getLocation(function(res){
        message.address.latitude=res.latitude;
        message.address.longitude=res.longitude;
        sendMessage(that,message);
      });
    }
    else{
      sendMessage(that,message);
    }
  }
})