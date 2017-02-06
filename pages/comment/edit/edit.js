var app = getApp();
Page({
  data:{
    message:{
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
    var str = JSON.stringify(this.data.message);
    wx.setStorage({
      key:"comment_edit_message",
      data:str,
      success:function(){
        wx.navigateBack();
      }
    });
  }
})