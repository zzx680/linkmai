Page({
  data: {
    agreed: false,
    loggingIn: false
  },

  toggleAgree() {
    this.setData({ agreed: !this.data.agreed });
  },

  login() {
    if (this.data.loggingIn) return;
    if (!this.data.agreed) {
      wx.showToast({
        title: "请先同意协议和隐私政策",
        icon: "none"
      });
      return;
    }

    this.setData({ loggingIn: true });
    wx.showModal({
      title: "登录联调待接入",
      content: "正式上线时将通过 wx.login 获取 code，并由后端换取 openid/session。",
      confirmText: "继续建档",
      showCancel: false,
      success: () => {
        wx.navigateTo({ url: "/pages/intake/index" });
      },
      complete: () => {
        this.setData({ loggingIn: false });
      }
    });
  },

  openTerms() {
    wx.navigateTo({ url: "/pages/legal/terms/index" });
  },

  openPrivacy() {
    wx.navigateTo({ url: "/pages/legal/privacy/index" });
  }
});
