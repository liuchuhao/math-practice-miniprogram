Page({
  data: {
    userInfo: {},
    totalScore: 0,
    userTitle: '计算小白',
    totalGamesPlayed: 0,
    
    // 1. 舒尔特
    schulte3: null,
    schulte4: null,
    schulte5: null,
    
    // 2. 扫雷
    minesweeperBest: null,
    minesweeperWins: 0,
    
    // 3. 华容道
    klotski3: null,
    klotski4: null,
    klotski5: null,
    
    // 4. 24点
    twentyfourWins: 0,
    twentyfourStreak: 0,

    // 5. 数独 (新增)
    sudokuEasy: 0,
    sudokuMedium: 0,
    sudokuHard: 0
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    const totalScore = wx.getStorageSync('totalIntegral') || 0;
    
    // 读取总游戏次数 (请确保在任意游戏开始时: wx.setStorageSync('total_game_count', old + 1))
    const totalGamesPlayed = wx.getStorageSync('total_game_count') || 0;

    this.setData({
      userInfo,
      totalScore,
      userTitle: this.getTitle(totalScore),
      totalGamesPlayed
    });

    // --- 游戏数据读取 (必须和游戏里的存储 Key 对应) ---

    // 1. 舒尔特方格
    this.setData({
      schulte3: wx.getStorageSync('schulte_best_3') || null,
      schulte4: wx.getStorageSync('schulte_best_4') || null,
      schulte5: wx.getStorageSync('schulte_best_5') || null
    });

    // 2. 扫雷
    this.setData({
      minesweeperBest: wx.getStorageSync('minesweeper_best_time') || null,
      minesweeperWins: wx.getStorageSync('minesweeper_win_count') || 0
    });

    // 3. 华容道 (添加了 '步' 字后缀)
    this.setData({
      klotski3: this.formatSteps('klotski_best_moves_3'),
      klotski4: this.formatSteps('klotski_best_moves_4'),
      klotski5: this.formatSteps('klotski_best_moves_5')
    });
    
    // 4. 24点
    this.setData({
      twentyfourWins: wx.getStorageSync('twentyfour_win_count') || 0,
      twentyfourStreak: wx.getStorageSync('twentyfour_max_streak') || 0
    });

    // 5. 数独 (读取通关次数)
    this.setData({
      sudokuEasy: wx.getStorageSync('sudoku_wins_easy') || 0,
      sudokuMedium: wx.getStorageSync('sudoku_wins_medium') || 0,
      sudokuHard: wx.getStorageSync('sudoku_wins_hard') || 0
    });
  },

  formatSteps(key) {
    const val = wx.getStorageSync(key);
    return val ? val + '步' : null;
  },

  getTitle(score) {
    if (score < 100) return '计算小白';
    if (score < 500) return '计算学徒';
    if (score < 1000) return '计算新星';
    if (score < 2000) return '计算高手';
    if (score < 5000) return '计算大师';
    return '最强王者';
  }
});