//index.js
//获取应用实例
var app = getApp();
function loadedNotes(that,res){
  console.log(111);
  console.log(res);
  if(res&&res.data&&res.data.data){
    var isLoadEmpty = res.data.data.length==0;
    var notes = app.util.separateNotes(that,app,res.data.data,that.isRefresh),rawNotes=that.data.rawNotes;
    console.log(notes);
    if(that.isRefresh){
      rawNotes = res.data.data;
    }
    else{
      Array.prototype.push.apply(rawNotes, res.data.data);
    }
    that.setData({
      notes:notes,
      rawNotes:rawNotes,
      isShowLoadMore:false,
      isLoadEmpty:isLoadEmpty,
      hasMore:res.data.more&&res.data.more==1
    });
  }
  that.setData({
    isLastLoadDone:true
  });
  wx.hideToast();
  wx.hideNavigationBarLoading();
}
function loadNotes(that,latitude,longitude,callback){
  if(!that.data.isLastLoadDone){
    return "";
  }
  else{
    that.setData({
      isLastLoadDone:false
    });
  }
  wx.showNavigationBarLoading();
  that.pageNum +=1;
  var data = {
    page:that.pageNum,
    lat:latitude,
    lng:longitude,
    wxapp:1
  }, data = app.getAPISign(data);
  console.log(data);
  //获得首页数据
  wx.request({
    url:app.globalData.url.api.noteList,
    method:"GET",
    data:data,
    header: {
      'content-type': 'application/json'
    },
    fail:function(res){
      console.log(res);
      if(typeof callback == "function")callback(res);
    },
    success: function(res) {
      if(typeof callback == "function")callback(res);
    }
  });
}
Page({
  data: {
    notes:{
      coloums1:[],
      coloums2:[],
      coloums1Heigth:0,//列高
      coloums2Heigth:0//列高
    },
    haveNetwork:true,
    haveNewMessage:false,
    isFirstLoadEmpty:false,
    scrollTop:0,
    rawNotes:[],
    isShowLoadMore:false,
    hasMore:false,
    isLoadEmpty:false,
    isLastLoadDone:true,//上次加载是否完成
    svColumnHeight:100,//coloum的高
    headerDisplayType:"block"//
  },
  isRefresh:false,
  pageNum:0,
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
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
    var that = this;
    if(app.globalData.userToken){
      //获得消息
      var data = {
        page:1,
        wxapp:1,
        token:app.globalData.userToken
      }, data = app.getAPISign(data);
      wx.request({
        url:app.globalData.url.api.notice,
        method:"GET",
        data:data,
        fail:function(res){
          console.log(res);
        },
        success: function(res) {
          console.log(res);        
          that.setData({
            haveNewMessage:res.data.unread>0
          });
        }
      });
    }
    
    // 
    var res = wx.getStorageSync('comment_edit_message');
    console.log(res);
    if(res){
      console.log(333);
      var images = res.imageUrls?JSON.parse(res.imageUrls):[], note = {
        addTime:"",
        avatar:app.globalData.userInfo.avatarUrl,
        commentnum:"0",
        content:res.content,
        contentar:res.contentar,
        fdNoteOpenID:"",
        id:res.id,
        latitude:app.globalData.location.latitude,
        longitude:app.globalData.location.longitude,
        meter:res.meter,
        nickName:app.globalData.userInfo.nickName,
        photo:images.length>0?images[0]:""
      };
      console.log(images);
      this.setData({
        notes:{
          coloums1:[],
          coloums2:[],
          coloums1Heigth:0,//列高
          coloums2Heigth:0//列高
        }
      });
      var rawNotes=this.data.rawNotes,rawNotes1=[note];
      Array.prototype.push.apply(rawNotes1,rawNotes);
      console.log("notes");
      console.log(rawNotes1);
      var notes = app.util.separateNotes(this,app,rawNotes1);
      this.setData({
        notes:notes,
        rawNotes:rawNotes1
      });
    }
    //清空msg缓存
    wx.removeStorageSync('comment_edit_message');


  },
  onLoad: function () {
    this.pageNum = 0;
    var that = this;
    //判断是否有网络
    wx.getNetworkType({
      success: function(res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        if(res.networkType =="none" ){
          that.setData({
            haveNetwork:false
          });
        }
        else{
          that.setData({
            haveNetwork:true
          });
        }
      }
    });
 
    wx.removeStorageSync('comment_edit_message');
   
    
    wx.showNavigationBarLoading();
    //获得用户信息
    //调用登录接口
    app.doLogin(function(res){
      //获得消息
      var data = {
        page:1,
        token:app.globalData.userToken
      }, data = app.getAPISign(data);
      wx.request({
        url:app.globalData.url.api.notice,
        method:"GET",
        data:data,
        fail:function(res){
          console.log(res);
        },
        success: function(res) {
          console.log(res);        
          that.setData({
            haveNewMessage:res.data.unread>0
          });
        }
      });
    });
    //获得地理位置
    app.getLocation(function(res){
      console.log(res);
      var latitude = res.latitude;
        var longitude = res.longitude;
        var speed = res.speed;
        var accuracy = res.accuracy;
        app.globalData.location = res;
        loadNotes(that,latitude,longitude,function(res){ 
          loadedNotes(that,res);
          wx.stopPullDownRefresh();
          that.setData({
            isFirstLoadEmpty:res.data.data&&res.data.data.length==0
          });
        });
    });
    
  },
  clickEdit:function(){
    wx.navigateTo({
      url: '/pages/comment/edit/edit'
    });
  },
  clickItem:function(event){
    if(event.currentTarget&&event.currentTarget.dataset&& event.currentTarget.dataset.type){
      var item = app.getValueFormCurrentTargetDataSet(event,"item");
      if(event.currentTarget.dataset.type=="shop"){
        wx.navigateTo({
          url: '/pages/shop/detail/detail?id='+item.id+'&name='+item.fdName+'&image='+item.fdLogo
        });
      }
      else{
        wx.navigateTo({
          url: '/pages/comment/pdetail/pdetail?id='+item.id+'&meter='+item.meter
        });
      }
    }
  },
  clickWarn:function(){
    wx.navigateTo({
      url: '/pages/message/message'
    });
  },
  clickSearch:function(){
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },
  loadMore:function(){
    loadNotes(this,app.globalData.location.latitude,app.globalData.location.longitude);
  },
  onPullDownRefresh:function(){
    this.isRefresh = true;
    this.pageNum=0;
  
    var that = this;
    wx.showNavigationBarLoading();
    //获得用户信息
    //调用登录接口
    app.doLogin();
    //获得地理位置
    app.getLocation(function(res){
      var latitude = res.latitude;
        var longitude = res.longitude;
        var speed = res.speed;
        var accuracy = res.accuracy;
        app.globalData.location = res;
        
        loadNotes(that,latitude,longitude,function(res){
          that.setData({
            isShowLoadMore:false,
            headerDisplayType:"none"
          });
          loadedNotes(that,res);
          that.isRefresh = false;
          wx.stopPullDownRefresh();
          that.setData({
            headerDisplayType:"block"
          });
        });
    });
  },
  scrollToLower:function(){
    this.setData({
      isShowLoadMore:true
    });
    if(this.data.hasMore){
      loadNotes(this,app.globalData.location.latitude,app.globalData.location.longitude);
    }
  },
  scroll:function(event){
    this.setData({  
        scrollTop: event.detail.scrollTop  
    });  
  },
  touchMove:function(event){
    console.log(event);
  },
  refresh:function(){
    this.setData({  
        scrollTop: 0  
    });  
    this.onPullDownRefresh();
  },
  onReachBottom:function(){
    var that = this;
    if(!this.data.isLoadEmpty){
      loadNotes(this,app.globalData.location.latitude,app.globalData.location.longitude,function(res){
        loadedNotes(that,res);
      });
    }
  },
  imageError:function(event){
    console.log(event);
  },
  loaded:function(event){
    app.util.notesPhotoLoaded(this,app,event);
  },
  reloadForNotNetwork:function(){
    var that = this;
    //判断是否有网络
    wx.getNetworkType({
      success: function(res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        if(res.networkType =="none" ){
          that.setData({
            haveNetwork:false
          });
          wx.showToast({
            title: '请检查网络',
            icon: 'loading',
            duration: 1000
          });

        }
        else{
          that.setData({
            haveNetwork:true
          });
          that.onPullDownRefresh();
        }
      }
    });
  }
})
