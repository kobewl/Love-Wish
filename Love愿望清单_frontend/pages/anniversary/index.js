const app = getApp()
const dayjs = require('dayjs')

Page({
  data: {
    minDate: new Date(2000, 0, 1).getTime(),
    maxDate: new Date(2099, 11, 31).getTime(),
    anniversaryList: [],
    showAddPopup: false,
    showDetailPopup: false,
    currentAnniversary: null,
    newAnniversary: {
      title: '',
      date: '',
      type: 0,
      repeatType: 0,
      reminderDays: 7
    },
    typeOptions: ['恋爱纪念日', '生日', '其他'],
    repeatOptions: ['不重复', '每年重复'],
    reminderOptions: ['不提醒', '提前1天', '提前3天', '提前7天', '提前14天', '提前30天'],
    reminderDaysMap: [0, 1, 3, 7, 14, 30],
    reminderIndex: 3, // 默认提前7天
    animationData: {},
    slideAnimation: {},
    formatter(day) {
      const anniversaries = this.data.anniversaryList || []
      const date = dayjs(day.date).format('YYYY-MM-DD')
      const matched = anniversaries.find(item => {
        if (item.repeatType === 0) {
          return item.date === date
        } else {
          return dayjs(item.date).format('MM-DD') === dayjs(date).format('MM-DD')
        }
      })
      if (matched) {
        day.bottomInfo = matched.title
        day.className = 'anniversary-day'
      }
      return day
    }
  },

  onLoad() {
    // 创建动画实例
    this.animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    })
    
    // 列表滑入动画
    this.slideAnimation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out',
    })

    // 获取纪念日列表
    this.getAnniversaryList()
  },

  onShow() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.redirectTo({
        url: '/pages/login/index'
      })
      return
    }

    // 执行添加按钮动画
    this.executeAddButtonAnimation()
  },

  // 执行添加按钮动画
  executeAddButtonAnimation() {
    this.animation.scale(1.2).step()
    this.animation.scale(1.0).step()
    this.setData({
      animationData: this.animation.export()
    })
  },

  // 执行列表滑入动画
  executeListAnimation() {
    const list = this.data.anniversaryList
    const animations = list.map((_, index) => {
      return wx.createAnimation({
        duration: 300 + index * 100,
        timingFunction: 'ease-out',
      }).translateX(0).opacity(1).step().export()
    })

    this.setData({
      listAnimations: animations
    })
  },

  // 获取纪念日列表
  async getAnniversaryList() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    try {
      const res = await wx.request({
        url: `${app.globalData.baseUrl}/api/anniversary/my`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (res.statusCode === 200 && res.data.code === 0) {
        const list = res.data.data.records.map(item => ({
          ...item,
          daysUntil: this.calculateDaysUntil(item.date, item.repeatType)
        }))
        
        // 初始化列表动画状态
        const listAnimations = list.map(() => {
          return wx.createAnimation({
            duration: 0,
          }).translateX('100%').opacity(0).step().export()
        })

        this.setData({
          anniversaryList: list,
          listAnimations
        }, () => {
          // 执行列表滑入动画
          setTimeout(() => {
            this.executeListAnimation()
          }, 100)
        })
      } else {
        wx.showToast({
          title: res.data?.message || '获取纪念日列表失败',
          icon: 'none'
        })
      }
    } catch (err) {
      console.error('获取纪念日列表失败:', err)
      wx.showToast({
        title: '网络请求失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
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

  // 选择日期
  onSelectDate(e) {
    const date = dayjs(e.detail).format('YYYY-MM-DD')
    this.setData({
      'newAnniversary.date': date
    })
  },

  // 显示添加弹窗
  showAddPopup() {
    // 执行按钮动画
    this.executeAddButtonAnimation()
    
    this.setData({
      showAddPopup: true,
      newAnniversary: {
        title: '',
        date: dayjs().format('YYYY-MM-DD'),
        type: 0,
        repeatType: 0,
        reminderDays: 7
      },
      reminderIndex: 3
    })
  },

  // 关闭添加弹窗
  onCloseAddPopup() {
    this.setData({
      showAddPopup: false
    })
  },

  // 显示详情弹窗
  showDetailPopup(e) {
    const item = e.currentTarget.dataset.item
    this.setData({
      showDetailPopup: true,
      currentAnniversary: item
    })
  },

  // 关闭详情弹窗
  onCloseDetailPopup() {
    this.setData({
      showDetailPopup: false,
      currentAnniversary: null
    })
  },

  // 输入标题
  onTitleInput(e) {
    this.setData({
      'newAnniversary.title': e.detail.value
    })
  },

  // 选择日期
  onDateChange(e) {
    this.setData({
      'newAnniversary.date': e.detail.value
    })
  },

  // 选择类型
  onTypeChange(e) {
    this.setData({
      'newAnniversary.type': parseInt(e.detail.value)
    })
  },

  // 选择重复类型
  onRepeatChange(e) {
    this.setData({
      'newAnniversary.repeatType': parseInt(e.detail.value)
    })
  },

  // 选择提醒时间
  onReminderChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      reminderIndex: index,
      'newAnniversary.reminderDays': this.data.reminderDaysMap[index]
    })
  },

  // 获取提醒索引
  getReminderIndex(days) {
    return this.data.reminderDaysMap.indexOf(days)
  },

  // 确认添加
  async onConfirmAdd() {
    const { title, date } = this.data.newAnniversary
    if (!title) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
      return
    }
    if (!date) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '添加中...',
      mask: true
    })

    try {
      const res = await wx.request({
        url: `${app.globalData.baseUrl}/api/anniversary`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`,
          'Content-Type': 'application/json'
        },
        data: this.data.newAnniversary
      })

      if (res.statusCode === 200 && res.data.code === 0) {
        // 添加成功动画
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        })
        
        this.setData({
          showAddPopup: false
        })
        
        // 重新加载列表并执行动画
        this.getAnniversaryList()
      } else {
        wx.showToast({
          title: res.data?.message || '添加失败',
          icon: 'none'
        })
      }
    } catch (err) {
      console.error('添加纪念日失败:', err)
      wx.showToast({
        title: '网络请求失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 删除纪念日
  onDeleteAnniversary() {
    wx.showModal({
      title: '提示',
      content: '确定要删除这个纪念日吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...',
            mask: true
          })

          try {
            const res = await wx.request({
              url: `${app.globalData.baseUrl}/api/anniversary/${this.data.currentAnniversary.id}`,
              method: 'DELETE',
              header: {
                'Authorization': `Bearer ${wx.getStorageSync('token')}`,
                'Content-Type': 'application/json'
              }
            })

            if (res.statusCode === 200 && res.data.code === 0) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              this.setData({
                showDetailPopup: false,
                currentAnniversary: null
              })
              this.getAnniversaryList()
            } else {
              wx.showToast({
                title: res.data?.message || '删除失败',
                icon: 'none'
              })
            }
          } catch (err) {
            console.error('删除纪念日失败:', err)
            wx.showToast({
              title: '网络请求失败',
              icon: 'none'
            })
          } finally {
            wx.hideLoading()
          }
        }
      }
    })
  },

  // 编辑纪念日
  onEditAnniversary() {
    this.setData({
      showDetailPopup: false,
      showAddPopup: true,
      newAnniversary: {
        ...this.data.currentAnniversary
      },
      reminderIndex: this.getReminderIndex(this.data.currentAnniversary.reminderDays)
    })
  }
}) 