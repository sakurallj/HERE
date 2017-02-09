//index.js
//获取应用实例
var app = getApp();
function loadNotes(that,latitude,longitude){
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
    lng:longitude
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
    },
    success: function(res) {
      console.log(res);
      var data = res.data.data;
      var length = data.length,
      coloums1Heigth=that.data.notes.coloums1Heigth,
      coloums2Heigth=that.data.notes.coloums2Heigth,
      coloums1=that.data.notes.coloums1,
      coloums2=that.data.notes.coloums2;           
      for(var i=0;i<length;i++){
        //note 结构
        //"id": "195", 
        //"content": "116", 
        //"longitude": "113.260572", 
        //"latitude": "23.135633", 
        //"addTime": "1486307788", 
        //"fdNoteOpenID": "5717368126", 
        //"nickName": "9527", 
        //"avatar": "http://900here.com/var/uploads/upload/1486092461_36567.jpg",
        //"photo": null, 
        //"commentnum": "0"
        var note = data[i];
        if(note.content&&note.content.indexOf("\\u")>=0){
            note.content = app.util.decodeUTF8(note.content);
        }
        var textHeight = 0;
        if(note.content){
          var rawLen = note.content.length
            ,ascllLen = app.util.getAscllLength(note.content);
          var trueLen = rawLen-ascllLen+Math.ceil(ascllLen/2);
          var line = Math.ceil((trueLen*28)/304);
          textHeight = line*44;
        }
        if(coloums1Heigth<=coloums2Heigth){
          coloums1.push(note);
          if(note.photo){
            coloums1Heigth+=150;//图片高度
          }
          coloums1Heigth+= textHeight+119;//119为item最小高度 textHeight为文字高度
        }
        else{
          coloums2.push(note);
          if(note.photo){
            coloums2Heigth+=150;
          }
          coloums2Heigth+= textHeight+119;
        }
      }
      that.setData({
        notes:{
          coloums1:coloums1,
          coloums2:coloums2,
          coloums1Heigth:coloums1Heigth,//列高
          coloums2Heigth:coloums2Heigth//列高
        },
        isShowLoadMore:res.data.more&&res.data.more==1
      });
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
    isShowLoadMore:false
  },
  pageNum:0,
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onShow:function(){
    //在最上边添加msg
    var msg = wx.getStorageSync('comment_edit_message');
    console.log(msg);
    //清空msg缓存
    wx.removeStorage({
      key: 'comment_edit_message',
      success: function(res) {} 
    });
  },
  onLoad: function () {
    
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
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        var speed = res.speed;
        var accuracy = res.accuracy;
        app.globalData.location = res;
        loadNotes(that,latitude,longitude);
      },
      fail:function(){

      }
    });
    
  },
  clickEdit:function(){
    wx.navigateTo({
      url: '/pages/comment/edit/edit'
    });
  },
  clickItem:function(event){
    if(event.currentTarget&&event.currentTarget.dataset&& event.currentTarget.dataset.type){
      if(event.currentTarget.dataset.type=="shop"){
        wx.navigateTo({
          url: '/pages/shop/detail/detail'
        });
      }
      else{
        var itemId = app.getValueFormCurrentTargetDataSet(event,"itemId");
        wx.navigateTo({
          url: '/pages/comment/pdetail/pdetail?id='+itemId
        });
      }
    }
    wx.navigateTo({
      url: '/pages/comment/pdetail/pdetail'
    });
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
  }
})
