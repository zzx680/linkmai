const api = require("../../../utils/api");

Page({
  data: {
    materials: [],
    loading: true,
    error: "",
    uploadingName: ""
  },

  onLoad() {
    this.loadMaterials();
  },

  loadMaterials() {
    this.setData({ loading: true, error: "" });
    api.getMaterials()
      .then((materials) => {
        this.setData({ materials, loading: false });
      })
      .catch(() => {
        this.setData({ loading: false, error: "材料清单加载失败，请稍后重试" });
      });
  },

  upload(event) {
    const { name } = event.currentTarget.dataset;
    this.setData({ uploadingName: name });
    wx.showModal({
      title: "上传联调待接入",
      content: `${name} 上传会在正式版本接入 wx.chooseMessageFile、OCR 和后端材料接口。`,
      confirmText: "知道了",
      showCancel: false,
      complete: () => {
        this.setData({ uploadingName: "" });
      }
    });
  }
});
