const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const getLocation = () => {
  return new Promise((resolve, reject)=>{
    wx.getLocation({
      type: 'wgs84',
      success: async (res) => {
        resolve(res);
      }
    });
  });
}

const getUserInfo = () => {
  return new Promise((resolve, reject)=>{
    wx.getUserInfo({
      success: res => {
        resolve(res.userInfo);
      }
    });
  });
}

module.exports = {
  formatTime: formatTime,
  getLocation: getLocation,
  getUserInfo: getUserInfo,
}
