// pages/nurse/settings.js
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    workStatus: [{
      value: 'available',
      name: '上岗'
    },
    {
      value: 'ws1',
      name: '请假'
    },
    {
      value: 'ws2',
      name: '休息'
    },
    {
      value: 'ws3',
      name: '辞职'
    },
    {
      value: 'ws4',
      name: '调岗'
    }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  async tapStatus(e) {
    const status = e.currentTarget.dataset.status;
    const db = wx.cloud.database();
    const _ = db.command

    await db.collection('nurse')
      .where({
        _openid: _.eq(app.globalData.userInfo.extInfo._openid)
      })
      .update({
        data: {
          status
        }
      });
    if (status === 'ws3') {
      await db.collection('userInfo')
        .where({ _id: app.globalData.userInfo.extInfo._id })
        .update({
          data: {
            type: 'normal'
          }
        });
      app.globalData.userInfo.extInfo.type = 'normal';
      wx.redirectTo({ url: '../index/index' });
    }
  },
});