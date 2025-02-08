Component({
  data: {
    active: 0,
    list: [
      {
        icon: 'wap-home',
        text: '首页',
        url: '/pages/index/index'
      },
      {
        icon: 'calendar',
        text: '纪念日',
        url: '/pages/anniversary/index'
      },
      {
        icon: 'star',
        text: '愿望',
        url: '/pages/wish/index'
      },
      {
        icon: 'user',
        text: '我的',
        url: '/pages/user/index'
      }
    ]
  },

  methods: {
    onChange(event) {
      const index = event.detail;
      const url = this.data.list[index].url;
      wx.switchTab({
        url
      });
    },

    init() {
      const page = getCurrentPages().pop();
      const route = page ? page.route : 'pages/index/index';
      const active = this.data.list.findIndex(item => item.url.includes(route));
      this.setData({ active });
    }
  },

  lifetimes: {
    attached() {
      this.init();
    },
  },

  pageLifetimes: {
    show() {
      this.init();
    },
  }
}); 