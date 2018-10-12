// pages/homePage/homePage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    buildingName: '',
    floor: 0,
    building: 0,
    buildings: [],
    floorArray: [],
    cardarray: [{
      devicon: '/assets/icons/aircon.png',
      devtype: '空调',
      devstatus: 2
    // }, {
    //   devicon: '/assets/icons/light.png',
    //   devtype: '照明',
    //   devstatus: 2
    // }, {
    //   devicon: '/assets/icons/accesscon.png',
    //   devtype: '门禁',
    //   devstatus: 2
    // }, {
    //   devicon: '/assets/icons/monitor.png',
    //   devtype: '监控',
    //   devstatus: 2
    // }, {
    //   devicon: '/assets/icons/switcher.png',
    //   devtype: '开关',
    //   devstatus: 2
    }],
    buildingsMapStatistic: [],
    buildingACInfo: [],
    hiddenSwitchModal: true,
    switchModalTitle: '',
    switchModalSubtitle: ''
  },

  tapCard: function(e) {
    var that = this;
    // 监听卡片点击事件
    var devtype = e.currentTarget.dataset.devtype;
    console.log('tapCard devtype', devtype);
    switch (devtype) {
      case '空调':
        if (that.data.floor != 0) {
          wx.navigateTo({
            url: '/pages/devList/devList?buildingName=' + that.data.buildingName + '&building=' + that.data.building + '&floor=' + that.data.floor
          })
        }
        break;
      default:
        break;
    }

    // 监听开关点击事件
    var switchtype = e.currentTarget.dataset.switchtype;
    console.log('tapCard switchtype', switchtype);
    switch (switchtype) {
      case '空调':
        console.log('点击空调开关');
        console.log('buliding: ' + that.data.building + ' buildingName: ' + that.data.buildingName + ' floor: ' + that.data.floor + ' switchtype: ' + switchtype);
        // 设置switchModal弹框标题
        var modalTitle = that.data.buildingName;
        if (that.data.floor != 0) {
          modalTitle = that.data.buildingName + ' ' + that.data.floor + '楼';
        }

        that.setData({
          hiddenSwitchModal: false,
          switchModalTitle: modalTitle,
          switchModalSubtitle: switchtype
        });
        break;
      default:
        break;
    }
  },

  // switchModal内点击全部打开按钮
  switchModalTapSwitchOn: function() {
    var that = this;
    console.log('switchModalTapSwitchOn');
    that.setData({
      hiddenSwitchModal: true,
    });

    that.ACControl('on').then(function() {
        // 重新获取各大楼信息
        return that.getBuildingsMapStatistics();
      })
      .then(function() {
        // 更新页面开关状态
        if (that.data.floor == 0) {
          //如果选择整栋楼，查看整栋空调是否全开或全关或部分开
          that.checkBuildingAC();
        } else {
          //如果选择某一楼层，更新选中教学楼选中楼层的空调状态
          that.refreshFloorACstatus();
        }
      });
  },

  // switchModal内点击全部关闭按钮
  switchModalTapSwitchOff: function() {
    var that = this;
    console.log('switchModalTapSwitchOff');
    that.setData({
      hiddenSwitchModal: true,
    });

    that.ACControl('off').then(function() {
        // 重新获取各大楼信息
        return that.getBuildingsMapStatistics();
      })
      .then(function() {
        // 更新页面开关状态
        if (that.data.floor == 0) {
          //如果选择整栋楼，查看整栋空调是否全开或全关或部分开
          that.checkBuildingAC();
        } else {
          //如果选择某一楼层，更新选中教学楼选中楼层的空调状态
          that.refreshFloorACstatus();
        }
      });
  },

  // 将「确定」分支改成取消操作
  switchModalConfirm: function() {
    var that = this;
    that.setData({
      hiddenSwitchModal: true
    });


    // 重新获取各大楼信息
    that.getBuildingsMapStatistics().then(function() {

      // 更新页面开关状态
      if (that.data.floor == 0) {
        //如果选择整栋楼，查看整栋空调是否全开或全关或部分开
        that.checkBuildingAC();
      } else {
        //如果选择某一楼层，更新选中教学楼选中楼层的空调状态
        that.refreshFloorACstatus();
      }

    });
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
        var wh = (clientHeight - 50) * rpxR;
        var ch = (clientHeight - 90) * rpxR;
        that.setData({
          winHeight: wh,
          contentHeight: ch
        });
        console.log('winHeight: ', that.data.winHeight, ' contentHeight: ', that.data.contentHeight);
      }
    });


    // 用户权限查询
    that.userAuthQuery().then(function() {
      // 获取各大楼信息
      return that.getBuildingsMapStatistics();
    }).then(function() {
      // van-tabs默认选中第一个tab标签页，触发选中对应大楼操作，显示开关状态
      var buildings = that.data.buildings;
      console.log('onLoad tab[0] buildingName', buildings[0].buildingName);
      var e = {
        detail: {
          index: 0,
          title: buildings[0].buildingName
        }
      };
      console.log('onLoad tab[0] e', e);
      // 触发选中对应大楼操作，显示开关状态
      that.buildingSelected(e);
    });

  },

  // 升序排序
  sortNumber: function(a, b) {
    return a - b
  },

  //选中大楼
  buildingSelected: function(e) {
    console.log('选中教学楼：', e);
    var arr = this.data.buildings;
    for (let i of arr) {
      if (i.buildingName === e.detail.title) {
        // 获取选中大楼的各楼层空调信息
        console.log('选中教学楼building值：' + i.building + ' buildingName: ' + i.buildingName);
        this.getBuildingACInfo(i.building);

        // 选中教学楼设置显示楼层
        // var floorArr = ['整栋'];
        var floorArr = ['楼层'];
        var floors = i.floors.sort(this.sortNumber);
        for (let floorNum of floors) {
          floorArr.push(floorNum + '楼');
        }
        this.setData({
          buildingName: i.buildingName,
          building: i.building,
          floorArray: floorArr,
          floor: 0 // 选中教学楼后，楼层选择自动复原为"整栋"
        });
        // 查看默认"整栋"空调是否全开或全关或部分开
        this.checkBuildingAC();
      }
    }
  },

  // 选中楼层
  bindFloorChange: function(e) {
    this.setData({
      floor: e.detail.value
    })
    console.log('选择楼层，携带值为', this.data.floor);

    // 更新页面开关状态
    if (this.data.floor == 0) {
      //如果选择整栋楼，查看整栋空调是否全开或全关或部分开
      this.checkBuildingAC();
    } else {
      //如果选择某一楼层，更新选中教学楼选中楼层的空调状态
      this.refreshFloorACstatus();
    }
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
    var that = this;


    if (that.data.building != 0) {
      // 获取选中大楼的各楼层空调信息
      that.getBuildingACInfo(that.data.building).then(function() {
        // 更新选中教学楼选中楼层的空调状态
        that.refreshFloorACstatus();
      });
    }

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

  // 用户权限查询
  userAuthQuery: function(e) {
    var that = this;
    return new Promise(function(resolve, reject) {

      var requestdata = JSON.stringify({
        "username": getApp().globalData.username,
      });
      wx.request({
        url: getApp().globalData.apiServer + '/userAuthQuery',
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
          // console.log('userAuthQuery success', res.data);
          if (res.data.result == 0) {
            var auth = res.data.auth;
            that.setData({
              buildings: auth
            });
            console.log('userAuthQuery buildings', that.data.buildings);
            resolve();
          } else {
            console.log('userAuthQuery result !=0');
          }
        },
        fail: function(res) {
          console.log('userAuthQuery fail', res);
        },
        complete: function(res) {},
      })

    });
  },

  // 获取各大楼信息
  getBuildingsMapStatistics: function(e) {
    var that = this;
    return new Promise(function(resolve, reject) {

      wx.request({
        url: getApp().globalData.apiServer + '/data/getBuildingsMapStatistics',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Cookie': getApp().globalData.cookie
        },
        method: 'GET',
        success: function(res) {
          if (res.data.result == 0) {
            that.setData({
              buildingsMapStatistic: res.data.buildings
            });
            console.log('buildingsMapStatistic', that.data.buildingsMapStatistic);
            resolve();
          } else {
            console.log('getBuildingsMapStatistics result !=0');
          }
        },
        fail: function(res) {
          console.log('getBuildingsMapStatistics fail', res);
        },
        complete: function(res) {},
      })

    });
  },

  // 获取选中大楼的各楼层空调信息
  getBuildingACInfo: function(building) {
    var that = this;
    var requestdata = JSON.stringify({
      "building": building,
    });
    return new Promise(function(resolve, reject) {

      wx.request({
        url: getApp().globalData.apiServer + '/data/getBuildingACInfo',
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
            that.setData({
              buildingACInfo: res.data.data
            });
            console.log('buildingACInfo', that.data.buildingACInfo);
            resolve();
          } else {
            console.log('getBuildingACInfo result !=0', res);
          }
        },
        fail: function(res) {
          console.log('getBuildingACInfo fail', res);
        },
        complete: function(res) {},
      })

    });
  },

  //查看整栋空调是否全开或全关或部分开
  checkBuildingAC: function() {
    var arr2 = this.data.buildingsMapStatistic;
    arr2 = arr2.filter(item => item.buildingName === this.data.buildingName);
    console.log('arr2[0] ', arr2[0]);

    var cardarr2 = this.data.cardarray;
    for (let card2 of cardarr2) {
      if (card2.devtype === '空调') {

        if (arr2[0].airConditionerNum === arr2[0].openingACNum) {
          // 整栋空调全开
          card2.devstatus = 1;
        } else if (arr2[0].airConditionerNum === arr2[0].closedACNum) {
          // 整栋空调全关
          card2.devstatus = 0;
        } else {
          // 整栋空调部分开
          card2.devstatus = 2;
        }
      }
    }
    this.setData({
      cardarray: cardarr2
    })
  },

  // 更新选中教学楼选中楼层的空调状态
  refreshFloorACstatus: function() {
    //如果选择某一楼层，查看该楼层开关状态
    var buildingAC = this.data.buildingACInfo;
    // 判断buildingACInfo数组是否为空
    if (buildingAC.length != 0) {
      //当前楼层空调开关状态
      for (let l of buildingAC) {
        if (l.floor == this.data.floor) {
          var cardarr3 = this.data.cardarray;
          for (let card3 of cardarr3) {
            if (card3.devtype === '空调') {
              card3.devstatus = l.status;
            }
          }
          this.setData({
            cardarray: cardarr3
          })
          console.log('refreshFloorACstatus，更新cardarray:', this.data.cardarray);
        }
      }
    } else {
      console.log('buildingACInfo数组当前为空');
    }
  },

  //空调控制命令
  ACControl: function(action) {
    var that = this;
    var requestdata = JSON.stringify({
      "building": that.data.building,
      "action": action,
      "floor": that.data.floor,
    });
    // 如果是整栋楼，requestdata里没有"floor"
    if (that.data.floor == 0) {
      requestdata = JSON.stringify({
        "building": that.data.building,
        "action": action,
      });
    }
    console.log('homePage ACControl requestdata: ' + requestdata);

    return new Promise(function(resolve, reject) {

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
          if (res.data.result == 0) {
            console.log('homePage ACControl', res);
            wx.showToast({
              title: '操作成功',
              icon: 'success',
              duration: getApp().globalData.toastDuration,
              mask: true
            });
            resolve();
          } else {
            console.log('homePage ACControl result !=0', res);
            wx.showToast({
              title: '操作失败',
              image: '/assets/icons/fail.png',
              duration: getApp().globalData.toastDuration,
              mask: true
            });
          }
        },
        fail: function(res) {
          console.log('homePage ACControl fail', res);
          wx.showToast({
            title: '操作失败',
            icon: 'none',
            duration: getApp().globalData.toastDuration,
            mask: true
          });
        },
      })

    });
  }

})