const { caseSummary, tasks, stages, documentDrafts } = require("../../../utils/mock");

Page({
  data: {
    currentCase: caseSummary,
    tasks,
    stages,
    documentDrafts
  },

  goMaterials() {
    wx.switchTab({ url: "/pages/materials/index/index" });
  },

  goReport() {
    wx.navigateTo({ url: "/pages/claim/report/index" });
  },

  goCheckout() {
    wx.navigateTo({ url: "/pages/orders/checkout/index" });
  },

  goDocuments() {
    wx.navigateTo({ url: "/pages/documents/index/index" });
  }
});
