Page({
  data: {
    rows: [
      { label: "我的订单", value: "1 个服务包" },
      { label: "人工复核记录", value: "暂无" },
      { label: "联系客服", value: "服务时间 9:00-18:00" },
      { label: "用户协议", path: "/pages/legal/terms/index" },
      { label: "隐私政策", path: "/pages/legal/privacy/index" },
      { label: "数据删除", value: "可删除案件材料" }
    ]
  },

  openRow(event) {
    const { path } = event.currentTarget.dataset;
    if (path) {
      wx.navigateTo({ url: path });
    }
  }
});

