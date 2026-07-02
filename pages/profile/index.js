const api = require("../../utils/api");

Page({
  data: {
    rows: [],
    loading: true,
    error: ""
  },

  onLoad() {
    this.loadProfile();
  },

  loadProfile() {
    this.setData({ loading: true, error: "" });
    api.getProfileRows()
      .then((rows) => {
        this.setData({ rows, loading: false });
      })
      .catch(() => {
        this.setData({ loading: false, error: "用户信息加载失败，请稍后重试" });
      });
  },

  openRow(event) {
    const { path } = event.currentTarget.dataset;
    if (path) {
      wx.navigateTo({ url: path });
    }
  }
});
