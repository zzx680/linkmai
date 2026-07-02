const api = require("../../../utils/api");

Page({
  data: {
    currentCase: null,
    tasks: [],
    stages: [],
    documentDrafts: [],
    loading: true,
    error: ""
  },

  onLoad() {
    this.loadDashboard();
  },

  loadDashboard() {
    this.setData({ loading: true, error: "" });
    api.getCaseDashboard()
      .then((data) => {
        this.setData({
          currentCase: data.currentCase,
          tasks: data.tasks,
          stages: data.stages,
          documentDrafts: data.documentDrafts,
          loading: false
        });
      })
      .catch(() => {
        this.setData({ loading: false, error: "案件看板加载失败，请稍后重试" });
      });
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
