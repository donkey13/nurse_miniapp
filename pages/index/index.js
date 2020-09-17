//index.js
const { getLocation } = require('../../utils/util');
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    latitude: 34.37,
    longitude: 107.13,
    markers: [],
    hasOther: false,
    selectedNurse: {},
  },
  onLoad: async function () {
    if (app.globalData.userInfo) {
      await this.checkNurse();
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = async res => {
        await this.checkNurse();
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      const userInfo = await getUserInfo();
      app.globalData.userInfo = userInfo
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
      await this.getNurse();
    }
  },
  onShow: async function () {
    if (app.globalData.userInfo) {
      await this.checkNurse();
    }
  },
  getUserInfo: async function (e) {
    app.globalData.userInfo = e.detail.userInfo
    await app.getExtInfo();
    await this.checkNurse();
  },
  async checkNurse() {
    if (app.globalData.userInfo.extInfo.type === 'nurse') {
      wx.redirectTo({
        url: '../nurse/index',
      })
    } else {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });

      let location = app.globalData.userInfo.extInfo.location;
      if (!location) {
        const res = await getLocation();
        location = DB.GeoPoint(res.longitude, res.latitude);
        app.globalData.userInfo.extInfo.location = location;
        const db = wx.cloud.database();
        db.collection('userInfo')
          .where({ _id: app.globalData.userInfo.extInfo._id })
          .update({
            data: {
              location,
              address: res.name,
            }
          })
          .then();
      }
      this.setData({
        longitude: location.longitude,
        latitude: location.latitude
      });

      await this.getNurse();
    }
  },
  getNurse: async function () {
    const db = wx.cloud.database();
    const _ = db.command
    const userCollection = db.collection('userInfo');
    this.nurses = (await db.collection('nurse').where({ status: _.eq('available') }).get()).data;
    const markers = [];
    let i = 0;
    for (const nurse of this.nurses) {
      const ui = (await userCollection.where({ _openid: _.eq(nurse._openid) }).get()).data[0];
      nurse.userInfo = ui;
      markers.push({
        id: i,
        latitude: ui.location.latitude,
        longitude: ui.location.longitude,
        label: { content: nurse.userInfo.name },
        width: 40,
        height: 40,
        iconPath: '/images/care.png'
      });
      i++;
    }
    this.setData({
      markers: markers
    });
  },
  markertap: function (e) {
    const marker = this.data.markers[e.markerId];
    const nurse = this.nurses[e.markerId];
    this.setData({ selectedNurse: nurse });
    wx.showModal({
      title: nurse.userInfo.name,
      content: `评价：${nurse.rate || '0'} 体检：${nurse.health || '无'} 心理测试：${nurse.psychological || '无'} 从业年限：${nurse.hireDate || '无'}`,
      showCancel: false
    });
  },
  tapusersetting: function (e) {
    wx.navigateTo({
      url: './settings',
    });
  },
  tapTemp: function (e) {
    wx.navigateTo({
      url: './tempservice',
    });
  },

  tapContract: function (e) {
    wx.navigateTo({
      url: './contract',
      success: res => {
        res.eventChannel.emit('selected-nurse', this.data.selectedNurse);
      }
    });
  },
  tabRegister(e) {
    wx.navigateTo({
      url: '../nurse/register',
    });
  },
  async tapPay(e) {
    const db = wx.cloud.database();
    const _ = db.command;
    await db.collection('userInfo')
      .where({ _id: app.globalData.userInfo.extInfo._id })
      .update({
        data: {
          balance: _.inc(2400),
        }
      })
    app.globalData.userInfo.extInfo.balance += 2400;
    this.setData({
      userInfo: app.globalData.userInfo
    });
    wx.showToast({
      title: '微信支付2400',
    });
  }
})
