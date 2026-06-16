const api = require("../../../utils/api");

Page({
  data: {
    documentDrafts: [],
    loading: true,
    error: "",
    generatingName: ""
  },

  onLoad() {
    this.loadDocuments();
  },

  loadDocuments() {
    this.setData({ loading: true, error: "" });
    api.getDocumentDrafts()
      .then((documentDrafts) => {
        this.setData({ documentDrafts, loading: false });
      })
      .catch(() => {
        this.setData({ loading: false, error: "文书清单加载失败，请稍后重试" });
      });
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
    this.setData({ generatingName: name });
    wx.showModal({
      title: "文书生成待接入",
      content: `${name} 将在正式版本通过后端生成辅助草稿，生成前会再次提示你核对材料。`,
      confirmText: "知道了",
      showCancel: false,
      complete: () => {
        this.setData({ generatingName: "" });
      }
    });
  }
});
