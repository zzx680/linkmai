const { materials } = require("../../../utils/mock");

Page({
  data: {
    materials
  },

  upload(event) {
    const { name } = event.currentTarget.dataset;
    wx.showToast({
      title: `${name} 上传入口`,
      icon: "none"
    });
  }
});

