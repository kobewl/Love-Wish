Page({
  data: {
    wishList: [],
    activeTab: 0,
    tabs: [
      { title: '全部', type: 'ALL' },
      { title: '个人', type: 'PRIVATE' },
      { title: '共同', type: 'SHARED' },
      { title: '惊喜', type: 'SURPRISE' }
    ]
  },

  onLoad() {
    this.getWishList()
  },

  // 切换标签
  onTabChange(e) {
    const index = e.detail.index
    this.setData({ 
      activeTab: index 
    })
    this.getWishList()
  },

  // 获取愿望列表
  getWishList() {
    // TODO: 获取愿望列表
  }
}) 