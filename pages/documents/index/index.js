const { documentDrafts } = require("../../../utils/mock");

Page({
  data: {
    documentDrafts
  },

  generate(event) {
    const { name } = event.currentTarget.dataset;
    const draft = this.data.documentDrafts.find((item) => item.name === name);
    if (draft && draft.status === "需补充") {
      wx.switchTab({ url: "/pages/materials/index/index" });
      return;
    }
    if (draft && draft.status === "需复核") {
      wx.navigateTo({ url: "/pages/orders/checkout/index" });
      return;
    }
    wx.showToast({
      title: `${name}辅助草稿生成入口`,
      icon: "none"
    });
  }
});
