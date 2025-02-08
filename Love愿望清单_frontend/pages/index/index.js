// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const app = getApp()

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
    this.checkLoginStatus()
    this.getRelationInfo()
    this.getRecentAnniversaries()
    this.getWishProgress()
    this.getDailyLove()
  },
  async checkLoginStatus() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        wx.navigateTo({
          url: '/pages/login/index'
        })
        return
      }
      const userInfo = await this.getUserInfo()
      this.setData({ userInfo })
    } catch (err) {
      console.error('检查登录状态失败:', err)
    }
  },
  async getRelationInfo() {
    try {
      // TODO: 调用后端API
      const relationInfo = {
        days: 365,
        relationId: 'test123',
        status: 'ACTIVE'
      }
      this.setData({ relationInfo })
      if(relationInfo.status === 'ACTIVE') {
        const partnerInfo = await this.getPartnerInfo()
        this.setData({ partnerInfo })
      }
    } catch (err) {
      console.error('获取情侣关系失败:', err)
    }
  },
  async getRecentAnniversaries() {
    try {
      // TODO: 调用后端API
      const recentAnniversaries = [
        {
          id: 1,
          title: '恋爱纪念日',
          date: '2024-04-01',
          daysLeft: 7,
          type: 'LOVE'
        },
        {
          id: 2, 
          title: '生日',
          date: '2024-04-15',
          daysLeft: 21,
          type: 'BIRTHDAY'
        }
      ]
      this.setData({ recentAnniversaries })
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
  }
})
