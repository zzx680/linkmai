const { caseSummary, claimItems, missingImpacts } = require("../../../utils/mock");

Page({
  data: {
    currentCase: caseSummary,
    claimItems,
    missingImpacts
  },

  goMaterials() {
    wx.switchTab({ url: "/pages/materials/index/index" });
  },

  checkout() {
    wx.navigateTo({ url: "/pages/documents/index/index" });
  }
});
