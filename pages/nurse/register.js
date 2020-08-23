// pages/nurse/register.js
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    invalid: true,
    name: '',
    idfUrl: '',
    idbUrl: '',
    healthfUrl: '',
    healthbUrl: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        this.setData({
          latitude : res.latitude,
          longitude : res.longitude
        }); 
      }
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

  tapidf: async function () {
    const tempUrl = await this.chooseImage();    
    this.setData({
      idfUrl: tempUrl
    });    
    this.isValid(); 
  },
  tapidb: async function () {
    const tempUrl = await this.chooseImage();    
    this.setData({
      idbUrl: tempUrl
    });    
    this.isValid(); 
  },
  taphealthf: async function () {
    const tempUrl = await this.chooseImage();    
    this.setData({
      healthfUrl: tempUrl
    });    
    this.isValid(); 
  },
  taphealthb: async function () {
    const tempUrl = await this.chooseImage();    
    this.setData({
      healthbUrl: tempUrl
    });   
    this.isValid(); 
  },
  async chooseImage() {
    return new Promise((resolve, reject) =>{
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          resolve(res.tempFilePaths[0]);
        },
        fail: (res) => {
          reject(res);
        }
      });
    });
  },
  async uploadImage(fileURL) {
    return (await wx.cloud.uploadFile({
      cloudPath: `${new Date().getTime()}.png`, // 上传至云端的路径
      filePath: fileURL, // 小程序临时文件路径
    })).fileID;
  },
  bindInput(e) {
    this.setData({
      name: e.detail.value
    });
    this.isValid(); 
  },
  isValid() {
    const valid = !!this.data.name 
      && !!this.data.idfUrl
      && !!this.data.idbUrl
      && !!this.data.healthfUrl
      && !!this.data.healthbUrl
      && !!this.data.latitude
      && !!this.data.longitude;
    this.setData({
      invalid: !valid,
    }); 
  },
  async tapSubmit(e) {
    const nurse = {
      name: this.data.name,
      idfUrl: await this.uploadImage(this.data.idfUrl),
      idbUrl: await this.uploadImage(this.data.idbUrl),
      healthfUrl: await this.uploadImage(this.data.healthfUrl),
      healthbUrl: await this.uploadImage(this.data.healthbUrl),
      location: db.Geo.Point(this.data.longitude, this.data.latitude),
      status: 'available'
    };
    const db = wx.cloud.database();
    await db.collection('nurse').add({
      data:nurse
    });
    await db.collection('userInfo').where({_id:app.globalData.userInfo.extInfo._id}).update({data:{type: 'nurse'}});
    app.globalData.userInfo.extInfo.type = 'nurse';

    wx.navigateBack({
    })
  }
})