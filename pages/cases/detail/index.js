const { caseSummary, tasks } = require("../../../utils/mock");

Page({
  data: {
    currentCase: caseSummary,
    tasks
  },

  goMaterials() {
    wx.switchTab({ url: "/pages/materials/index/index" });
  },

  goReport() {
    wx.navigateTo({ url: "/pages/claim/report/index" });
  },

  goCheckout() {
    wx.navigateTo({ url: "/pages/orders/checkout/index" });
  }
});

