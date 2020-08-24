//index.js
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
    items: [
      {value: 'N', name: '正常', checked: 'true'},
      {value: 'H', name: '半失能'},
      {value: 'T', name: '全失能'},
    ]
  },
  onLoad: async function () {
    if (app.globalData.userInfo) {
      await this.checkNurse();
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = async res => {
        await this.checkNurse();
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: async res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
          await this.getNurse();
        }
      })
    }
  },
  onShow: async function () {
    if (app.globalData.userInfo) {
      await this.checkNurse();
    }
  },
  getUserInfo: async function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    await app.getExtInfo();
    await this.checkNurse();
  },
  async checkNurse() {
    if (app.globalData.userInfo.extInfo.type === 'nurse') {
      wx.navigateTo({
        url: '../nurse/index',
      })
    } else {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
      await this.getNurse();
    }
  },
  getNurse: async function() {
    const db = wx.cloud.database();
    const _ = db.command
    this.nurses = (await db.collection('nurse').where({status: _.eq('available')}).get()).data;
    const markers = [];
    let i = 0;
    for (const nurse of this.nurses) {
      markers.push({
        id: i,
        latitude: nurse.location.latitude,
        longitude: nurse.location.longitude,
        label: { content: nurse.name },
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
    this.setData({selectedNurse: nurse});
    wx.showModal({
      title: nurse.name,
      content: '评价：4.4',
      showCancel: false
    });
  },
  tapusersetting: function(e) {
    wx.navigateTo({
      url: './settings',
    });
  },
  checkboxChange(e) {
    for(const i of this.data.items) {
      i.checked = false;
      for(const v of e.detail.value) {
        if (i.value === v) {
          i.checked = true;
          break;
        }
      }
    }
  },
  tapOtherServe: function(e) {
    for(const i of this.data.tempItem){
      this.data.items.push(i);
    }
    this.setData({
      items: this.data.items,
      hasOther: true
    });
  },
  tapContract: function(e) {
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
      .where({_id:app.globalData.userInfo.extInfo._id})
      .update({data:{
        balance: _.inc(1800),
      }})
    app.globalData.userInfo.extInfo.balance += 1800;
    this.setData({
      userInfo: app.globalData.userInfo
    });
    wx.showToast({
      title: '模拟微信支付1800',
    });
  }
})
