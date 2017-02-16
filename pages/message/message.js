// pages/message/message.js
var app = getApp();
function loadMessage(that,callback){
  wx.hideToast();
   
  app.doLogin(function(){
    that.pageNum +=1;
    var data = {
      page:that.pageNum,
      token:app.globalData.userToken
    }, data = app.getAPISign(data);
    console.log(data);
    //获得首页数据
    wx.request({
      url:app.globalData.url.api.notice,
      method:"GET",
      data:data,
      fail:function(res){
        console.log(res);
      },
      success: function(res) {
        console.log(res);
        var data = res.data.data,len = data.length?data.length:0,messages=[];
        if(len==0){
          that.setData({
            isLoadEmpty:true
          });
        }
        for(var i=0,j=0;i<len;i++){
          var m = data[i];
          if(m["action"]!=0){
            continue;
          }
          messages[j++] = {
            name:m["nickname"]?m["nickname"]:"",
            headerImage:m["avatar"]?m["avatar"]:app.globalData.defaultHeader,
            type:m["action"]==0?"reply":"like",//0 回复 1点赞
            typeText:m["action"]==0?"回应了你的纸条":"钉住了你的纸条",//0 回复 1点赞,
            time:app.util.formatShowTimeText(m["addTime"]),
            contentImage:m["infosrc"],
            content:m["comment"]?m["comment"]:"",
            infoId:m["infoid"],
            isLoaded:false
          };
        }
 
        var oldMessages = that.data.messages;
        Array.prototype.push.apply(oldMessages, messages);
        that.setData({
          messages:oldMessages,
          hasMore:res.data.more&&res.data.more==1
        });
        if(typeof callback == "function")callback(res);
        wx.hideToast();
        wx.hideNavigationBarLoading();
      }
    });
  });
}
Page({
  data:{
    messages:[
    ],
    isLoadEmpty:false,
    isFirstLoadEmpty:false,
    hasMore:false
  },
  pageNum:0,
  onLoad:function(options){
    var that = this;
    wx.showNavigationBarLoading();
    loadMessage(this,function(res){
      var len = res.data.data.length ;
      if(len==0){
        that.setData({
          isFirstLoadEmpty:true
        });
      }
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
  loadMore:function(){
    loadMessage(this);
  },
  clickItem:function(event){
    var item = app.getValueFormCurrentTargetDataSet(event,"item");
    console.log(item);
    wx.navigateTo({
      url: '/pages/comment/pdetail/pdetail?id='+item.infoId
    });
  },
  onReachBottom:function(){
    if(!this.data.isLoadEmpty){
      loadMessage(this);
    }
  },
  onPullDownRefresh:function(){
    this.setData({
      messages:[
      ],
      isLoadEmpty:false,
      hasMore:false
    });
    this.pageNum=0;
    wx.showNavigationBarLoading();
    loadMessage(this,function(res){
      wx.stopPullDownRefresh();
    });
  },
  imageError:function(event){
  },
  loaded:function(event){
     var itemIndex = app.getValueFormCurrentTargetDataSet(event,"itemIndex");
     var messages = this.data.messages;
     console.log(itemIndex);
     if(messages[itemIndex]){
       messages[itemIndex].isLoaded = true;
      this.setData({
        messages:messages
      });
     }
  }
})