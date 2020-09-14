const { getLocation, getUserInfo } = require('./utils/util');

//app.js
App({
  onLaunch: async function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: async res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    });

    // 获取用户信息
    wx.getSetting({
      success: async res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          const userInfo = await getUserInfo(); 
          
          this.globalData.userInfo = userInfo
          await this.getExtInfo();

          // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          // 所以此处加入 callback 以防止这种情况
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(res)
          }
        } else {
          wx.authorize({
            scope: 'scope.userInfo'
          });
        }

        if (res.authSetting['scope.userLocation']) {
          const res = await getLocation();
          this.globalData.location = res;
        } else {
          wx.authorize({
            scope: 'scope.userLocation'
          });
        }
      }
    });
    // wx.cloud.DYNAMIC_CURRENT_ENV
    wx.cloud.init({
      env: 'dev-za11t'
    });
  },
  getExtInfo: async function () {
    const db = wx.cloud.database();
    let userInfo = (await db.collection('userInfo').get()).data[0];
    if (!userInfo) {
      const res = await getLocation();
      await db.collection('userInfo').add({
        data: {
          location: DB.GeoPoint(res.latitude, res.latitude),
          address: res.name,
          name: this.globalData.userInfo.nickName,
          type: 'normal',
          balance: 0
        }
      });
      userInfo = (await db.collection('userInfo').get()).data[0];
      this.globalData.userInfo.extInfo = userInfo;
    }
    this.globalData.userInfo.extInfo = userInfo;
  },
  globalData: {
    userInfo: null,
    orders: []
  }
})