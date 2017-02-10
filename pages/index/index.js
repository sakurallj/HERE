//index.js
//获取应用实例
var app = getApp();
 
function loadNotes(that,latitude,longitude,callback){
  wx.hideToast();
  wx.showToast({
    title: '加载中',
    icon: 'loading',
    duration: 10000
  });
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
      console.log(res);
      var notes = app.util.separateNotes(that,app,res.data.data),rawNotes=that.data.rawNotes;
      console.log(notes);
      Array.prototype.push.apply(rawNotes, res.data.data);
      that.setData({
        notes:notes,
        rawNotes:rawNotes,
        isShowLoadMore:res.data.more&&res.data.more==1
      });
      if(typeof callback == "function")callback(res);
      wx.hideToast();
      wx.hideNavigationBarLoading();
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
    rawNotes:[],
    isShowLoadMore:false,
    headerDisplayType:"block"//
  },
  pageNum:0,
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onShow:function(){
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
        fdNoteOpenID:"",
        id:res.id,
        latitude:app.globalData.location.latitude,
        longitude:app.globalData.location.longitude,
        meter:"0m",
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
    wx.removeStorageSync('comment_edit_message');
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    });
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
        loadNotes(that,latitude,longitude,function(){
          wx.stopPullDownRefresh();
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
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    });
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
        loadNotes(that,latitude,longitude,function(){
          setTimeout(function(){
            wx.stopPullDownRefresh();
            that.setData({
              headerDisplayType:"block"
            });
          },1000);
        });
    });
  }
})
