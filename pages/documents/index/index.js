const { documentDrafts } = require("../../../utils/mock");

Page({
  data: {
    documentDrafts
  },

  generate(event) {
    const { name } = event.currentTarget.dataset;
    wx.showToast({
      title: `${name} 生成入口`,
      icon: "none"
    });
  }
});

