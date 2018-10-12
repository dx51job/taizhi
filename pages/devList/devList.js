// pages/devList/devList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    buildingName: '',
    building: 0,
    floor: 0,
    devList: [],
    action: '',
    opt: '',
    deveui: ''
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
        var wh = (clientHeight - 55) * rpxR;
        that.setData({
          winHeight: wh
        });
        console.log('winHeight: ', that.data.winHeight);
      }
    });

    console.log(options);
    that.setData({
      buildingName: options.buildingName,
      building: options.building,
      floor: options.floor
    });

    //设置导航栏标题
    wx.setNavigationBarTitle({
      title: that.data.buildingName + " " + that.data.floor + "楼"
    })

    //获取教学楼当前楼层的空调信息
    that.getBuildingFloorACInfo(that.data.building, that.data.floor);
  },

  switchChange: function(e) {
    console.log('switch 发生 change 事件，携带值为', e.detail.value);
    if (e.detail.value) {
      this.setData({
        action: 'on',
        opt: '打开'
      });
    } else {
      this.setData({
        action: 'off',
        opt: '关闭'
      })
    }
  },

  switchTap: function(e) {
    var that = this;
    console.log('switch 发生 tap 事件', e.target.dataset.deveui);
    that.setData({
      deveui: e.target.dataset.deveui
    })
    wx.showModal({
      title: '提示',
      content: '即将' + that.data.opt + '编号为' + that.data.deveui + '的空调开关',
      showCancel: true,
      confirmColor: '#38f',
      success: function(res) {
        if (res.confirm) {
            //空调控制命令
          that.ACControl();
        } else if (res.cancel) {
          // 刷新devList，更新开关状态
          var devs = that.data.devList;
          that.setData({
            devList: devs
          });
        }
      }
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

  //获取教学楼当前楼层的空调信息
  getBuildingFloorACInfo: function(building, floor) {
    var that = this;
    var requestdata = JSON.stringify({
      "building": that.data.building,
      "floor": that.data.floor
    });
    wx.request({
      url: getApp().globalData.apiServer + '/data/getBuildingFloorACInfo',
      data: {
        "req": requestdata
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Cookie': getApp().globalData.cookie
      },
      method: 'POST',
      success: function(res) {
        if (res.data.result == 0) {
          // 更新devList，更新开关状态
          that.setData({
            devList: res.data.data
          });
          console.log('buildingFloorACInfo', that.data.devList);
        } else {
          console.log('getBuildingFloorACInfo result !=0');
        }
      },
      fail: function(res) {
        console.log('getBuildingFloorACInfo fail', res);
      },
      complete: function(res) {},
    })
  },

  //空调控制命令
  ACControl:function() {
    var that = this;
    var requestdata = JSON.stringify({
      "building": that.data.building,
      "action": that.data.action,
      "floor": that.data.floor,
      "deveui": that.data.deveui,
    });
    console.log('ACControl requestdata: '+ requestdata );
    wx.request({
      url: getApp().globalData.apiServer + '/action/ACControl',
      data: {
        "req": requestdata
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Cookie': getApp().globalData.cookie
      },
      method: 'POST',
      success: function(res) {
        if(res.data.result == 0) {
          console.log('ACControl', res);
          // 重新获取教学楼当前楼层的空调信息
          that.getBuildingFloorACInfo(that.data.building,that.data.floor);
          wx.showToast({
            title: '操作成功',
            icon:'success',
            duration: getApp().globalData.toastDuration,
            mask: true
          });
        } else {
          console.log('ACControl result !=0', res);
          wx.showToast({
            title: '操作失败',
            image: '/assets/icons/fail.png',
            duration: getApp().globalData.toastDuration,
            mask: true
          });
        }
      },
      fail: function(res) {
        console.log('ACControl fail', res);
        wx.showToast({
          title: '操作失败',
          icon: 'none',
          duration: getApp().globalData.toastDuration,
          mask: true
        });
      },
    })
  }

})