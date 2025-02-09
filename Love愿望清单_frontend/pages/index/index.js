// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const app = getApp()
const dayjs = require('dayjs')

Page({
  data: {
    motto: 'Hello World',
    userInfo: null,
    partnerInfo: null,
    relationInfo: {
      days: 0,
      relationId: '',
      status: 'PENDING' // PENDING-待匹配 ACTIVE-已匹配 DISABLED-已解除
    },
    recentAnniversaries: [],
    wishProgress: {
      total: 0,
      completed: 0,
      rate: '0%'
    },
    dailyLove: {
      content: '',
      from: ''
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    todayLoveWords: '',
    wishStats: {
      completed: 0,
      ongoing: 0,
      completionRate: '0%'
    }
  },
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  onLoad() {
    if (!app.checkLoginStatus()) return
    this.loadPageData()
  },
  onShow() {
    if (!app.checkLoginStatus()) return
    this.loadPageData()
  },
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.redirectTo({
        url: '/pages/login/index'
      })
    }
  },
  async getUserInfo() {
    try {
      const res = await wx.request({
        url: `${app.globalData.baseUrl}/api/user/info`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (res.statusCode === 200 && res.data.code === 0) {
        this.setData({
          userInfo: res.data.data
        })
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
    }
  },
  async getRelationInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo || !userInfo.pairedUserId) {
        return
      }

      const res = await wx.request({
        url: `${app.globalData.baseUrl}/api/user/${userInfo.pairedUserId}`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (res.statusCode === 200 && res.data.code === 0) {
        this.setData({
          partnerInfo: res.data.data
        })
      }
    } catch (err) {
      console.error('获取配对信息失败:', err)
    }
  },
  async getRecentAnniversaries() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) throw new Error('未登录')

      const res = await wx.request({
        url: `${app.globalData.baseUrl}/api/anniversary/recent`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (res.statusCode === 200 && res.data && res.data.code === 0) {
        const records = res.data.data || []
        const processedList = records.map(item => ({
          id: item.id,
          title: item.title,
          date: item.date,
          type: parseInt(item.type) || 0,
          repeatType: parseInt(item.repeatType) || 0,
          daysUntil: this.calculateDaysUntil(item.date, parseInt(item.repeatType) || 0)
        }))

        this.setData({ recentAnniversaries: processedList })
      }
    } catch (err) {
      console.error('获取近期纪念日失败:', err)
    }
  },
  async getWishProgress() {
    try {
      // TODO: 调用后端API
      const wishProgress = {
        total: 10,
        completed: 6,
        rate: '60%'
      }
      this.setData({ wishProgress })
    } catch (err) {
      console.error('获取愿望进度失败:', err)
    }
  },
  async getDailyLove() {
    try {
      // TODO: 调用后端API
      const dailyLove = {
        content: '你是我温暖的日光,可爱的月亮,全部的星辰.',
        from: '情话集'
      }
      this.setData({ dailyLove })
    } catch (err) {
      console.error('获取每日情话失败:', err)
    }
  },
  goToMatch() {
    wx.navigateTo({
      url: '/pages/match/index'
    })
  },
  goToAnniversaryDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/anniversary/detail/index?id=${id}`
    })
  },
  // 加载页面数据
  async loadPageData() {
    Promise.all([
      this.getRecentAnniversaries(),
      this.getWishStats(),
      this.getTodayLoveWords()
    ]).catch(err => {
      console.error('加载页面数据失败:', err)
    })
  },
  // 获取愿望统计
  async getWishStats() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) throw new Error('未登录')

      const res = await wx.request({
        url: `${app.globalData.baseUrl}/api/wish/stats`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (res.statusCode === 200 && res.data && res.data.code === 0) {
        const stats = res.data.data || {}
        const total = (stats.completed || 0) + (stats.ongoing || 0)
        const completionRate = total > 0 
          ? Math.round((stats.completed || 0) / total * 100) + '%' 
          : '0%'

        this.setData({
          wishStats: {
            completed: stats.completed || 0,
            ongoing: stats.ongoing || 0,
            completionRate
          }
        })
      }
    } catch (err) {
      console.error('获取愿望统计失败:', err)
    }
  },
  // 获取今日情话
  async getTodayLoveWords() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) throw new Error('未登录')

      const res = await wx.request({
        url: `${app.globalData.baseUrl}/api/love-words/today`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (res.statusCode === 200 && res.data && res.data.code === 0) {
        this.setData({
          todayLoveWords: res.data.data?.content || ''
        })
      }
    } catch (err) {
      console.error('获取今日情话失败:', err)
    }
  },
  // 计算距离纪念日的天数
  calculateDaysUntil(date, repeatType) {
    const today = dayjs()
    let targetDate = dayjs(date)

    if (repeatType === 1) {
      // 每年重复的情况
      const thisYear = today.format('YYYY')
      const dateThisYear = dayjs(`${thisYear}-${targetDate.format('MM-DD')}`)
      
      if (dateThisYear.isBefore(today)) {
        // 如果今年的日期已过，则计算到明年的日期
        targetDate = dayjs(`${parseInt(thisYear) + 1}-${targetDate.format('MM-DD')}`)
      } else {
        targetDate = dateThisYear
      }
    }

    return targetDate.diff(today, 'day')
  },
  // 页面跳转
  navigateToAnniversary() {
    wx.switchTab({
      url: '/pages/anniversary/index'
    })
  },
  navigateToWish() {
    wx.switchTab({
      url: '/pages/wish/index'
    })
  }
})
