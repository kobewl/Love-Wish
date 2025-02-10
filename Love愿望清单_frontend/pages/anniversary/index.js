const app = getApp()
var dayjs = require('../../utils/dayjs.min.js')

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
      date: '',  // 初始化时不设置日期
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
    formatter: null,
    isEdit: false,
    isPageActive: true
  },

  onLoad: function() {
    if (!app.checkLoginStatus()) return
    
    this.setData({ 
      isPageActive: true,
      'newAnniversary.date': dayjs().format('YYYY-MM-DD')  // 在onLoad时设置初始日期
    })
    
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
    const that = this
    this.setData({
      formatter(day) {
        if (!day) return day
        const date = dayjs(day.date).format('YYYY-MM-DD')
        const list = that.data.anniversaryList || []
        const matched = list.find(item => {
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
    })

    // 初始化完成后获取列表
    this.getAnniversaryList()
  },

  onUnload() {
    // 页面卸载时，标记页面为非活跃状态
    this.setData({ isPageActive: false })
  },

  // 安全的setData方法
  safeSetData(data, callback) {
    if (this.data.isPageActive) {
      this.setData(data, callback)
    }
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
      isEdit: false,  // 标记为新增模式
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
      showAddPopup: false,
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

  // 显示详情弹窗
  showDetailPopup(e) {
    const item = e.currentTarget.dataset.item
    if (!item) {
      wx.showToast({
        title: '数据异常',
        icon: 'none'
      })
      return
    }

    // 计算最新的倒计时天数
    const daysUntil = this.calculateDaysUntil(item.date, item.repeatType)
    const currentAnniversary = {
      ...item,
      daysUntil
    }

    this.setData({
      showDetailPopup: true,
      currentAnniversary
    })
  },

  // 关闭详情弹窗
  onCloseDetailPopup() {
    this.setData({
      showDetailPopup: false,
      currentAnniversary: null
    }, () => {
      // 关闭后重新获取列表，确保数据最新
      this.getAnniversaryList()
    })
  },

  // 输入标题
  onTitleInput(e) {
    const value = e.detail && (e.detail.value || e.detail)
    if (value === undefined || value === null) return
    
    this.safeSetData({
      'newAnniversary.title': String(value).trim()
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

  // 显示重复类型选择器
  onShowRepeatPicker() {
    this.setData({ showRepeatPicker: true })
  },

  // 关闭重复类型选择器
  onCloseRepeatPicker() {
    this.setData({ showRepeatPicker: false })
  },

  // 确认重复类型选择
  onConfirmRepeatPicker(e) {
    this.setData({
      'newAnniversary.repeatType': e.detail.index,
      showRepeatPicker: false
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
    const index = this.data.reminderDaysMap.indexOf(days)
    return index === -1 ? 3 : index // 默认7天
  },

  // 确认添加
  onConfirmAdd: function() {
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

    // 验证日期
    if (!date) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none',
        duration: 2000
      })
      return
    }

    wx.showLoading({
      title: '添加中...',
      mask: true
    })

    const requestData = {
      title: title.trim(),
      date: date,
      type: parseInt(type) || 0,
      repeatType: parseInt(repeatType) || 0,
      reminderDays: parseInt(reminderDays) || 7
    }

    console.log('提交的数据:', requestData)

    const that = this
    wx.request({
      url: `${app.globalData.baseUrl}/api/anniversary`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: requestData,
      success: function(res) {
        console.log('添加纪念日响应:', res)

        if (res.statusCode === 200 && res.data && res.data.code === 0) {
          wx.showToast({
            title: '添加成功',
            icon: 'success',
            duration: 2000
          })
          
          // 重置表单
          that.safeSetData({
            showAddPopup: false,
            newAnniversary: {
              title: '',
              date: dayjs().format('YYYY-MM-DD'),
              type: 0,
              repeatType: 0,
              reminderDays: 7
            },
            reminderIndex: 3
          })

          // 延迟刷新列表
          setTimeout(() => {
            if (that.data.isPageActive) {
              that.getAnniversaryList()
            }
          }, 1000)
        } else {
          wx.showToast({
            title: res.data?.message || '添加失败',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function(err) {
        console.error('添加纪念日失败:', err)
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        })
      },
      complete: function() {
        wx.hideLoading()
      }
    })
  },

  // 删除纪念日
  onDeleteAnniversary() {
    if (!this.data.currentAnniversary || !this.data.currentAnniversary.id) {
      wx.showToast({
        title: '数据异常',
        icon: 'none',
        duration: 2000
      })
      return
    }

    const currentId = this.data.currentAnniversary.id

    wx.showModal({
      title: '提示',
      content: '确定要删除这个纪念日吗？',
      success: (modalRes) => {
        if (modalRes.confirm) {
          wx.showLoading({
            title: '删除中...',
            mask: true
          })

          // 使用Promise包装wx.request
          wx.request({
            url: `${app.globalData.baseUrl}/api/anniversary/${currentId}`,
            method: 'DELETE',
            header: {
              'Authorization': `Bearer ${wx.getStorageSync('token')}`,
              'Content-Type': 'application/json'
            },
            success: (res) => {
              console.log('删除纪念日响应:', res)
              
              if (res.statusCode === 200) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 2000
                })
                
                // 关闭弹窗
                this.safeSetData({
                  showDetailPopup: false,
                  currentAnniversary: null
                })

                // 延迟刷新列表
                setTimeout(() => {
                  if (this.data.isPageActive) {
                    this.getAnniversaryList()
                  }
                }, 1000)
              } else {
                wx.showToast({
                  title: res.data?.message || '删除失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            fail: (err) => {
              console.error('删除纪念日失败:', err)
              wx.showToast({
                title: '网络请求失败',
                icon: 'none',
                duration: 2000
              })
            },
            complete: () => {
              wx.hideLoading()
              
              // 无论成功失败，都关闭弹窗并刷新列表
              this.safeSetData({
                showDetailPopup: false,
                currentAnniversary: null
              })
              
              setTimeout(() => {
                if (this.data.isPageActive) {
                  this.getAnniversaryList()
                }
              }, 1000)
            }
          })
        }
      }
    })
  },

  // 编辑纪念日
  onEditAnniversary() {
    const currentAnniversary = this.data.currentAnniversary
    if (!currentAnniversary || !currentAnniversary.id) {
      wx.showToast({
        title: '数据异常',
        icon: 'none',
        duration: 2000
      })
      return
    }

    this.safeSetData({
      showDetailPopup: false,
      showAddPopup: true,
      isEdit: true,  // 标记为编辑模式
      newAnniversary: {
        id: currentAnniversary.id,  // 确保ID被传递
        title: currentAnniversary.title,
        date: currentAnniversary.date,
        type: parseInt(currentAnniversary.type) || 0,
        repeatType: parseInt(currentAnniversary.repeatType) || 0,
        reminderDays: parseInt(currentAnniversary.reminderDays) || 7
      },
      reminderIndex: this.getReminderIndex(currentAnniversary.reminderDays)
    })
  },

  // 确认编辑
  onConfirmEdit: function() {
    const { id, title, date, type, repeatType, reminderDays } = this.data.newAnniversary
    
    // 验证ID
    if (!id) {
      wx.showToast({
        title: '数据异常',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 验证标题
    if (!title || title.trim() === '') {
      wx.showToast({
        title: '请输入标题',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 验证日期
    if (!date) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none',
        duration: 2000
      })
      return
    }

    wx.showLoading({
      title: '更新中...',
      mask: true
    })

    const requestData = {
      title: title.trim(),
      date: date,
      type: parseInt(type) || 0,
      repeatType: parseInt(repeatType) || 0,
      reminderDays: parseInt(reminderDays) || 7
    }

    console.log('更新的数据:', requestData)

    const that = this
    wx.request({
      url: `${app.globalData.baseUrl}/api/anniversary/${id}`,
      method: 'PUT',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: requestData,
      success: function(res) {
        console.log('更新纪念日响应:', res)

        if (res.statusCode === 200 && res.data && res.data.code === 0) {
          wx.showToast({
            title: '更新成功',
            icon: 'success',
            duration: 2000
          })
          
          // 重置表单并关闭弹窗
          that.safeSetData({
            showAddPopup: false,
            isEdit: false,
            newAnniversary: {
              title: '',
              date: dayjs().format('YYYY-MM-DD'),
              type: 0,
              repeatType: 0,
              reminderDays: 7
            },
            reminderIndex: 3
          })

          // 延迟刷新列表
          setTimeout(() => {
            if (that.data.isPageActive) {
              that.getAnniversaryList()
            }
          }, 1000)
        } else {
          wx.showToast({
            title: res.data?.message || '更新失败',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function(err) {
        console.error('更新纪念日失败:', err)
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        })
      },
      complete: function() {
        wx.hideLoading()
      }
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
  },

  // 确认按钮点击事件
  onConfirmPopup() {
    if (this.data.isEdit) {
      this.onConfirmEdit()
    } else {
      this.onConfirmAdd()
    }
  },

  // 标题输入事件
  onTitleChange(e) {
    this.setData({
      'newAnniversary.title': e.detail
    })
  },

  // 日历格式化函数
  calendarFormatter(day) {
    if (!day) return day
    const date = dayjs(day.date).format('YYYY-MM-DD')
    const list = this.data.anniversaryList || []
    const matched = list.find(item => {
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
  },

  // 更新愿望状态
  async updateWishStatus(id, status) {
    try {
      const token = wx.getStorageSync('token')
      if (!token) throw new Error('未登录')

      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/wish/${id}/status`,
          method: 'PUT',
          header: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: { status },
          success: resolve,
          fail: reject
        })
      })

      // 检查HTTP状态码
      if (res.statusCode !== 200) {
        throw new Error(res.data?.message || '网络请求失败')
      }

      // 检查业务状态码
      if (res.data.code !== 0) {
        throw new Error(res.data.message || '更新失败')
      }

      // 更新成功
      wx.showToast({
        title: '更新成功',
        icon: 'success',
        duration: 2000
      })

      // 延迟刷新列表
      setTimeout(() => {
        if (this.data.isPageActive) {
          this.getAnniversaryList()
        }
      }, 1000)

      return true
    } catch (err) {
      console.error('更新愿望状态失败:', err)
      wx.showToast({
        title: err.message || '更新失败',
        icon: 'none',
        duration: 2000
      })
      return false
    }
  }
}) 