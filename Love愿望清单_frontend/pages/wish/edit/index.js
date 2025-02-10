import { uploadFile } from '../../../utils/upload'

Page({
  data: {
    // ... existing code ...
    imageUrl: '', // 愿望图片URL
  },

  // ... existing code ...

  /**
   * 选择并上传图片
   */
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        wx.showLoading({
          title: '上传中...',
        })
        try {
          const imageUrl = await uploadFile(tempFilePath, 'wish')
          this.setData({
            imageUrl
          })
        } catch (err) {
          wx.showToast({
            title: '上传失败',
            icon: 'error'
          })
        } finally {
          wx.hideLoading()
        }
      }
    })
  },

  /**
   * 删除图片
   */
  deleteImage() {
    this.setData({
      imageUrl: ''
    })
  },

  // ... existing code ...
}) 