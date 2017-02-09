// pages/person/detail/detail.js
var app = getApp();
function loadNotes(that){
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
      var data = res.data.data,length = data.length,
      coloums1Heigth=that.data.notes.coloums1Heigth,
      coloums2Heigth=that.data.notes.coloums2Heigth,
      coloums1=that.data.notes.coloums1,
      coloums2=that.data.notes.coloums2;           
      for(var i=0;i<length;i++){
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
        note.displayType = "block";
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
      console.log(that.data.notes);
      wx.hideToast();
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
    isShowLoadMore:false,
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
        nickName=nickName?nickName:app.globalData.nickName;
        avatar=avatar?avatar:app.globalData.avatarUrl;
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
  loadMore:function(){
    loadNotes(this);
  }
})