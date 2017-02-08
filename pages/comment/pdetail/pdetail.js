// pages/comment/pdetail/pdetail.js
var app = getApp();
/**
 * 获得回应
 */
function getResp(that){
  that.pageNum +=1; 
  var data={
    id:that.data.id ,
    page:that.pageNum 
  },data = app.getAPISign(data); 
  wx.request({
    url:app.globalData.url.api.resp,
    method:"GET",
    data:data,
    fail:function(res){
      console.log(res);
    },
    success: function(res) {
      console.log(res);
      var len = res.data.data?res.data.data.length:0;
      for(var i=0;i<len;i++){
        res.data.data[i].showTimeText = app.util.formatShowTimeText(res.data.data[i].addTime)
      }
      var message = that.data.message;
      if(!message.resp){
        message.resp = [];
      }
      Array.prototype.push.apply(message.resp, res.data.data);
      message.commentnum = res.data.commentnum;
      that.setData({
        message:message
      });
      if(res.data&& res.data.more==1){
        that.setData({
          isShowLoadMore:true
        });
      }
      else{
        that.setData({
          isShowLoadMore:false
        });
      }
    }
  });
}
Page({
  data:{
    scrollViewXWidth:375,// 图片scroll-view 宽度
    message:{

    },
    isShowLoadMore:false,
    images:[],
    id:"",//纸条id
    app:app,
    commentInputValue:""
  },
  pageNum:0,//回应页码
  onLoad:function(options){
    var that = this;
    that.setData({
      id:options.id
    });
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
        //
        var images=[], len = res.data.data.photos?res.data.data.photos.length:0;
        for(var i=0;i<len;i++){
          images[i]=res.data.data.photos[i].fdURL ;
        }
        that.setData({
          message:res.data.data,
          images:images
        });
        getResp(that);
        wx.hideNavigationBarLoading();
      }
    });
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
  previewImages:function(){
    var index = app.getValueFormCurrentTargetDataSet(event,"imgIndex");
    wx.previewImage({
      current: this.data.images[index]?this.dataimages[index]:"", // 当前显示图片的http链接
      urls: this.data.images // 需要预览的图片http链接列表
    });
  },
  loadMore:function(){
    getResp(this);
  },
  commentInput:function(event){
    this.setData({
      commentInputValue:event.detail.value
    });
    console.log(event.detail.value);
  },
  sendComment:function(){
    var commentInputValue = this.data.commentInputValue;
    if(!commentInputValue){
      wx.showModal({
        title: '',
        content: '请输回复内容',
        showCancel:false,
        confirmColor:app.globalData.confirmColor,
        success: function(res) {}
      });
      return;
    }
    var that = this;
    wx.showToast({
      title: '发表中',
      icon: 'loading',
      duration: 10000
    });
    var data={
      token:app.globalData.userToken,
      content:commentInputValue,
      infomationID:that.data.id,
      responID:,
      fdReplytoMemberID:,
    },data = app.getAPISign(data); 
    wx.request({
      url:app.globalData.url.api.responInfo,
      method:"GET",
      data:data,
      fail:function(res){
        console.log(res);
      },
      success: function(res) {
      }
    });
  }
})