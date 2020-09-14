// pages/nurse/index.js
const moment = require('../../utils/moment.min.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    workStatus: [{
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
    dailyItems: [{
        value: 's1',
        name: '检查体温，肢体'
      },
      {
        value: 's2',
        name: '检查褥疮'
      },
      {
        value: 's3',
        name: '检查大小便'
      },
      {
        value: 's4',
        name: '中午喂饭洗碗'
      },
      {
        value: 's5',
        name: '晚上喂饭洗碗'
      },
      {
        value: 's6',
        name: '清理卧室'
      },
      {
        value: 's7',
        name: '洁面'
      },
    ],
    weeklyItems: [{
        value: 'ts1',
        name: '剪指甲(每周)'
      },
      {
        value: 'ts2',
        name: '洗澡(2次每周)'
      },
      {
        value: 'ts3',
        name: '洗衣服'
      },
      {
        value: 'ts4',
        name: '集中时间外出'
      },
      {
        value: 'ts5',
        name: '按摩活血'
      },
    ],
    dayFinish: true,
    contracts: [],
    contract: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    const db = wx.cloud.database();
    const contracts = (await db.collection('contract').where({
      status: 'open',
      nurse: app.globalData.userInfo.extInfo._openid
    }).get()).data;
    const now = moment();
    for (const item of contracts) {
      const start = moment(item.startDate, 'YYYY-MM-DD');
      const end = start.clone().add(item.serveLength, 'month');
      if (now.diff(start) > 0 && now.diff(end) < 0) {
        item.class = 'active';
        this.setData({
          contract: item
        })
      }
    }
    const serves = (await db.collection('serve')
        .where({
          contract: this.data.contract._id,
        })
        .get())
      .data;
    let dayFinish = false;
    for (const serve of serves) {
      if (serve.serve === 'day') {
        dayFinish = true;
        continue;
      }
      for (const i of this.data.dailyItems) {
        if (serve.serve === i.value) {
          i.startTime = serve.startTime;
          i.finishTime = serve.finishTime;
          continue;
        }
      }
      for (const i of this.data.weeklyItems) {
        if (serve.serve === i.value) {
          i.startTime = serve.startTime;
          i.finishTime = serve.finishTime;
          continue;
        }
      }
    }

    this.setData({
      contracts,
      dayFinish,
      dailyItems: this.data.dailyItems,
      weeklyItems: this.data.weeklyItems,
      workStatus: this.data.workStatus,
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

  async tapServe(e) {
    var serve;
    for (const i of this.data.dailyItems) {
      if (i.value === e.currentTarget.dataset.serve) {
        serve = i;
        break;
      }
    }
    for (const i of this.data.weeklyItems) {
      if (i.value === e.currentTarget.dataset.serve) {
        serve = i;
        break;
      }
    }
    if (!!serve.startTime) {
      serve.finishTime = moment().format('YYYY-MM-DD');
    } else {
      serve.startTime = moment().format('YYYY-MM-DD');
    }
    const db = wx.cloud.database();
    if (!!serve.finishTime) {
      await db.collection('serve')
        .where({
          contract: this.data.contract._id,
          serve: serve.value
        })
        .update({
          data: {
            finishTime: serve.finishTime
          }
        });
    } else {
      await db.collection('serve').add({
        data: {
          contract: this.data.contract._id,
          serve: serve.value,
          startTime: serve.startTime,
        }
      });
    }
    this.setData({
      dailyItems: this.data.dailyItems,
      weeklyItems: this.data.weeklyItems,
    });
  },

  async tapStatus(e) {
    var status;
    for (const i of this.data.workStatus) {
      if (i.value === e.currentTarget.dataset.status) {
        status = i;
        break;
      }
    }
    this.setData({
      workStatus: this.data.workStatus
    });
  },

  async tapFinish(e) {
    const db = wx.cloud.database();
    const _ = db.command;
    await db.collection('serve').add({
      data: {
        contract: this.data.contract._id,
        serve: 'day',
        finishTime: moment().format('YYYY-MM-DD'),
      }
    });
    const tomorrow = moment().add(1, 'day');
    const contract = this.data.contract;
    const contractDone = moment(contract.startTime, 'YYYY-MM-DD').add(contract.serveLength, 'month').diff(tomorrow) > 0;

    await db.collection('contract')
      .where({
        _id: this.data.contract._id,
      })
      .update({
        data: {
          serveDay: _.inc(1),
          status: contractDone ? 'close' : 'open'
        }
      });
    this.setData({
      dayFinish: true
    });
  },

  tapSetting() {

  }
})