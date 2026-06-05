const { products } = require("../../../utils/mock");

Page({
  data: {
    products,
    selectedSku: "claim_pack"
  },

  select(event) {
    this.setData({ selectedSku: event.currentTarget.dataset.sku });
  },

  pay() {
    wx.showModal({
      title: "支付联调待接入",
      content: "正式上线时将通过后端创建订单，并使用 wx.requestPayment 拉起微信支付。",
      confirmText: "知道了",
      showCancel: false
    });
  }
});

