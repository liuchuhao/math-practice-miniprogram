/**
 * 本地排行榜数据模块
 */
const localData = {
  
  // 获取用户基本信息
  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    const totalScore = wx.getStorageSync('totalIntegral') || 0;
    const totalGamesPlayed = wx.getStorageSync('total_game_count') || 0;
    
    return {
      userInfo,
      totalScore,
      totalGamesPlayed,
      userTitle: this.getTitle(totalScore)
    };
  },
  
  // 获取数学游戏数据
  getMathGames() {
    return {
      schulte3: wx.getStorageSync('schulte_best_3') || null,
      schulte4: wx.getStorageSync('schulte_best_4') || null,
      schulte5: wx.getStorageSync('schulte_best_5') || null,
      minesweeperBest: wx.getStorageSync('minesweeper_best_time') || null,
      minesweeperWins: wx.getStorageSync('minesweeper_win_count') || 0,
      klotski3: this.formatSteps('klotski_best_moves_3'),
      klotski4: this.formatSteps('klotski_best_moves_4'),
      klotski5: this.formatSteps('klotski_best_moves_5'),
      twentyfourWins: wx.getStorageSync('twentyfour_win_count') || 0,
      twentyfourStreak: wx.getStorageSync('twentyfour_max_streak') || 0,
      sudokuEasy: wx.getStorageSync('sudoku_wins_easy') || 0,
      sudokuMedium: wx.getStorageSync('sudoku_wins_medium') || 0,
      sudokuHard: wx.getStorageSync('sudoku_wins_hard') || 0
    };
  },
  
  // 获取大脑开发数据
  getBrainGames() {
    const floatingBest = wx.getStorageSync('game_best_floating') || {};
    const speedMathBest = wx.getStorageSync('game_best_speed_math') || {};
    const digitCodeBest = wx.getStorageSync('game_best_digit_code') || {};
    const qAvatarBest = wx.getStorageSync('game_best_q_avatar') || {};
    const hanziCubeBest = wx.getStorageSync('game_best_hanzi_cube') || {};
    const animalPartyBest = wx.getStorageSync('game_best_animal_party') || {};
    const gamePoints = wx.getStorageSync('gameRewardPoints') || {};
    
    const brainTotalReward = (gamePoints.floating || 0) + 
                             (gamePoints.speed_math || 0) + 
                             (gamePoints.digit_code || 0) + 
                             (gamePoints.q_avatar || 0) + 
                             (gamePoints.hanzi_cube || 0) + 
                             (gamePoints.animal_party || 0);

    return {
      floatingBest: floatingBest.score || null,
      floatingLevel: floatingBest.level || 0,
      speedMathBest: speedMathBest.score || null,
      speedMathLevel: speedMathBest.level || 0,
      digitCodeBest: digitCodeBest.score || null,
      digitCodeLevel: digitCodeBest.level || 0,
      qAvatarBest: qAvatarBest.score || null,
      qAvatarLevel: qAvatarBest.level || 0,
      hanziCubeBest: hanziCubeBest.score || null,
      hanziCubeLevel: hanziCubeBest.level || 0,
      animalPartyBest: animalPartyBest.score || null,
      animalPartyLevel: animalPartyBest.level || 0,
      brainTotalReward
    };
  },
  
  formatSteps(key) {
    const val = wx.getStorageSync(key);
    return val ? val + '步' : null;
  },
  
  getTitle(score) {
    if (score < 1000) return '倔强青铜';
    if (score < 5000) return '尊贵黄金';
    if (score < 10000) return '永恒钻石';
    if (score < 20000) return '至尊星耀';
    if (score < 50000) return '最强王者';
    return '荣耀王者';
  }
};

module.exports = localData;