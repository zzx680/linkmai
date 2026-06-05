const questions = [
  {
    title: "事故责任认定了吗？",
    hint: "如果还没拿到事故认定书，也可以先继续建档。",
    options: ["已认定，对方全责", "已认定，我方全责", "双方都有责任", "还没有认定"]
  },
  {
    title: "这次事故有人受伤吗？",
    hint: "轻微擦伤、门诊治疗也请选择有人受伤。",
    options: ["无人受伤", "轻微受伤", "已就医", "伤情较重"]
  },
  {
    title: "对方有保险吗？",
    hint: "不知道也没关系，后续可以补充保险信息。",
    options: ["有保险", "不确定", "无保险", "对方拒绝提供"]
  }
];

Page({
  data: {
    step: 0,
    questions,
    answers: []
  },

  choose(event) {
    const { value } = event.currentTarget.dataset;
    const answers = [...this.data.answers];
    answers[this.data.step] = value;
    this.setData({ answers });
  },

  next() {
    if (this.data.step < this.data.questions.length - 1) {
      this.setData({ step: this.data.step + 1 });
      return;
    }
    wx.navigateTo({ url: "/pages/cases/detail/index" });
  },

  prev() {
    if (this.data.step > 0) {
      this.setData({ step: this.data.step - 1 });
    }
  }
});

