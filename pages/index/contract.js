// pages/index/contract.js
const moment = require('../../utils/moment.min.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    date:'',
    serveLength: 1,
    selectedNurse: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const ch = this.getOpenerEventChannel();
    ch.on('selected-nurse', data =>{
      this.setData({
        selectedNurse: data
      })
    })
    this.setData({
      date: moment().format('YYYY-MM-DD'),
      userInfo: app.globalData.userInfo
    });
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
  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    });
  },
  bindInput: function(e) {
    this.setData({
      serveLength: e.detail.value
    });
  },
  tapOk: async function(e) {
    if (this.data.serveLength < 1) {
      wx.showToast({
        title: '服务时长不合法。',
        icon: 'none'
      });
      return;
    }
    const balance = app.globalData.userInfo.extInfo.balance - (this.data.serveLength * 1800);
    if (balance < 0) {
      wx.showToast({
        title: '你没有足够的余额。',
        icon: 'none'
      });
      return;
    }
    const db = wx.cloud.database();
    await db.collection('contract').add({
      data:{ 
        startDate: this.data.date,
        serveLength: this.data.serveLength,
        customer: app.globalData.userInfo.extInfo._openid,
        nurse: this.data.selectedNurse._openid,
        address: app.globalData.userInfo.extInfo.address,
        serveDay: 0
       }
    });
    await db.collection('userInfo').where({_id:app.globalData.userInfo.extInfo._id}).update({data:{balance: balance}});
    app.globalData.userInfo.extInfo.balance = balance;
    wx.navigateBack({
      complete: (res) => {},
    })
  }
})