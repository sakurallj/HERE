// pages/comment/pdetail/pdetail.js
var app = getApp();
/**
 * 获得回应
 */
function getResp(that,callback){
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
      typeof callback == "function" && callback(res);
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
    commentInputValue:"",
    placeholder:"你也回复点什么吧",
    focus:false,
    initInputValue:"",
    isReplyResp:false,//是否是回复回应
    currentResp:{}//当前被回复的回应
  },
  pageNum:0,//回应页码
  onLoad:function(options){
    wx.hideToast();
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    });
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
        //
        var images=[], len = res.data.data.photos?res.data.data.photos.length:0;
        for(var i=0;i<len;i++){
          images[i]=res.data.data.photos[i].fdURL ;
        }
        that.setData({
          message:res.data.data,
          images:images
        });
        getResp(that,function(){
          wx.hideToast();
        });
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
    wx.hideToast();
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    });
    getResp(this,function(){
      wx.hideToast();
    });
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
    wx.hideToast();
    wx.showToast({
      title: '发表中',
      icon: 'loading',
      duration: 10000
    });
    app.doLogin(function(){
      var data={
        token:app.globalData.userToken,
        content:app.util.formatContentForServer(commentInputValue),
        infomationID:that.data.id,
        responID:that.data.isReplyResp&&that.data.currentResp.id?that.data.currentResp.id:"",
        fdReplytoMemberID:that.data.isReplyResp&&that.data.currentResp.memberID?that.data.currentResp.memberID:"",
      },data = app.getAPISign(data); 
      wx.request({
        url:app.globalData.url.api.responInfo,
        method:"GET",
        data:data,
        fail:function(res){
          console.log(res);
        },
        success: function(res) {
          console.log(res);
          if(res.data.errcode == 0){
            var r = [res.data.data];
            var message = that.data.message;
            if(!message.resp){
              message.resp = r;
            }
            else{
              Array.prototype.push.apply(r, message.resp);
              message.resp = r;
            }
            if(!message.commentnum){
              message.commentnum = 1;
            }
            else{
              message.commentnum = parseInt(message.commentnum)+1;
            }
            that.setData({
              message:message
            });
          }
          that.setData({
            initInputValue:""
          });
          wx.hideToast();
        }
      });
    });
  },
  clickRespContent:function(event){
    var resp = app.getValueFormCurrentTargetDataSet(event,"resp");
    console.log(resp);
    this.setData({
      placeholder:"@"+resp.author,
      focus:true,
      isReplyResp:true,
      currentResp:resp
    });
  },
  clickHeader:function(event){
    var sOpenId = app.getValueFormCurrentTargetDataSet(event,"sopenid");
    var message = this.data.message;
    wx.navigateTo({
      url: '/pages/person/detail/detail?sOpenId='+sOpenId+"&nickName="+message.nickName+"&avatar="+message.avatar
    });
  },
  bindBlur:function(){
    this.setData({
      placeholder:"你也回复点什么吧",
      focus:false,
      isReplyResp:false,
      currentResp:{},
      initInputValue:""
    });
  }
});