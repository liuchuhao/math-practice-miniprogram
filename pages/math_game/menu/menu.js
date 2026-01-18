Page({
  
  // 1. 跳转舒尔特方格
  goSchulte() {
    wx.navigateTo({ url: '/pages/math_game/schulte/schulte' });
  },

  // 2. 跳转数独
  goSudoku() {
    wx.navigateTo({ url: '/pages/math_game/sudoku/sudoku' });
  },

  // 3. 跳转数字华容道
  goKlotski() {
    wx.navigateTo({ url: '/pages/math_game/klotski/klotski' });
  },

  // 4. 跳转24点
  goTwentyFour() {
    wx.navigateTo({ url: '/pages/math_game/twentyfour/twentyfour' });
  },

  // 5. 跳转扫雷
  goMinesweeper() {
    wx.navigateTo({ url: '/pages/math_game/minesweeper/minesweeper' });
  },

  // 6. [核心修改] 跳转游戏战绩/排行榜
  goRank() {
    wx.navigateTo({
      // 指向新建的本地战绩页面
      url: '/pages/rank/index?tab=1&sub=1',
      fail: (err) => {
        console.error('跳转失败', err);
        wx.showToast({ title: '页面不存在', icon: 'none' });
      }
    });
  }
});