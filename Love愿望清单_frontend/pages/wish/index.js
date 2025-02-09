const app = getApp()

Page({
  data: {
    wishList: [],
    loading: true,
    showAddPopup: false,
    editingWish: null,
    newWish: {
      title: '',
      description: '',
      imageUrl: ''
    },
    tempImageUrl: '',
    activeTab: 0,
    tabs: [
      { title: '全部', type: 'ALL' },
      { title: '个人', type: 'PRIVATE' },
      { title: '共同', type: 'SHARED' },
      { title: '惊喜', type: 'SURPRISE' }
    ]
  },

  onLoad() {
    if (!app.checkLoginStatus()) return
    this.getWishList()
  },

  onShow() {
    if (!app.checkLoginStatus()) return
  },

  // 获取愿望列表
  async getWishList() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        throw new Error('未登录')
      }

      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/wish/my`,
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
        const wishList = records.map(item => ({
          id: item.id,
          userId: item.user_id,
          title: item.title,
          description: item.description || '',
          imageUrl: item.image_url || '',
          status: item.status || 0,
          createTime: item.create_time ? item.create_time.substring(0, 16).replace('T', ' ') : '',
          updateTime: item.update_time ? item.update_time.substring(0, 16).replace('T', ' ') : '',
          completeTime: item.complete_time ? item.complete_time.substring(0, 16).replace('T', ' ') : ''
        }))

        this.setData({ wishList })
      } else {
        throw new Error(res.data?.message || '获取愿望列表失败')
      }
    } catch (err) {
      console.error('获取愿望列表失败:', err)
      wx.showToast({
        title: err.message || '网络请求失败',
        icon: 'none',
        duration: 2000
      })
    } finally {
      wx.hideLoading()
      this.setData({ loading: false })
    }
  },

  // 显示添加弹窗
  showAddPopup() {
    this.setData({
      showAddPopup: true,
      editingWish: null,
      newWish: {
        title: '',
        description: '',
        imageUrl: ''
      },
      tempImageUrl: ''
    })
  },

  // 关闭添加弹窗
  onCloseAddPopup() {
    this.setData({
      showAddPopup: false,
      editingWish: null,
      newWish: {
        title: '',
        description: '',
        imageUrl: ''
      },
      tempImageUrl: ''
    })
  },

  // 输入标题
  onTitleInput(e) {
    this.setData({
      'newWish.title': e.detail.value || e.detail
    })
  },

  // 输入描述
  onDescInput(e) {
    this.setData({
      'newWish.description': e.detail.value || e.detail
    })
  },

  // 选择图片
  async chooseImage() {
    try {
      const res = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      if (res.tempFilePaths && res.tempFilePaths[0]) {
        // 先显示临时图片
        this.setData({
          tempImageUrl: res.tempFilePaths[0]
        })

        // 上传图片
        wx.showLoading({
          title: '上传中...',
          mask: true
        })

        const uploadRes = await wx.uploadFile({
          url: `${app.globalData.baseUrl}/api/file/upload`,
          filePath: res.tempFilePaths[0],
          name: 'file',
          header: {
            'Authorization': `Bearer ${wx.getStorageSync('token')}`
          }
        })

        wx.hideLoading()

        const data = JSON.parse(uploadRes.data)
        if (data.code === 0) {
          this.setData({
            'newWish.imageUrl': data.data.url
          })
        } else {
          app.showError('图片上传失败')
        }
      }
    } catch (err) {
      console.error('选择图片失败:', err)
      app.showError('选择图片失败')
    }
  },

  // 删除图片
  deleteImage() {
    this.setData({
      tempImageUrl: '',
      'newWish.imageUrl': ''
    })
  },

  // 确认添加/编辑
  async onConfirmAdd() {
    const { title, description } = this.data.newWish
    if (!title || !title.trim()) {
      wx.showToast({
        title: '请输入愿望标题',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: this.data.editingWish ? '更新中...' : '添加中...',
      mask: true
    })

    try {
      const url = this.data.editingWish
        ? `${app.globalData.baseUrl}/api/wish/${this.data.editingWish.id}`
        : `${app.globalData.baseUrl}/api/wish`
      
      const method = this.data.editingWish ? 'PUT' : 'POST'
      
      const requestData = {
        title: title.trim(),
        description: description ? description.trim() : '',
        imageUrl: this.data.newWish.imageUrl || ''
      }

      console.log('发送请求:', {
        url,
        method,
        data: requestData
      })

      const res = await new Promise((resolve, reject) => {
        wx.request({
          url,
          method,
          header: {
            'Authorization': `Bearer ${wx.getStorageSync('token')}`,
            'Content-Type': 'application/json'
          },
          data: requestData,
          success: resolve,
          fail: reject
        })
      })

      console.log('请求响应:', res)

      if (res.statusCode === 200 && res.data && res.data.code === 0) {
        // 清空表单并关闭弹窗
        this.setData({
          showAddPopup: false,
          editingWish: null,
          newWish: {
            title: '',
            description: '',
            imageUrl: ''
          },
          tempImageUrl: ''
        })

        wx.showToast({
          title: this.data.editingWish ? '更新成功' : '添加成功',
          icon: 'success',
          duration: 2000
        })
        
        // 延迟重新获取列表
        setTimeout(() => {
          this.getWishList()
        }, 1000)
      } else {
        throw new Error(res.data?.message || '请求失败')
      }
    } catch (err) {
      console.error('操作失败:', err)
      wx.showToast({
        title: err.message || '网络请求失败',
        icon: 'none',
        duration: 2000
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 切换愿望状态
  async toggleWishStatus(e) {
    const { id, status } = e.currentTarget.dataset
    
    wx.showLoading({
      title: '更新中...',
      mask: true
    })

    try {
      const res = await wx.request({
        url: `${app.globalData.baseUrl}/api/wish/${id}/status`,
        method: 'PUT',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`,
          'Content-Type': 'application/json'
        },
        data: {
          status: status === 1 ? 0 : 1
        }
      })

      if (res.statusCode === 200 && res.data.code === 0) {
        this.getWishList()
      } else {
        app.showError(res.data?.message || '更新失败')
      }
    } catch (err) {
      console.error('更新愿望状态失败:', err)
      app.showError('网络请求失败')
    } finally {
      wx.hideLoading()
    }
  },

  // 编辑愿望
  editWish(e) {
    const wish = e.currentTarget.dataset.item
    this.setData({
      showAddPopup: true,
      editingWish: wish,
      newWish: {
        title: wish.title,
        description: wish.description || '',
        imageUrl: wish.imageUrl || ''
      },
      tempImageUrl: wish.imageUrl || ''
    })
  },

  // 删除愿望
  deleteWish(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定要删除这个愿望吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...',
            mask: true
          })

          try {
            const res = await wx.request({
              url: `${app.globalData.baseUrl}/api/wish/${id}`,
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
              this.getWishList()
            } else {
              app.showError(res.data?.message || '删除失败')
            }
          } catch (err) {
            console.error('删除愿望失败:', err)
            app.showError('网络请求失败')
          } finally {
            wx.hideLoading()
          }
        }
      }
    })
  },

  // 切换标签
  onTabChange(e) {
    const index = e.detail.index
    this.setData({ 
      activeTab: index 
    })
    this.getWishList()
  }
}) 