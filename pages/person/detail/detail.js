// pages/person/detail/detail.js
var app = getApp();
function loadNotes(that,callback){
  that.pageNum+=1;
  app.doLogin(function(res){
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
          isLoadEmpty:isLoadEmpty,
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
    notes:{
      coloums1:[],
      coloums2:[],
      coloums1Heigth:0,//列高
      coloums2Heigth:0//列高
    },
    userInfo:{

    },
    isFirstLoadEmpty:false,
    isLoadEmpty:false,
    svColumnHeight:false,
    rawNotes:[],
    hasMore:false,
    isMy:false//是否 我的动态
  },
  isRefresh:false,
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
          title: '我的纸条'
        });
        that.setData({
          isMy:true,
        });
        nickName=nickName?nickName:app.globalData.userInfo.nickName;
        avatar=avatar?avatar:app.globalData.userInfo.avatarUrl?app.globalData.userInfo.avatarUrl:app.globalData.defaultHeader;
      }
      else{
        wx.setNavigationBarTitle({
          title: 'TA的纸条'
        });
      }
      that.setData({
        userInfo:{
          nickName:nickName,
          avatarUrl:avatar?avatar:app.globalData.defaultHeader,
          sOpenId:sOpenId
        }
      });
      console.log(app.globalData.userInfo);
      loadNotes(that,function(res){
        that.setData({
          isFirstLoadEmpty:res.data.data&&res.data.data.length==0
        });
      });
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
    var that = this;
    wx.showModal({
      title: '',
      content: '确定删除吗？',
      confirmColor:app.globalData.confirmColor,
      success: function(res) {
        if (res.confirm) {
           wx.showToast({
              title: '删除中',
              icon: 'loading',
              duration: 10000
          });
          
          var id = app.getValueFormCurrentTargetDataSet(event,"id");
          var index = app.getValueFormCurrentTargetDataSet(event,"index");
          var columnNum = app.getValueFormCurrentTargetDataSet(event,"columnNum");
          console.log(index);console.log(columnNum);
          var data = {
            token:app.globalData.userToken,
            id:id
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
              
              var notes =  that.data.notes;
              if(columnNum==1){
                if(notes.coloums1[index]){
                  notes.coloums1[index].isShow = false;
                }
              }
              else if(columnNum==2){
                if(notes.coloums2[index]){
                  notes.coloums2[index].isShow = false;
                }
              }
              that.setData({
                notes:notes
              });
              wx.hideToast();
            }
          });
        }
      }
    })
    
  },
  clickItem:function(event){
    if(event.currentTarget&&event.currentTarget.dataset&& event.currentTarget.dataset.type){
      var item = app.getValueFormCurrentTargetDataSet(event,"item");
      wx.navigateTo({
        url: '/pages/comment/pdetail/pdetail?id='+item.id+"&meter="+item.meter
      });
    }
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
    this.isRefresh=true;
    this.pageNum=0;
  
    var that = this;
    wx.showNavigationBarLoading();
    //获得用户信息
    //调用登录接口
    app.doLogin(function(){
      loadNotes(that,function(){
        that.isRefresh=false;
        wx.stopPullDownRefresh();
      });
    });
    
  },
  onReachBottom:function(){
    if(!this.data.isLoadEmpty){
      loadNotes(this);
    }
  },
  loaded:function(event){
    app.util.notesPhotoLoaded(this,app,event);
  }
})