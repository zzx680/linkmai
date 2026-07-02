const api = require("../../utils/api");

Page({
  data: {
    currentCase: null,
    productSteps: [],
    mainActions: [],
    loading: true,
    error: ""
  },

  onLoad() {
    this.loadHome();
  },

  loadHome() {
    this.setData({ loading: true, error: "" });
    api.getHomeData()
      .then((data) => {
        this.setData({
          currentCase: data.currentCase,
          productSteps: data.productSteps,
          mainActions: data.mainActions,
          loading: false
        });
      })
      .catch(() => {
        this.setData({ loading: false, error: "首页数据加载失败，请稍后重试" });
      });
  },

  startCase() {
    wx.navigateTo({ url: "/pages/login/index" });
  },

  openCase() {
    if (!this.data.currentCase) return;
    wx.navigateTo({ url: "/pages/cases/detail/index" });
  },

  openAction(event) {
    const { path } = event.currentTarget.dataset;
    if (!path) return;
    wx.navigateTo({ url: path });
  }
});
