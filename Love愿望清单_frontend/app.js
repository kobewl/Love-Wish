// app.js
App({
  globalData: {
    // 根据环境切换baseUrl
    baseUrl: 'http://localhost:8080',  // 本地开发环境
    // baseUrl: 'https://your-domain.com', // 生产环境
    userInfo: null
  },
  
  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.userInfo = wx.getStorageSync('userInfo')
    }

    // 打印环境信息，方便调试
    console.log('当前环境:', __wxConfig.envVersion)
    console.log('接口地址:', this.globalData.baseUrl)

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  }
})
