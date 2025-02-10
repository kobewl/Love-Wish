// pages/my/index.js
const app = getApp()
var dayjs = require('../../utils/dayjs.min.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      avatarUrl: '',
      nickname: '',
      pairCode: '',
      gender: 0,
      birthday: ''
    },
    editInfo: {
      nickname: '',
      gender: 0,
      birthday: ''
    },
    genderOptions: ['保密', '男', '女'],
    themeOptions: [
      { name: '粉红', value: 'pink', color: '#ff69b4' },
      { name: '蓝色', value: 'blue', color: '#4d94ff' },
      { name: '紫色', value: 'purple', color: '#9966ff' },
      { name: '绿色', value: 'green', color: '#66cc99' },
      { name: '橙色', value: 'orange', color: '#ff9966' },
      { name: '红色', value: 'red', color: '#ff6666' }
    ],
    currentTheme: 'pink',
    notificationEnabled: true,
    showEditPopup: false,
    showThemePopup: false,
    showGenderPicker: false,
    showDatePicker: false,
    currentDate: new Date().getTime(),
    minDate: new Date('1900-01-01').getTime(),
    maxDate: new Date().getTime()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (!app.checkLoginStatus()) return
    this.getUserInfo()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (!app.checkLoginStatus()) return
    this.getUserInfo()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 获取用户信息
  async getUserInfo() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        throw new Error('未登录')
      }

      wx.showLoading({
        title: '加载中...',
        mask: true
      })

      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/user/info`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          success: resolve,
          fail: reject
        })
      })

      console.log('获取用户信息响应:', res)

      if (res.statusCode === 200 && res.data && res.data.code === 0) {
        const userInfo = res.data.data || {}
        this.setData({
          userInfo: {
            avatarUrl: userInfo.avatarUrl || '',
            nickname: userInfo.nickname || '微信用户',
            pairCode: userInfo.pairCode || '',
            gender: parseInt(userInfo.gender) || 0,
            birthday: userInfo.birthday || ''
          },
          notificationEnabled: userInfo.notificationEnabled || false,
          currentTheme: userInfo.theme || 'pink'
        })
        return Promise.resolve(userInfo)
      } else {
        throw new Error(res.data?.message || '获取用户信息失败')
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
      wx.showToast({
        title: err.message || '获取用户信息失败',
        icon: 'none',
        duration: 2000
      })
      return Promise.reject(err)
    } finally {
      wx.hideLoading()
    }
  },

  // 点击头像
  onTapAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.uploadAvatar(tempFilePath)
      }
    })
  },

  // 上传头像
  async uploadAvatar(filePath) {
    try {
      wx.showLoading({
        title: '上传中...',
        mask: true
      })

      const token = wx.getStorageSync('token')
      if (!token) throw new Error('未登录')

      const res = await new Promise((resolve, reject) => {
        wx.uploadFile({
          url: `${app.globalData.baseUrl}/api/user/avatar`,
          filePath: filePath,
          name: 'file',
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: resolve,
          fail: reject
        })
      })

      const data = JSON.parse(res.data)
      if (res.statusCode === 200 && data && data.code === 0) {
        this.setData({
          'userInfo.avatarUrl': data.data.url
        })
        wx.showToast({
          title: '上传成功',
          icon: 'success',
          duration: 2000
        })
      } else {
        throw new Error(data?.message || '上传失败')
      }
    } catch (err) {
      console.error('上传头像失败:', err)
      wx.showToast({
        title: err.message || '上传失败',
        icon: 'none',
        duration: 2000
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 点击情侣空间
  onTapPairSpace() {
    if (!this.data.userInfo.pairCode) {
      wx.showModal({
        title: '提示',
        content: '您还未绑定情侣，是否现在绑定？',
        success: (res) => {
          if (res.confirm) {
            // TODO: 跳转到绑定页面
          }
        }
      })
      return
    }
    // TODO: 跳转到情侣空间
  },

  // 点击消息提醒
  onTapNotification() {
    // 切换消息提醒状态
    this.setData({
      notificationEnabled: !this.data.notificationEnabled
    })
  },

  // 消息提醒变化
  async onNotificationChange(e) {
    const enabled = e.detail
    try {
      const token = wx.getStorageSync('token')
      if (!token) throw new Error('未登录')

      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/user/notification`,
          method: 'PUT',
          header: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: { enabled },
          success: resolve,
          fail: reject
        })
      })

      if (res.statusCode !== 200 || !res.data || res.data.code !== 0) {
        throw new Error(res.data?.message || '设置失败')
      }
    } catch (err) {
      console.error('设置消息提醒失败:', err)
      wx.showToast({
        title: err.message || '设置失败',
        icon: 'none',
        duration: 2000
      })
      // 恢复原状态
      this.setData({
        notificationEnabled: !enabled
      })
    }
  },

  // 点击主题设置
  onTapTheme() {
    this.setData({
      showThemePopup: true
    })
  },

  // 关闭主题设置弹窗
  onCloseThemePopup() {
    this.setData({
      showThemePopup: false
    })
  },

  // 选择主题
  async onThemeSelect(e) {
    const theme = e.currentTarget.dataset.theme
    try {
      const token = wx.getStorageSync('token')
      if (!token) throw new Error('未登录')

      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/user/theme`,
          method: 'PUT',
          header: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: { theme },
          success: resolve,
          fail: reject
        })
      })

      if (res.statusCode === 200 && res.data && res.data.code === 0) {
        this.setData({
          currentTheme: theme,
          showThemePopup: false
        })
        // 应用主题
        app.setTheme(theme)
      } else {
        throw new Error(res.data?.message || '设置失败')
      }
    } catch (err) {
      console.error('设置主题失败:', err)
      wx.showToast({
        title: err.message || '设置失败',
        icon: 'none',
        duration: 2000
      })
    }
  },

  // 显示编辑弹窗
  onTapEdit() {
    console.log('点击编辑按钮')
    // 确保有最新的用户信息
    this.getUserInfo().then(() => {
      console.log('获取到的用户信息:', this.data.userInfo)
      this.setData({
        showEditPopup: true,
        editInfo: {
          nickname: this.data.userInfo.nickname || '',
          gender: parseInt(this.data.userInfo.gender) || 0,
          birthday: this.data.userInfo.birthday || ''
        }
      })
      console.log('设置的编辑信息:', this.data.editInfo)
    }).catch(err => {
      console.error('获取用户信息失败:', err)
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none',
        duration: 2000
      })
    })
  },

  // 昵称输入
  onNicknameInput(e) {
    console.log('昵称输入:', e.detail)
    this.setData({
      'editInfo.nickname': e.detail.trim()
    })
  },

  // 显示性别选择器
  onShowGenderPicker() {
    this.setData({
      showGenderPicker: true
    })
  },

  // 关闭性别选择器
  onCloseGenderPicker() {
    this.setData({
      showGenderPicker: false
    })
  },

  // 确认性别选择
  onConfirmGenderPicker(e) {
    console.log('性别选择:', e.detail)
    this.setData({
      'editInfo.gender': this.data.genderOptions.indexOf(e.detail.value),
      showGenderPicker: false
    })
  },

  // 显示日期选择器
  onShowDatePicker() {
    this.setData({
      showDatePicker: true,
      currentDate: this.data.editInfo.birthday ? 
        new Date(this.data.editInfo.birthday).getTime() : 
        new Date().getTime()
    })
  },

  // 关闭日期选择器
  onCloseDatePicker() {
    this.setData({
      showDatePicker: false
    })
  },

  // 确认日期选择
  onConfirmDatePicker(e) {
    console.log('日期选择:', e.detail)
    const date = new Date(e.detail)
    const birthday = dayjs(date).format('YYYY-MM-DD')
    this.setData({
      'editInfo.birthday': birthday,
      showDatePicker: false
    })
  },

  // 性别选择
  onGenderChange(e) {
    console.log('性别选择:', e.detail.value)
    this.setData({
      'editInfo.gender': parseInt(e.detail.value)
    })
  },

  // 生日选择
  onBirthdayChange(e) {
    console.log('生日选择:', e.detail.value)
    this.setData({
      'editInfo.birthday': e.detail.value
    })
  },

  // 确认编辑
  async onConfirmEdit() {
    try {
      const { nickname, gender, birthday } = this.data.editInfo
      console.log('提交的编辑信息:', { nickname, gender, birthday })

      if (!nickname || nickname.trim() === '') {
        wx.showToast({
          title: '请输入昵称',
          icon: 'none',
          duration: 2000
        })
        return
      }

      wx.showLoading({
        title: '保存中...',
        mask: true
      })

      const token = wx.getStorageSync('token')
      if (!token) {
        throw new Error('未登录')
      }

      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/user/info`,
          method: 'PUT',
          header: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {
            nickname: nickname.trim(),
            gender: parseInt(gender),
            birthday: birthday || null
          },
          success: resolve,
          fail: reject
        })
      })

      console.log('保存响应:', res)

      if (res.statusCode === 200 && res.data && res.data.code === 0) {
        // 更新成功后，更新本地数据
        this.setData({
          showEditPopup: false,
          'userInfo.nickname': nickname.trim(),
          'userInfo.gender': parseInt(gender),
          'userInfo.birthday': birthday || null
        })

        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })

        // 重新获取用户信息以确保数据同步
        setTimeout(() => {
          this.getUserInfo()
        }, 1000)
      } else {
        throw new Error(res.data?.message || '保存失败')
      }
    } catch (err) {
      console.error('保存用户信息失败:', err)
      wx.showToast({
        title: err.message || '保存失败',
        icon: 'none',
        duration: 2000
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 关闭编辑弹窗
  onCloseEditPopup() {
    console.log('关闭编辑弹窗')
    this.setData({
      showEditPopup: false
    })
  },

  // 退出登录
  onTapLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的token
          wx.removeStorageSync('token')
          // 跳转到登录页
          wx.reLaunch({
            url: '/pages/login/index'
          })
        }
      }
    })
  }
})