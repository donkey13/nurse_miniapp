// pages/index/settings.js
const moment = require('../../utils/moment.min.js');
const app = getApp();
const chooseLocation = requirePlugin('chooseLocation');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    address: '',
    serveDay: 0,
    balance: 0,
    recommend: '邓阿姨',
    items: [
      {value: 'H', name: '可以自理', checked: 'true'},
      {value: 'B', name: '半自理'},
      {value: 'N', name: '不能自理' },
    ],
    contracts: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    const db = wx.cloud.database();
    const contracts = (await db.collection('contract')
      .where({
        customer: app.globalData.userInfo.extInfo._openid,
      })
      .get())
      .data;
    let serveDay = 0;
    for (const i of contracts) {
      serveDay += i.serveDay;
    }
    this.setData({
      name: app.globalData.userInfo.extInfo.name,
      serveDay,
      contracts,
      address: app.globalData.userInfo.extInfo.address,
      balance: app.globalData.userInfo.extInfo.balance,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const level = app.globalData.userInfo.extInfo.level || 'H';
    const items = this.data.items;
    for (const item of items) {
      item.checked = item.value === level;
    }
    this.setData({
      items
    });
    const location = chooseLocation.getLocation(); 
    if (location) {
      app.globalData.userInfo.extInfo.address = location.name;
      const db = wx.cloud.database();
      db.collection('userInfo')
        .where({_id:app.globalData.userInfo.extInfo._id})
        .update({data:{
          location: DB.GeoPoint(location.longitude, location.latitude),
          address: location.name,
        }})
        .then();
    } 
    this.setData({
      address: app.globalData.userInfo.extInfo.address,
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  tapregisternurse: function () {
    wx.navigateTo({
      url: '../nurse/register',
    })
  },

  async radioChange(e) {
    const items = this.data.items
    let level = 0;
    for (const item of items) {
      item.checked = item.value === e.detail.value;
      if (item.checked) {
        level = item.value;
      }
    }

    this.setData({
      items
    });
    const db = wx.cloud.database();
    await db.collection('userInfo')
      .where({_id:app.globalData.userInfo.extInfo._id})
      .update({data:{level}});
    app.globalData.userInfo.extInfo.level = level;
  },

  bindInput(e) {
    const db = wx.cloud.database();
    db.collection('userInfo')
      .where({_id:app.globalData.userInfo.extInfo._id})
      .update({data:{name: e.detail.value}})
      .then();
    app.globalData.userInfo.extInfo.name = e.detail.value;
  },

  openmap() {
    const key = 'NCLBZ-NOYC5-2ZEI7-QK2IV-RGYE3-FHBY3'; //使用在腾讯位置服务申请的key
    const referer = '生活守望'; //调用插件的app的名称
    const location = JSON.stringify({
      latitude: app.globalData.userInfo.extInfo.location.latitude || 34.37,
      longitude: app.globalData.userInfo.extInfo.location.longitude || 107.13,
    });
    const category = '';
    
    wx.navigateTo({
      url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer + '&location=' + location + '&category=' + category
    });
  }
})