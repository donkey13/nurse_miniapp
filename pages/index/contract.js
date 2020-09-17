// pages/index/contract.js
const moment = require('../../utils/moment.min.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    date: '',
    serveLength: 1,
    inputAddress: '',
    selectedNurse: {},
    type: 'long',
    terms: `
<div class="div_class">
  <h4>我们提供的服务类型为:</h4>
  <p>一般家务</p>
  <p>老人护理<p>
  <p>半自理病人护理<p>
  <p>不能自理病人护理</p>
  <h4>我们的工作内容为:</h4>
  <h5>固定内容:</h5> 
  <p>初次入户，检查体温，肢体情况，褥疮；每次入户，检查大小便，询问喝水；</p>
  <p>中午指定地点取餐加热喂饭洗碗； 下午指定地点取餐加热喂饭洗碗；</p>
  <p>最后离开，清理卧室卫生，洁面、反馈</p>
  <h5>临时内容:</h5> 
  <p>每周剪手脚指甲1次</p>
  <p>每周洗澡1-2次；清洗衣物（洗衣机）</p>
</div>
    `,
    region: ['陕西省', '宝鸡市', '渭滨区'],
    userName: '',
    userId: '',
    userTel: '',
    sonName: '',
    sonId: '',
    sonTel: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const ch = this.getOpenerEventChannel();
    ch.on('selected-nurse', data => {
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
  bindDateChange(e) {
    this.setData({
      date: e.detail.value
    });
  },
  bindInput(e) {
    this.setData({
      serveLength: e.detail.value
    });
  },
  bindAddressInput(e) {
    this.setData({
      inputAddress: e.detail.value
    });
  },
  bindNameInput(e) {
    this.setData({
      userName: e.detail.value
    });
  },
  bindIdInput(e) {
    this.setData({
      userId: e.detail.value
    });
  },
  bindPhoneInput(e) {
    this.setData({
      userTel: e.detail.value
    });
  },
  bindSonNameInput(e) {
    this.setData({
      sonName: e.detail.value
    });
  },
  bindSonIdInput(e) {
    this.setData({
      sonId: e.detail.value
    });
  },
  bindSonPhoneInput(e) {
    this.setData({
      sonTel: e.detail.value
    });
  },
  radioChange(e) {
    this.setData({ type: e.detail.value });
  },
  tapOk: async function (e) {
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
      data: {
        startDate: this.data.date,
        serveLength: this.data.serveLength,
        type: this.data.type,
        customer: app.globalData.userInfo.extInfo._openid,
        nurse: this.data.selectedNurse._openid,
        address: this.data.inputAddress,
        serveDay: 0,
        userName: this.data.userName,
        userId: this.data.userId,
        userTel: this.data.userTel,
        sonName: this.data.sonName,
        sonId: this.data.sonId,
        sonTel: this.data.sonTel,
      }
    });
    await db.collection('userInfo')
      .where({ _id: app.globalData.userInfo.extInfo._id })
      .update({ data: { balance: balance } });
    app.globalData.userInfo.extInfo.balance = balance;
    wx.navigateBack({
    })
  }
})