const { caseSummary, productSteps, mainActions } = require("../../utils/mock");

Page({
  data: {
    currentCase: caseSummary,
    productSteps,
    mainActions
  },

  startCase() {
    wx.navigateTo({ url: "/pages/login/index" });
  },

  openCase() {
    wx.navigateTo({ url: "/pages/cases/detail/index" });
  },

  openAction(event) {
    const { path } = event.currentTarget.dataset;
    wx.navigateTo({ url: path });
  }
});
