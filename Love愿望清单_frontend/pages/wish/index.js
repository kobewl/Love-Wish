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
    ],
    showDetailPopup: false,
    currentWish: null,
    activeFilter: 'all',
    filteredWishList: [],
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

      console.log('获取到的愿望列表原始数据:', res.data)

      if (res.statusCode === 200 && res.data && res.data.code === 0) {
        const records = res.data.data.records || []
        const wishList = records.map(item => ({
          id: item.id,
          userId: item.userId,
          title: item.title,
          description: item.description || '',
          imageUrl: item.imageUrl && item.imageUrl !== 'null' ? item.imageUrl : '',
          status: item.status || 0,
          createTime: item.createTime ? item.createTime.substring(0, 19).replace('T', ' ') : '',
          updateTime: item.updateTime ? item.updateTime.substring(0, 19).replace('T', ' ') : '',
          completeTime: item.status === 1 && item.completeTime ? item.completeTime.substring(0, 19).replace('T', ' ') : ''
        }))

        console.log('处理后的愿望列表:', wishList)

        this.setData({ 
          wishList,
          filteredWishList: wishList
        })
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

        const token = wx.getStorageSync('token')
        if (!token) {
          throw new Error('未登录')
        }

        const uploadRes = await new Promise((resolve, reject) => {
          wx.uploadFile({
            url: `${app.globalData.baseUrl}/api/file/upload`,
            filePath: res.tempFilePaths[0],
            name: 'file',
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: resolve,
            fail: reject
          })
        })

        console.log('上传响应:', uploadRes)

        if (uploadRes.statusCode === 200) {
          const data = JSON.parse(uploadRes.data)
          if (data.code === 0 && data.data && data.data.url) {
            this.setData({
              'newWish.imageUrl': data.data.url
            })
            wx.showToast({
              title: '上传成功',
              icon: 'success',
              duration: 2000
            })
          } else {
            throw new Error(data.message || '上传失败')
          }
        } else {
          throw new Error('上传失败')
        }
      }
    } catch (err) {
      console.error('选择/上传图片失败:', err)
      wx.showToast({
        title: err.message || '操作失败',
        icon: 'none',
        duration: 2000
      })
    } finally {
      wx.hideLoading()
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
      console.log('更新愿望状态:', { id, status, newStatus: status === 1 ? 0 : 1 })
      
      // 先在本地更新状态，提供即时反馈
      const wishList = this.data.wishList.map(item => {
        if (item.id === id) {
          return { ...item, status: status === 1 ? 0 : 1 }
        }
        return item
      })
      this.setData({ wishList })

      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/wish/${id}/status`,
          method: 'PUT',
          header: {
            'Authorization': `Bearer ${wx.getStorageSync('token')}`,
            'Content-Type': 'application/json'
          },
          data: {
            status: status === 1 ? 0 : 1
          },
          success: resolve,
          fail: reject
        })
      })

      console.log('更新响应:', res)

      if (res.statusCode === 200 && res.data.code === 0) {
        wx.showToast({
          title: '更新成功',
          icon: 'success',
          duration: 2000
        })
      } else {
        // 如果服务器更新失败，回滚本地状态
        const wishList = this.data.wishList.map(item => {
          if (item.id === id) {
            return { ...item, status }
          }
          return item
        })
        this.setData({ wishList })
        
        throw new Error(res.data?.message || '更新失败')
      }
    } catch (err) {
      console.error('更新愿望状态失败:', err)
      wx.showToast({
        title: err.message || '网络请求失败',
        icon: 'none',
        duration: 2000
      })
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
  async deleteWish(e) {
    const id = e.currentTarget.dataset.id
    if (!id) {
      wx.showToast({
        title: '数据异常',
        icon: 'none',
        duration: 2000
      })
      return
    }

    try {
      const modalRes = await new Promise((resolve) => {
        wx.showModal({
          title: '提示',
          content: '确定要删除这个愿望吗？',
          success: resolve
        })
      })

      if (!modalRes.confirm) return

      wx.showLoading({
        title: '删除中...',
        mask: true
      })

      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/wish/${id}`,
          method: 'DELETE',
          header: {
            'Authorization': `Bearer ${wx.getStorageSync('token')}`,
            'Content-Type': 'application/json'
          },
          success: resolve,
          fail: reject
        })
      })

      console.log('删除响应:', res)

      if (res.statusCode === 200 && res.data && res.data.code === 0) {
        // 先在本地删除该愿望
        const wishList = this.data.wishList.filter(item => item.id !== id)
        this.setData({ wishList })

        wx.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 2000
        })

        // 延迟重新获取列表
        setTimeout(() => {
          this.getWishList()
        }, 1000)
      } else {
        throw new Error(res.data?.message || '删除失败')
      }
    } catch (err) {
      console.error('删除愿望失败:', err)
      wx.showToast({
        title: err.message || '网络请求失败',
        icon: 'none',
        duration: 2000
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 切换标签
  onTabChange(e) {
    const index = e.detail.index
    this.setData({ 
      activeTab: index 
    })
    this.getWishList()
  },

  // 显示愿望详情
  showWishDetail(e) {
    const wish = e.currentTarget.dataset.item
    if (!wish) return
    
    this.setData({
      showDetailPopup: true,
      currentWish: wish
    })
  },

  // 关闭详情弹窗
  onCloseDetailPopup() {
    this.setData({
      showDetailPopup: false,
      currentWish: null
    })
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url || (this.data.currentWish && this.data.currentWish.imageUrl)
    if (url) {
      wx.previewImage({
        urls: [url],
        current: url
      })
    }
  },

  // 筛选切换处理
  onFilterChange(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ activeFilter: type })
    this.filterWishList()
  },

  // 筛选愿望列表
  filterWishList() {
    const { wishList, activeFilter } = this.data
    let filteredList = []
    
    switch (activeFilter) {
      case 'ongoing':
        filteredList = wishList.filter(item => item.status === 0)
        break
      case 'completed':
        filteredList = wishList.filter(item => item.status === 1)
        break
      default:
        filteredList = wishList
    }
    
    this.setData({ filteredWishList: filteredList })
  },
}) 