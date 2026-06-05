const { caseSummary } = require("../../../utils/mock");

Page({
  data: {
    cases: [caseSummary]
  },

  openCase() {
    wx.navigateTo({ url: "/pages/cases/detail/index" });
  },

  createCase() {
    wx.navigateTo({ url: "/pages/login/index" });
  }
});
