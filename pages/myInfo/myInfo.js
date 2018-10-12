// pages/myInfo/myInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    //高度自适应（rpx）
    wx.getSystemInfo({
      success: function(res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth; //比例
        var wh = (clientHeight - 212) * rpxR;
        var ch = (clientHeight - 228) * rpxR;
        that.setData({
          winHeight: wh,
          contentHeight: ch
        });
        console.log('winHeight: ', that.data.winHeight, ' contentHeight: ', that.data.contentHeight);
      }
    });

    //获取用户名
    this.setData({
      username: getApp().globalData.username
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

  },

  // 退出登录提示
  logoutModal: function() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '即将退出登录',
      showCancel: true,
      cancelColor:'#38f',
      confirmColor: '#ee5327',
      success: function(res) {
        if (res.confirm) {
          // 退出登录
          that.logout();
        } else if (res.cancel) {
          return;
        }
      },
    })

  },

  // 退出登录
  logout: function() {
    wx.request({
      url: getApp().globalData.apiServer + '/logout',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Cookie': getApp().globalData.cookie
      },
      method: 'POST',
      success: function(res) {
        console.log('logout', res);
        // 关闭所有页面,重新到欢迎界面
        wx.reLaunch({
          url: '/pages/welcome/welcome'
        })
      },
      fail: function(res) {
        console.log('logout', res);
      }
    })
  }

})