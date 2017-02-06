//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null
  },
  //获得当前点击元素的dataset value by key
  getValueFormCurrentTargetDataSet:function(event,key){
    if(event.currentTarget&&event.currentTarget.dataset ){
      return  event.currentTarget.dataset[key];
    }
    else{
      return null;
    }
  },
  //把数组转换为  key=value&key1=value1...
  buildQuery:function(query){
    var str = "",i=0;
    for(var k in query){
      if(i=0){
        str+=k+"="+query["k"];
      }
      else{
        str+="&"+k+"="+query["k"];
      }
    }
    return str;
  }
})