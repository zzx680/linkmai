const api = require("../../../utils/api");

Page({
  data: {
    currentCase: null,
    claimItems: [],
    missingImpacts: [],
    loading: true,
    error: ""
  },

  onLoad() {
    this.loadReport();
  },

  loadReport() {
    this.setData({ loading: true, error: "" });
    api.getCompensationReport()
      .then((data) => {
        this.setData({
          currentCase: data.currentCase,
          claimItems: data.claimItems,
          missingImpacts: data.missingImpacts,
          loading: false
        });
      })
      .catch(() => {
        this.setData({ loading: false, error: "赔偿测算加载失败，请稍后重试" });
      });
  },

  goMaterials() {
    wx.switchTab({ url: "/pages/materials/index/index" });
  },

  checkout() {
    wx.navigateTo({ url: "/pages/documents/index/index" });
  }
});
