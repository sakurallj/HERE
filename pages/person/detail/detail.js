// pages/person/detail/detail.js
var app = getApp();
function loadNotes(that,callback){
  that.pageNum+=1;
  var data = {
    token:app.globalData.userToken,
    page:that.pageNum
  };
  var url = "";
  if(!that.data.isMy){
    data.openid = that.data.userInfo.sOpenId;
    url = app.globalData.url.api.otherInfoList;
  }
  else{
    url = app.globalData.url.api.myInfoList;
  }
  data = app.getAPISign(data);
  console.log(data);
  //获得首页数据
  wx.request({
    url:url,
    method:"GET",
    data:data,
    header: {
      'content-type': 'application/json'
    },
    fail:function(res){
      console.log(res);
      wx.hideToast();
    },
    success: function(res) {
      console.log(res);          
      var notes = app.util.separateNotes(that,app,res.data.data),rawNotes=that.data.rawNotes;
      console.log(notes);
      Array.prototype.push.apply(rawNotes, res.data.data);
      that.setData({
        notes:notes,
        rawNotes:rawNotes,
        hasMore:res.data.more&&res.data.more==1
      });
      if(typeof callback == "function")callback(res);
      wx.hideToast();
      wx.hideNavigationBarLoading();
    }
  });
}
Page({
  data:{
    notes:{
      coloums1:[],
      coloums2:[],
      coloums1Heigth:0,//列高
      coloums2Heigth:0//列高
    },
    userInfo:{

    },
    svColumnHeight:false,
    rawNotes:[],
    hasMore:false,
    isMy:false//是否 我的动态
  },
  pageNum:0,
  onLoad:function(options){
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    });
    app.doLogin(function(){
      var sOpenId = options.sOpenId,nickName=options.nickName,avatar=options.avatar;
      if(sOpenId==app.globalData.userServerOpenId){
        wx.setNavigationBarTitle({
          title: '我的动态'
        });
        that.setData({
          isMy:true,
        });
        nickName=nickName?nickName:app.globalData.userInfo.nickName;
        avatar=avatar?avatar:app.globalData.userInfo.avatarUrl;
      }
      else{
        wx.setNavigationBarTitle({
          title: 'TA的动态'
        });
      }
      that.setData({
        userInfo:{
          nickName:nickName,
          avatarUrl:avatar,
          sOpenId:sOpenId
        }
      });
      console.log(app.globalData.userInfo);
      loadNotes(that);
    });
  },
  onReady:function(){
    // 页面渲染完成
    var sy = wx.getSystemInfoSync();
    console.log(sy);
    var svColumnHeight = (750/sy.windowWidth)*sy.windowHeight-90;
     this.setData({
       svColumnHeight:svColumnHeight
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
  deleteNote:function(event){
    wx.hideToast();
    wx.showToast({
      title: '删除中',
      icon: 'loading',
      duration: 10000
    });
    var that = this;
    var note = app.getValueFormCurrentTargetDataSet(event,"note");
    var colum = app.getValueFormCurrentTargetDataSet(event,"colum");
    console.log(note);
    var data = {
      token:app.globalData.userToken,
      id:note.id
    }, data = app.getAPISign(data);
    console.log(data);
    //获得首页数据
    wx.request({
      url:app.globalData.url.api.delNote,
      method:"GET",
      data:data,
      header: {
        'content-type': 'application/json'
      },
      fail:function(res){
        console.log(res);
        wx.hideToast();
      },
      success: function(res) {
        console.log(res);
        var colums = [];
        if(colum==1){
          colums = that.data.notes.coloums1;
          var len = colums.length;
          for(var i=0;i<len;i++){
            if(colums[i].id==note.id){
              colums[i].displayType="none";
              var notes = that.data.notes;
              notes.coloums1=colums;
              that.setData({
                notes:notes
              });
              break;
            }
          }
        }
        else if(colum==2){
          colums = that.data.notes.coloums2;
          var len = colums.length;
          for(var i=0;i<len;i++){
            if(colums[i].id==note.id){
              colums[i].displayType="none";
              var notes = that.data.notes;
              notes.coloums2=colums;
              that.setData({
                notes:notes
              });
              break;
            }
          }
        }
        console.log(notes);
        wx.hideToast();
      }
    });
  },
  clickItem:function(event){
    if(event.currentTarget&&event.currentTarget.dataset&& event.currentTarget.dataset.type){
      var item = app.getValueFormCurrentTargetDataSet(event,"item");
      wx.navigateTo({
        url: '/pages/comment/pdetail/pdetail?id='+item.id+"&meter="+item.meter
      });
    }
    wx.navigateTo({
      url: '/pages/comment/pdetail/pdetail'
    });
  },
  loadMore:function(){
    loadNotes(this);
  },
  scrollToLower:function(){
    if(this.data.hasMore){
      loadNotes(this);
    }
  },
  onPullDownRefresh:function(){
    this.setData({
      notes:{
        coloums1:[],
        coloums2:[],
        coloums1Heigth:0,//列高
        coloums2Heigth:0//列高
      },
      isShowLoadMore:false,
      headerDisplayType:"none"
    });
    this.pageNum=0;
  
    var that = this;
    wx.showNavigationBarLoading();
    //获得用户信息
    //调用登录接口
    app.doLogin(function(){
      loadNotes(that,function(){
        wx.stopPullDownRefresh();
      });
    });
    
  }
})