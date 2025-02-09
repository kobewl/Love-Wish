const app = getApp()
const dayjs = require('dayjs')

Page({
  data: {
    minDate: new Date(2000, 0, 1).getTime(),
    maxDate: new Date(2099, 11, 31).getTime(),
    anniversaryList: [],
    loading: true,
    showAddPopup: false,
    showDetailPopup: false,
    currentAnniversary: null,
    newAnniversary: {
      title: '',
      date: dayjs().format('YYYY-MM-DD'),
      type: 0,
      repeatType: 0,
      reminderDays: 7
    },
    typeOptions: ['恋爱纪念日', '生日', '其他'],
    repeatOptions: ['不重复', '每年重复'],
    reminderOptions: ['不提醒', '提前1天', '提前3天', '提前7天', '提前14天', '提前30天'],
    reminderDaysMap: [0, 1, 3, 7, 14, 30],
    reminderIndex: 3,
    showRepeatPicker: false,
    showDatePicker: false,
    showTypePicker: false,
    showReminderPicker: false,
    animationData: {},
    slideAnimation: {},
    listAnimations: [],
    formatter: null
  },

  onLoad() {
    if (!app.checkLoginStatus()) return
    
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

    // 设置日历formatter
    this.setData({
      formatter: (day) => {
        if (!day || !this.data.anniversaryList) return day
        const date = dayjs(day.date).format('YYYY-MM-DD')
        const matched = this.data.anniversaryList.find(item => {
          if (!item || !item.date) return false
          if (item.repeatType === 0) {
            return item.date === date
          } else {
            return dayjs(item.date).format('MM-DD') === dayjs(date).format('MM-DD')
          }
        })
        
        if (matched) {
          return {
            ...day,
            bottomInfo: matched.title.substring(0, 6) + '...',
            className: 'anniversary-day'
          }
        }
        return day
      }
    }, () => {
      // 在设置完formatter后再获取纪念日列表
      this.getAnniversaryList()
    })
  },

  onShow() {
    if (!app.checkLoginStatus()) return
    
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
    this.setData({ loading: true })
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        throw new Error('未登录')
      }

      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/anniversary/my`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          success: resolve,
          fail: reject
        })
      })

      if (res.statusCode === 200 && res.data && res.data.code === 0) {
        const records = res.data.data.records || []
        // 限制数据大小，每次最多加载50条记录
        const processedList = records.slice(0, 50).map(item => ({
          id: item.id,
          title: item.title,
          date: item.date,
          type: parseInt(item.type) || 0,
          repeatType: parseInt(item.repeatType) || 0,
          reminderDays: parseInt(item.reminderDays) || 7,
          daysUntil: this.calculateDaysUntil(item.date, parseInt(item.repeatType) || 0)
        }))

        this.setData({
          anniversaryList: processedList
        }, () => {
          // 执行列表动画
          this.executeListAnimation()
        })
      } else {
        throw new Error(res.data?.message || '获取纪念日列表失败')
      }
    } catch (err) {
      console.error('获取纪念日列表失败:', err)
      wx.showToast({
        title: err.message || '网络请求失败',
        icon: 'none',
        duration: 2000
      })
    } finally {
      this.setData({ loading: false })
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
    const value = e.detail && (e.detail.value || e.detail);
    if (value === undefined || value === null) return;
    
    const title = String(value).trim();
    this.setData({
      'newAnniversary.title': title
    });
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

  // 显示重复类型选择器
  onShowRepeatPicker() {
    this.setData({
      showRepeatPicker: true
    });
  },

  // 关闭重复类型选择器
  onCloseRepeatPicker() {
    this.setData({
      showRepeatPicker: false
    });
  },

  // 选择重复类型
  onRepeatChange(e) {
    const { value, index } = e.detail;
    this.setData({
      'newAnniversary.repeatType': index,
      showRepeatPicker: false
    });
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
    const { title, date, type, repeatType, reminderDays } = this.data.newAnniversary
    
    // 验证标题
    if (!title || title.trim() === '') {
      wx.showToast({
        title: '请输入标题',
        icon: 'none',
        duration: 2000
      })
      return
    }

    wx.showLoading({
      title: '添加中...',
      mask: true
    })

    try {
      const requestData = {
        title: title.trim(),
        date: date,
        type: parseInt(type),
        repeatType: parseInt(repeatType),
        reminderDays: parseInt(reminderDays)
      }

      console.log('提交的数据:', requestData)

      const res = await wx.request({
        url: `${app.globalData.baseUrl}/api/anniversary`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`,
          'Content-Type': 'application/json'
        },
        data: requestData
      })

      console.log('添加纪念日响应:', res)

      if (res.statusCode === 200 && res.data && res.data.code === 0) {
        wx.showToast({
          title: '添加成功',
          icon: 'success',
          duration: 2000
        })
        this.setData({
          showAddPopup: false
        })
        // 重新加载列表
        setTimeout(() => {
          this.getAnniversaryList()
        }, 1000)
      } else {
        throw new Error(res.data?.message || '添加失败')
      }
    } catch (err) {
      console.error('添加纪念日失败:', err)
      wx.showToast({
        title: err.message || '网络请求失败',
        icon: 'none',
        duration: 2000
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
  },

  // 显示日期选择器
  onShowDatePicker() {
    const currentDate = this.data.newAnniversary.date ? 
      new Date(this.data.newAnniversary.date).getTime() : 
      new Date().getTime();
      
    this.setData({ 
      showDatePicker: true,
      currentDate: currentDate
    });
  },

  // 关闭日期选择器
  onCloseDatePicker() {
    this.setData({ showDatePicker: false })
  },

  // 确认日期选择
  onConfirmDatePicker(e) {
    const selectedDate = new Date(e.detail);
    const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');
    console.log('选择的日期:', formattedDate);
    
    this.setData({
      'newAnniversary.date': formattedDate,
      showDatePicker: false
    });
  },

  // 显示类型选择器
  onShowTypePicker() {
    this.setData({ showTypePicker: true })
  },

  // 关闭类型选择器
  onCloseTypePicker() {
    this.setData({ showTypePicker: false })
  },

  // 确认类型选择
  onConfirmTypePicker(e) {
    this.setData({
      'newAnniversary.type': e.detail.index,
      showTypePicker: false
    })
  },

  // 显示提醒选择器
  onShowReminderPicker() {
    this.setData({ showReminderPicker: true })
  },

  // 关闭提醒选择器
  onCloseReminderPicker() {
    this.setData({ showReminderPicker: false })
  },

  // 确认提醒选择
  onConfirmReminderPicker(e) {
    this.setData({
      reminderIndex: e.detail.index,
      'newAnniversary.reminderDays': this.data.reminderDaysMap[e.detail.index],
      showReminderPicker: false
    })
  },

  // 取消提醒选择
  onCancelReminderPicker() {
    this.setData({
      showReminderPicker: false
    })
  }
}) 