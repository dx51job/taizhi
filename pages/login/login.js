// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    password: '',
  },

  usernameInput: function(e) {
    this.setData({
      username: e.detail.value
    })
  },

  passwordInput: function(e) {
    this.setData({
      password: e.detail.value
    })
  },

  bindNavigation: function(e) {
    if (this.data.username == null || this.data.username.length == 0) {
      wx.showToast({
        title: '账号不能为空！',
        icon: 'none',
        duration: getApp().globalData.toastDuration
      })
      return;
    }
    if (this.data.password == null || this.data.password.length == 0) {
      wx.showToast({
        title: '密码不能为空！',
        icon: 'none',
        duration: getApp().globalData.toastDuration
      })
      return;
    }
    this.login();
  },

  login: function(e) {
    var that = this;
    console.log('username: ' + that.data.username + "  password: " + that.data.password);
    var requestdata = JSON.stringify({
      "username": that.data.username,
      "password": that.data.password
    });
    wx.request({
      url: getApp().globalData.apiServer + '/login',
      method: 'POST',
      data: {
        "req": requestdata
      },
      header: {
        //设置参数内容类型为x-www-form-urlencoded
        'content-type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function(res) {
        console.log(res);
        if (res.data.result == 0) {
          getApp().globalData.username = that.data.username;
          var cookie = res.header['Set-Cookie'];
          // 测试时发现set-cookie大小写有时会变，需作如下处理
          if(typeof(cookie) == "undefined") {
            cookie = res.header['set-cookie'];
          }
          console.log('cookieorigin: ' + cookie);
          cookie = cookie.slice(0, cookie.indexOf(";"));
          getApp().globalData.cookie = cookie;
          console.log('cookie: ' + getApp().globalData.cookie);
          
          wx.setStorageSync('username', that.data.username);
          wx.setStorageSync('password', that.data.password);

          wx.switchTab({
            url: '/pages/homePage/homePage',
          })
        } else {
          wx.showToast({
            title: "登录失败，请检查用户和密码是否正确!",
            icon: 'none',
            duration: getApp().globalData.toastDuration
          })
        }
      },
      fail: function(res) {
        wx.showToast({
          title: "登录失败，请稍后重试!",
          icon: 'none',
          duration: getApp().globalData.toastDuration
        })
      },
      complete: function(res) {},
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      username: wx.getStorageSync('username'),
      password: wx.getStorageSync('password')
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})