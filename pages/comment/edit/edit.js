var bMap = require('../../lib/baidu/bmap-wx.min.js'); 
var app = getApp();
//保存服务端图片的路径
var serverImagePaths = []; 
/**
 * 上传图片
 */
function uploadImages(images,callback){
  if(images.length>0){
     
    var imagePath = images.shift();
    wx.uploadFile({
      url: app.globalData.url.api.uploadImage+"?token="+app.globalData.userToken, 
      filePath:imagePath,
      name: 'avatar',
      
      formData:{
      },
      success: function(res){
        console.log(res);
        var data = res.data?JSON.parse(res.data):[];
        serverImagePaths[serverImagePaths.length] = data.data;
        
        return uploadImages(images,callback);
      },
      fail:function(res){
        console.log(res);
      }
    });
  }
  else{
    if(typeof callback == "function")callback(serverImagePaths);
    return 1;
  }
}
function hasBadWordCallback(app,that,message,res){
  console.log(res);
  if(res.code==0){
    sendMessage(that,message);
  }
  else{
    if(res.code==-10002){//包含政治、民族安全 包含黄赌毒枪支弹药 敏感 
      that.setData({
        isSending:false
      });
      wx.hideToast();
      wx.showModal({
        title: '',
        content: '纸条内容包含敏感关键词，请修改后重新发布',
        showCancel:false,
        confirmText:"我知道了",
        confirmColor:app.globalData.confirmColor,
        success: function(res) {}
      });
      return;

    }
    else{//普通敏感
      
      wx.hideToast();
      wx.showModal({
        title: '',
        content: '乱贴牛皮癣会扰乱社区秩序，是不道德行为，你确定你贴的纸条不是牛皮癣吗？',
        showCancel:true,
        cancelText:"修改一下",
        confirmText:"仍然发布",
        confirmColor:app.globalData.confirmColor,
        success: function(res) {
          if(res.confirm){
            sendMessage(that,message);
          }
          else{
            that.setData({
              isSending:false
            });
          }
        }
      });
      return;
    }

  }
}
function sendMessage(that,message){
  
  serverImagePaths = [];//serverImagePaths是此js的全局变量，这里要清空 服务端图片的路径 如果不清空会把上次发表的图片也加进来
  app.doLogin(function(){
     
    uploadImages(message.images,function(images){
    
      var data={
        token:app.globalData.userToken,
        imageUrls:JSON.stringify(images),
        latitude:message.address.latitude,
        longitude:message.address.longitude,
        address:message.address.name
        
        , wxapp:1
        ,fdPartnerID:that.data.shopId?that.data.shopId:""
      },rawData=data;

      data = app.getAPISign(data); 
      data.content = app.util.formatContentForServer(message.content);
      wx.request({
        url:app.globalData.url.api.addNote+"?token="+app.globalData.userToken+"&imageUrls="+JSON.stringify(images)+"&latitude="+message.address.latitude+"&longitude="+message.address.longitude+"&address="+message.address.name+"&wxapp=1&fdPartnerID="+data.fdPartnerID+"&pos="+data.pos+"&key="+data.key+"&sign="+data.sign ,
        method:"POST",
        data:data,
        header: {  
          "Content-Type": "application/x-www-form-urlencoded"  
        }, 
        fail:function(res){
          console.log(res);
          that.setData({
            isSending:false
          });
        },
        success: function(res) {
          console.log(res);
          if(res.data.errcode==1002){//登录过期重新登录后再发布
            console.log(res);
          }
          else{
            console.log(11212221);
            rawData.id = res.data.id;
            /**
             * 截取部分内容数组，数组太长会导致缓存保存失败
             */
            var cLen = typeof res.data.contentar == "object"?res.data.contentar.length:0;
            if(cLen>60){
              res.data.contentar = res.data.contentar.splice(0,cLen>60?60:cLen);
              console.log(res.data.contentar);
            }
            rawData.contentar =res.data.contentar;
            rawData.content =message.content;
            rawData.meter = app.util.formatDistance(app.util.getPonitToPointDistance(
              message.address.latitude,
              message.address.longitude,
              app.globalData.location.latitude,
              app.globalData.location.longitude
            ));
            console.log("rawData");
            console.log(rawData);
            wx.setStorageSync("comment_edit_message",rawData);
            console.log("rawData");
            that.setData({
              isSending:false
            });
            wx.hideToast();
            if(that.data.isShare){
              wx.redirectTo({
                url: '/pages/index/index'
              });
            }
            else{
              wx.navigateBack();
            }
            
          }
        }
      });
    });
  });
}
Page({
  data:{
    isSending:false,
    message:{
      id:"",
      content:"",
      images:[],
      addressShow:0,// 0 不显示  1显示
      address:{
        name:"请选择位置",
        address:"",
        latitude:"",
        longitude:""
      }
    },
    shopId:""
  },
  onLoad:function(options){
    var that = this;
    this.setData({
      isShare:options.isShare==1
    });
    var BMap = new bMap.BMapWX({ 
        ak: app.globalData.bMapAK
    }); 
    BMap.regeocoding({ 
        fail: function(res){
          console.log(res);
        }, 
        success: function(res){
          console.log(res);
          var message = that.data.message;
          if(res.originalData&&res.originalData.result){
            var result = res.originalData.result;
            if(result.poiRegions&&result.poiRegions.length>0){
                message.address.name = result.poiRegions[0].name;
            }
            else if(result.addressComponent&&result.addressComponent.street){
              message.address.name = result.addressComponent.street;
            }
            if(result.formatted_address){
              message.address.address = result.formatted_address;
            }
            that.setData({
              message:message
            });
          }
        }
    }); 
    // 页面初始化 options为页面跳转所带来的参数
    if(options.shopId){
      this.setData({
        shopId:options.shopId
      });
    }
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
  chooseImage:function(){
    var that = this,isSending = this.data.isSending;
    if(isSending){
      return;
    }
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: [  'compressed'],
      success: function (res) {
        console.log(res);
        var tempFilePaths = res.tempFilePaths;
        var m = that.data.message;
        console.log(tempFilePaths);
        m.images=tempFilePaths;
        that.setData({
          message:m
        });
        console.log(that.data.message);
      }
    })
  },
  chooseLocation:function(){
    var that = this;
    wx.chooseLocation({
      success:function(res){
        console.log(res);
        var m = that.data.message;
        m.address = res;
        that.setData({
          message:m
        });
        console.log(that.data.message);
      },
      cancel:function(res){
        console.log(res);
      },
      fail:function(res){
        console.log(res);
      }
    });
  },
  inputMsg:function(event){
     var m = this.data.message;
      m.content = event.detail.value;
      this.setData({
        message:m
      });
  },
  previewImages:function(event){
    var index = app.getValueFormCurrentTargetDataSet(event,"imgIndex");
    wx.previewImage({
      current: this.data.message.images[index]?this.data.message.images[index]:"", // 当前显示图片的http链接
      urls: this.data.message.images // 需要预览的图片http链接列表
    });
  },
  //贴纸片
  sendMessage:function(){
    var that = this,message = that.data.message;
    that.setData({
      isSending:true
    });
    console.log(message);
     //数据校验
    //判断是否有图片或评论
    message.content = app.util.trim(message.content);
    if(!message.content){
      that.setData({
        isSending:false
      });
      wx.showModal({
        title: '',
        content: '贴空白纸条是没有意义的，请先写好内容~',
        showCancel:false,
        confirmColor:app.globalData.confirmColor,
        success: function(res) {
        }
      });
      
      return;
    }
 
 
    //判断是否选择了位置
    if(!message.address.longitude){
      app.getLocation(function(res){
        message.address.latitude=res.latitude;
        message.address.longitude=res.longitude;
        app.util.hasBadWord(app,message.content,function(res){
          hasBadWordCallback(app,that,message,res);
        });
        
      });
    }
    else{
      app.util.hasBadWord(app,message.content,function(res){
        hasBadWordCallback(app,that,message,res);
      });
    }
  },
  onShareAppMessage: function () {
    var options = this.data.onLoadOptions;
    return {
      title:  '写张纸条，留给别人看看',
      path: 'pages/comment/edit/edit?isShare=1'
    }
  }
})