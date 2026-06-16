const api = require("../../../utils/api");

Page({
  data: {
    cases: [],
    loading: true,
    error: ""
  },

  onLoad() {
    this.loadCases();
  },

  loadCases() {
    this.setData({ loading: true, error: "" });
    api.getCaseList()
      .then((cases) => {
        this.setData({ cases, loading: false });
      })
      .catch(() => {
        this.setData({ loading: false, error: "案件列表加载失败，请稍后重试" });
      });
  },

  openCase() {
    wx.navigateTo({ url: "/pages/cases/detail/index" });
  },

  createCase() {
    wx.navigateTo({ url: "/pages/login/index" });
  }
});
