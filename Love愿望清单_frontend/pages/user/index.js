// 获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: null,
    notificationEnabled: true,
    showThemePopup: false,
    currentTheme: {
      name: 'pink',
      color: '#FF69B4'
    },
    themes: [
      { name: 'pink', color: '#FF69B4' },
      { name: 'purple', color: '#9B59B6' },
      { name: 'blue', color: '#3498DB' },
      { name: 'green', color: '#2ECC71' },
      { name: 'orange', color: '#E67E22' },
      { name: 'red', color: '#E74C3C' }
    ]
  },

  onLoad() {
    // 获取本地存储的用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    }
    
    // 获取本地存储的主题设置
    const theme = wx.getStorageSync('theme')
    if (theme) {
      this.setData({ currentTheme: theme })
    }
    
    // 获取本地存储的通知设置
    const notificationEnabled = wx.getStorageSync('notificationEnabled')
    if (notificationEnabled !== undefined) {
      this.setData({ notificationEnabled })
    }
  },

  onShow() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.redirectTo({
        url: '/pages/login/index'
      })
    }
  },

  // 复制配对码
  copyPairCode() {
    const { pairCode } = this.data.userInfo
    if (!pairCode) {
      wx.showToast({
        title: '配对码不存在',
        icon: 'none'
      })
      return
    }
    wx.setClipboardData({
      data: pairCode,
      success: () => {
        wx.showToast({
          title: '配对码已复制',
          icon: 'success'
        })
      }
    })
  },

  // 页面跳转函数
  navigateToAnniversary() {
    wx.switchTab({ url: '/pages/anniversary/index' })
  },

  navigateToWishList() {
    wx.switchTab({ url: '/pages/wish/index' })
  },

  navigateToCouple() {
    wx.navigateTo({ url: '/pages/couple/index' })
  },

  navigateToAbout() {
    wx.navigateTo({ url: '/pages/about/index' })
  },

  // 切换消息提醒
  toggleNotification(e) {
    const enabled = e.detail.value
    this.setData({ notificationEnabled: enabled })
    wx.setStorageSync('notificationEnabled', enabled)
    wx.showToast({
      title: enabled ? '已开启消息提醒' : '已关闭消息提醒',
      icon: 'success'
    })
  },

  // 主题相关函数
  showThemeSelector() {
    this.setData({ showThemePopup: true })
  },

  closeThemeSelector() {
    this.setData({ showThemePopup: false })
  },

  selectTheme(e) {
    const theme = e.currentTarget.dataset.theme
    this.setData({ 
      currentTheme: theme,
      showThemePopup: false
    })
    // 保存主题设置
    wx.setStorageSync('theme', theme)
    // 更新全局主题
    if (app.updateTheme) {
      app.updateTheme(theme)
    }
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录信息
          wx.clearStorageSync()
          // 跳转到登录页
          wx.reLaunch({
            url: '/pages/login/index'
          })
        }
      }
    })
  }
})