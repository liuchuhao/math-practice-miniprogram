Page({
  data: {
    selectedGrade: null
  },

  selectGrade(e) {
    const grade = e.currentTarget.dataset.grade;
    // 如果点的就是当前选中的，不重复操作
    if (this.data.selectedGrade === grade) return;
    
    this.setData({ selectedGrade: grade });
  },

  startGame(e) {
    const mode = e.currentTarget.dataset.mode;
    const grade = this.data.selectedGrade;
    
    if (!grade) {
      wx.showToast({ title: '请先选择年级', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: `/pages/problem_solving/index/index?grade=${grade}&mode=${mode}`
    });
  }
});