// pages/message/message.js
var app = getApp();
function loadMessage(that){
  wx.hideToast();
  wx.showToast({
    title: '加载中',
    icon: 'loading',
    duration: 10000
  });
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
        var data = res.data.data,len = data.length,messages=[];
        for(var i=0;i<len;i++){
          var m = data[i];
          messages[i] = {
            name:m["nickname"]?m["nickname"]:"",
            headerImage:m["avatar"]?m["avatar"]:app.globalData.defaultHeader,
            type:m["action"]==0?"reply":"like",//0 回复 1点赞
            typeText:m["action"]==0?"回应了你的纸条":"摁了你的纸条",//0 回复 1点赞,
            time:app.util.formatShowTimeText(m["addTime"]),
            contentImage:m["infosrc"],
            content:m["comment"]?m["comment"]:"",
            infoId:m["infoid"]
          };
        }
        if(res.data.total&&res.data.total-(that.pageNum*app.globalData.noticePageSize)>0){
            that.setData({
            isShowLoadMore:true
          });
        }
        var oldMessages = that.data.messages;
        Array.prototype.push.apply(oldMessages, messages);
        that.setData({
          messages:oldMessages,
          isShowLoadMore:res.data.more&&res.data.more==1
        });
        wx.hideToast();
      }
    });
  });
}
Page({
  data:{
    messages:[
    ],
    isShowLoadMore:false
  },
  pageNum:0,
  onLoad:function(options){
    loadMessage(this);
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
  }
})