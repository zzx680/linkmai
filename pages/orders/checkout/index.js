const api = require("../../../utils/api");

Page({
  data: {
    products: [],
    selectedSku: "claim_pack",
    loading: true,
    error: "",
    paying: false
  },

  onLoad() {
    this.loadProducts();
  },

  loadProducts() {
    this.setData({ loading: true, error: "" });
    api.getProducts()
      .then((products) => {
        this.setData({ products, loading: false });
      })
      .catch(() => {
        this.setData({ loading: false, error: "服务包加载失败，请稍后重试" });
      });
  },

  select(event) {
    this.setData({ selectedSku: event.currentTarget.dataset.sku });
  },

  pay() {
    if (!this.data.selectedSku || this.data.paying) return;
    this.setData({ paying: true });
    wx.showModal({
      title: "支付联调待接入",
      content: "正式上线时将通过后端创建订单，并使用 wx.requestPayment 拉起微信支付。",
      confirmText: "知道了",
      showCancel: false,
      complete: () => {
        this.setData({ paying: false });
      }
    });
  }
});
