const { caseSummary, claimItems } = require("../../../utils/mock");

Page({
  data: {
    currentCase: caseSummary,
    claimItems
  },

  checkout() {
    wx.navigateTo({ url: "/pages/orders/checkout/index" });
  }
});

