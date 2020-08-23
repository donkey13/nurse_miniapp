// pages/index/settings.js
const moment = require('../../utils/moment.min.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: '',
    serveDay: 0,
    balance: 0,
    recommend: '邓阿姨',
    items: [
      {value: '0', name: '可以自理', checked: 'true'},
      {value: '1', name: '半卧床'},
      {value: '2', name: '卧床' },
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
    const level = app.globalData.userInfo.extInfo.level || '0';
    const items = this.data.items;
    for (const item of items) {
      item.checked = item.value === level;
    }
    this.setData({
      address: app.globalData.userInfo.extInfo.address,
      items
    })
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
  
  inputAddress: function(e) {
    const address = e.detail.value;
    app.globalData.userInfo.extInfo.address = address;

    const db = wx.cloud.database();
    db.collection('userInfo')
      .where({_id:app.globalData.userInfo.extInfo._id})
      .update({data:{address}})
      .then();
  }
})