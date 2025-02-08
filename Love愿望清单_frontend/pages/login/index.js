const app = getApp()

Page({
  data: {
    loginType: 'password', // password-密码登录 code-验证码登录
    phone: '',
    password: '',
    code: '',
    countdown: 0,
    agreementChecked: false
  },

  // 切换登录方式
  switchLoginType() {
    this.setData({
      loginType: this.data.loginType === 'password' ? 'code' : 'password'
    })
  },

  // 输入手机号
  onPhoneInput(e) {
    this.setData({
      phone: e.detail
    })
  },

  // 输入密码
  onPasswordInput(e) {
    this.setData({
      password: e.detail
    })
  },

  // 输入验证码
  onCodeInput(e) {
    this.setData({
      code: e.detail
    })
  },

  // 发送验证码
  async sendCode() {
    if(this.data.countdown > 0) return
    if(!this.data.phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }
    try {
      // TODO: 调用发送验证码API
      this.startCountdown()
    } catch(err) {
      console.error('发送验证码失败:', err)
    }
  },

  // 开始倒计时
  startCountdown() {
    this.setData({
      countdown: 60
    })
    const timer = setInterval(() => {
      if(this.data.countdown <= 0) {
        clearInterval(timer)
        return
      }
      this.setData({
        countdown: this.data.countdown - 1
      })
    }, 1000)
  },

  // 切换协议选中状态
  toggleAgreement(e) {
    this.setData({
      agreementChecked: e.detail
    })
  },

  // 登录
  login() {
    if (!this.data.agreementChecked) {
      wx.showToast({
        title: '请同意用户协议和隐私政策',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '登录中...',
      mask: true
    })

    // 获取用户信息
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (userProfile) => {
        console.log('获取用户信息成功:', userProfile)
        // 获取登录code
        wx.login({
          success: (loginResult) => {
            console.log('获取登录code成功:', loginResult)
            // 调用后端登录接口
            wx.request({
              url: `${app.globalData.baseUrl}/api/user/login`,
              method: 'POST',
              header: {
                'content-type': 'application/json',
                'Accept': 'application/json'
              },
              data: {
                code: loginResult.code,
                userInfo: {
                  nickName: userProfile.userInfo.nickName,
                  avatarUrl: userProfile.userInfo.avatarUrl,
                  gender: userProfile.userInfo.gender
                }
              },
              success: (res) => {
                console.log('登录请求成功:', res)
                wx.hideLoading()
                
                if (res.statusCode === 200 && res.data.code === 0) {
                  // 保存登录信息
                  const loginData = res.data.data
                  wx.setStorageSync('token', loginData.token)
                  wx.setStorageSync('userInfo', {
                    userId: loginData.userId,
                    nickname: loginData.nickname,
                    avatarUrl: loginData.avatarUrl,
                    pairStatus: loginData.pairStatus,
                    pairCode: loginData.pairCode
                  })
                  
                  // 保存到全局数据
                  app.globalData.userInfo = loginData

                  wx.showToast({
                    title: '登录成功',
                    icon: 'success'
                  })
                  
                  // 跳转到首页
                  setTimeout(() => {
                    wx.switchTab({
                      url: '/pages/index/index'
                    })
                  }, 1500)
                } else {
                  wx.showToast({
                    title: res.data?.message || '登录失败',
                    icon: 'none'
                  })
                }
              },
              fail: (err) => {
                console.error('登录请求失败:', err)
                wx.hideLoading()
                wx.showToast({
                  title: '网络请求失败，请重试',
                  icon: 'none'
                })
              }
            })
          },
          fail: (err) => {
            console.error('获取登录code失败:', err)
            wx.hideLoading()
            wx.showToast({
              title: '登录失败，请重试',
              icon: 'none'
            })
          }
        })
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err)
        wx.hideLoading()
        if (err.errMsg.includes('getUserProfile:fail auth deny')) {
          wx.showToast({
            title: '需要您授权才能使用',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: '获取用户信息失败',
            icon: 'none'
          })
        }
      }
    })
  }
}) 