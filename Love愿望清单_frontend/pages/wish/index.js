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
    this.setData({ loading: true })
    try {
      const res = await wx.request({
        url: `${app.globalData.baseUrl}/api/wish/my`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (res.statusCode === 200 && res.data.code === 0) {
        this.setData({
          wishList: res.data.data.records,
          loading: false
        })
      } else {
        this.setData({ loading: false })
        app.showError(res.data?.message || '获取愿望列表失败')
      }
    } catch (err) {
      console.error('获取愿望列表失败:', err)
      this.setData({ loading: false })
      app.showError('网络请求失败')
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
      'newWish.title': e.detail
    })
  },

  // 输入描述
  onDescInput(e) {
    this.setData({
      'newWish.description': e.detail
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
    if (!title) {
      app.showError('请输入愿望标题')
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

      const res = await wx.request({
        url,
        method,
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`,
          'Content-Type': 'application/json'
        },
        data: this.data.newWish
      })

      if (res.statusCode === 200 && res.data.code === 0) {
        wx.showToast({
          title: this.data.editingWish ? '更新成功' : '添加成功',
          icon: 'success'
        })
        this.setData({
          showAddPopup: false,
          editingWish: null
        })
        this.getWishList()
      } else {
        app.showError(res.data?.message || (this.data.editingWish ? '更新失败' : '添加失败'))
      }
    } catch (err) {
      console.error(this.data.editingWish ? '更新愿望失败:' : '添加愿望失败:', err)
      app.showError('网络请求失败')
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