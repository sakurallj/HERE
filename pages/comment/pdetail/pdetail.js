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
    currentImageIndex:1,//当前图片
    totalImage:0,//图片总数
    scrollLeft:0,//向左滑动的距离
    isShowLoadMore:false,
    images:[],
    showImages:[],
    isShowTypewriting:false,//是否展示输入法
    id:"",//纸条id
    app:app,
    bodyBgColor:"auto",
    bodyHeight:"100%",
    commentInputValue:"",
    placeholder:"写点什么~",
    focus:false,
    initInputValue:"",
    isFirstLoadEmpty:false,
    lastScrollDetail:{},//上次滚动的信息
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
        var images=[],showImages=[], len = res.data.data.photos?res.data.data.photos.length:0;
        for(var i=0;i<len;i++){
          images[i]=res.data.data.photos[i].fdURL ;
          showImages[i] = {
            url:res.data.data.photos[i].fdURL ,
            isShow:false
          }
        }
        res.data.data.meter = options.meter||options.meter==0?options.meter:'';
        res.data.data.nickName = res.data.data.nickName ?res.data.data.nickName :"";
        res.data.data.avatar = res.data.data.avatar ?res.data.data.avatar :app.globalData.defaultHeader;
        that.setData({
          message:res.data.data,
          totalImage:len,
          images:images,
          showImages:showImages
        });
        getResp(that,function(res){
          wx.hideToast();
          that.setData({
            isFirstLoadEmpty:res.data.data&&res.data.data.length==0
          });
          if(res.data.data&&res.data.data.length==0){
            that.setData({
              bodyBgColor:"#fff",
              bodyHeight:app.getSystemInfo().windowHeight+"px"
            });
          }
        });
        wx.hideNavigationBarLoading();
      }
    });
  },
  onReady:function(){
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
  previewImages:function(event){
    var index = app.getValueFormCurrentTargetDataSet(event,"imgIndex");
    wx.previewImage({
      current: this.data.images[index]?this.data.images[index]:"", // 当前显示图片的http链接
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
          wx.showToast({
            title: '回应成功',
            icon: 'success',
            duration: 2000
          });
        
          that.setData({
            placeholder:"写点什么~",
            focus:false,
            isReplyResp:false,
            currentResp:{},
            initInputValue:"",
            bodyBgColor:"auto",
            bodyHeight:"auto",
            commentInputValue:""
          });
          
          
        }
      });
    });
  },
  clickRespContent:function(event){
    var resp = app.getValueFormCurrentTargetDataSet(event,"resp");
    var currentResp = this.data.currentResp;
    console.log(resp);
    if(!currentResp||currentResp.id!=resp.id){
      this.setData({
        placeholder:"@"+resp.author,
        focus:true,
        isReplyResp:true,
        currentResp:resp,
        initInputValue:""
      });
    }
    else if(currentResp.id==resp.id){
      this.setData({
        placeholder:"写点什么~",
        focus:false,
        isReplyResp:false,
        currentResp:{},
        initInputValue:""
      });
    }
  },
  clickHeader:function(event){
    var sOpenId = app.getValueFormCurrentTargetDataSet(event,"sopenid");
    var message = this.data.message;
    wx.navigateTo({
      url: '/pages/person/detail/detail?sOpenId='+sOpenId+"&nickName="+message.nickName+"&avatar="+message.avatar
    });
  },
  clickRespItem:function(){
    this.setData({
      placeholder:"写点什么~",
      focus:false,
      isReplyResp:false,
      currentResp:{},
      initInputValue:""
    });
  },
  swiperChange:function(event){
    console.log(event);
    this.setData({
      currentImageIndex:event.detail.current+1
    });
  },
  imageError:function(event){
    console.log(event);
  },
  loaded:function(event){
    var index = app.getValueFormCurrentTargetDataSet(event,"imgIndex");
    console.log(index);
    var showImages = this.data.showImages;
    if(showImages[index]){
      console.log(showImages[index]);
      showImages[index].isShow = true;
      console.log(showImages[index]);
      this.setData({
        showImages:showImages
      });
    }
  },
  scroll:function(res){
    console.log(res);
  },
  bindBlur:function(){
    this.setData({
      isShowTypewriting:false
    });
  },
  bindfocus:function(){
    this.setData({
      isShowTypewriting:true
    });
  }
});