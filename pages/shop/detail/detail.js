// pages/shop/detail/detail.js
var app = getApp();

function loadNotes(that){
  that.pageNum+=1;
  var data = {
    token:app.globalData.userToken,
    page:that.pageNum,
    partnerid:that.data.shop.id,
    lng:app.globalData.location.longitude,
    lat:app.globalData.location.latitude
  },data = app.getAPISign(data);
  console.log(data);
  //获得首页数据
  wx.request({
    url:app.globalData.url.api.pInfoList,
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
        isShowLoadMore:res.data.more&&res.data.more==1
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
    shop:{
      name:"",
      image:"",
      id:""
    },
    rawNotes:[],
    isShowLoadMore:false
  },
  pageNum:0,
  onLoad:function(options){
    //清楚残余的上次发表的纸条
    wx.removeStorageSync('comment_edit_message');
    console.log(options);
    var shop = this.data.shop;
    shop.name = options.name;
    shop.image = options.image;
    shop.id = options.id;
    if(options.name){
      wx.setNavigationBarTitle({
        title: options.name
      });
    }
    this.setData({
       shop:shop
     });
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    });
    app.doLogin(function(){
      app.getLocation(function(res){
        loadNotes(that);
      });
    });
  },
  onReady:function(){
 
  },
  onShow:function(){
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
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  previewEnvImages:function(event){
    var index = app.getValueFormCurrentTargetDataSet(event,"envImgIndex");
    wx.previewImage({
      current: this.data.images[index]?this.data.images[index]:"", // 当前显示图片的http链接
      urls: this.data.images // 需要预览的图片http链接列表
    });
  },
  gotoMap:function(){
    wx.navigateTo({
      url: '/pages/shop/map/map?shop='+JSON.stringify(this.data.shop)
    });
  },
  callPhone:function(){
    wx.makePhoneCall({
      phoneNumber: this.data.shop.phone
    });
  },
  clickEdit:function(){
    wx.navigateTo({
      url: '/pages/comment/edit/edit?shopId='+this.data.shop.id
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
  }
})