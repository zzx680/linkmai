const { caseSummary } = require("../../utils/mock");

Page({
  data: {
    currentCase: caseSummary,
    quickActions: [
      { label: "上传材料", path: "/pages/materials/index/index" },
      { label: "赔偿测算", path: "/pages/claim/report/index" },
      { label: "生成文书", path: "/pages/orders/checkout/index" },
      { label: "人工复核", path: "/pages/orders/checkout/index" }
    ]
  },

  startCase() {
    wx.navigateTo({ url: "/pages/login/index" });
  },

  openCase() {
    wx.navigateTo({ url: "/pages/cases/detail/index" });
  },

  openQuick(event) {
    const { path } = event.currentTarget.dataset;
    wx.navigateTo({ url: path });
  }
});
