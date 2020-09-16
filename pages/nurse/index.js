// pages/nurse/index.js
const moment = require('../../utils/moment.min.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude: 34.37,
    longitude: 107.13,
    markers: [],
    items: [
      { value: 'H', name: '老人护理', checked: 'true' },
      { value: 'B', name: '半自理病人护理' },
      { value: 'N', name: '不能自理病人护理' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.setData({
      latitude: app.globalData.userInfo.extInfo.location.latitude,
      longitude: app.globalData.userInfo.extInfo.location.longitude,
    })
    await this.getContract();
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

  tapServe(e) {
    wx.navigateTo({
      url: './serve',
    })
  },
  tapSetting() {
    wx.navigateTo({
      url: './settings',
    })
  },
  async getContract() {
    const db = wx.cloud.database();
    const _ = db.command
    const userCollection = db.collection('userInfo');
    const contracts = (await db.collection('contract').where({ nurse: _.or(_.eq(app.globalData.userInfo.extInfo._openid), _.eq(null)), status: 'open' }).get()).data;
    this.contracts = [];
    const now = moment();
    const markers = [];
    const cus = {};

    let i = 0;
    for (const contract of contracts) {
      if (!!cus[contract.customer]) {
        continue;
      }
      const start = moment(contract.startDate, 'YYYY-MM-DD');
      const end = start.clone().add(contract.serveLength, 'month');
      if (now.diff(start) > 0 && now.diff(end) < 0) {
        this.contracts.push(contract);
        cus[contract.customer] = contract;
        const ui = (await userCollection.where({ _openid: _.eq(contract.customer) }).get()).data[0];
        contract.customerInfo = ui;
        markers.push({
          id: i,
          latitude: ui.location.latitude,
          longitude: ui.location.longitude,
          label: { content: contract.customerInfo.name },
          width: 40,
          height: 40,
          iconPath: '/images/feed.jpg'
        });
        i++;
      }
    }
    console.log(markers);
    this.setData({
      markers
    });
  },
  markertap(e) {
    const contract = this.contracts[e.markerId];
    wx.showModal({
      title: contract.customerInfo.name,
      content: `地址：${contract.address} 服务时间：${contract.startDate} 服务时长：${contract.serveLength}`,
      showCancel: false
    });
  },

  tapManager(e) {
    
  }
})