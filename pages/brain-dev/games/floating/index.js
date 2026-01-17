/**
 * 漂浮乐园 - 页面逻辑
 * 模式：60秒计时，无限题目，等级递增
 * 规则：答对加分升级，答错扣分降级
 */
const game = require('./game');
const config = require('../common/game-config');
const gameService = require('../common/game-service');

Page({
  data: {
    // 游戏状态: ready, playing, ended
    gameState: 'ready',
    difficulty: 'easy',
    
    // 游戏数据
    level: 1,
    score: 0,
    questionCount: 0,
    correctCount: 0,
    wrongCount: 0,
    
    // 总计时
    totalTime: 60,
    timeWarning: false,
    
    // 关卡数据
    stars: [],
    options: [],
    correctAnswer: 0,
    
    // 答题状态
    selectedIndex: -1,
    isCorrect: false,
    showFeedback: false,
    
    // 结算数据
    reward: 0,
    accuracy: 0,
    rankText: '',
    rankEmoji: '',
    bestScore: 0
  },
  
  gameTimer: null,
  moveTimer: null,
  feedbackTimer: null,

  // 选择难度
  onDiffChange(e) {
    this.setData({ difficulty: e.currentTarget.dataset.diff });
  },

  // 开始游戏
  onStart() {
    const best = gameService.getBestScore('floating');
    
    this.setData({
      gameState: 'playing',
      level: 1,
      score: 0,
      questionCount: 0,
      correctCount: 0,
      wrongCount: 0,
      totalTime: config.GAME_DURATION,
      timeWarning: false,
      bestScore: best.score
    });
    
    this.nextQuestion();
    this.startGameTimer();
    this.startStarMovement();
  },

  // 游戏总计时器
  startGameTimer() {
    this.stopGameTimer();
    
    this.gameTimer = setInterval(() => {
      let { totalTime } = this.data;
      totalTime = Math.max(0, totalTime - 0.1);
      
      this.setData({
        totalTime: totalTime.toFixed(1),
        timeWarning: totalTime <= 10
      });
      
      if (totalTime <= 0) {
        this.endGame();
      }
    }, 100);
  },

  stopGameTimer() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
  },

  // 星星移动
  startStarMovement() {
    this.stopStarMovement();
    
    this.moveTimer = setInterval(() => {
      if (this.data.gameState !== 'playing') return;
      if (this.data.showFeedback) return;
      
      const updatedStars = game.updateStarPositions(this.data.stars);
      this.setData({ stars: updatedStars });
    }, 50);
  },

  stopStarMovement() {
    if (this.moveTimer) {
      clearInterval(this.moveTimer);
      this.moveTimer = null;
    }
  },

  // 生成下一题
  nextQuestion() {
    const { difficulty, level } = this.data;
    const levelData = game.generateLevel(difficulty, level);
    
    this.setData({
      ...levelData,
      selectedIndex: -1,
      showFeedback: false
    });
  },

  // 选择答案
  onSelect(e) {
    if (this.data.selectedIndex !== -1 || this.data.showFeedback) return;
    
    const { index, value } = e.currentTarget.dataset;
    const { correctAnswer, score, level, questionCount, correctCount, wrongCount } = this.data;
    
    const isCorrect = value === correctAnswer;
    
    // 计算得分（答错扣分）
    const scoreChange = game.calcScore(isCorrect, level);
    const newScore = Math.max(0, score + scoreChange); // 分数不能为负
    
    // 计算新等级
    let newLevel = level;
    let newCorrectCount = correctCount;
    let newWrongCount = wrongCount;
    
    if (isCorrect) {
      newCorrectCount++;
      // 每答对2题升一级，最高10级
      newLevel = Math.min(Math.floor(newCorrectCount / 2) + 1, config.MAX_LEVEL);
    } else {
      newWrongCount++;
      // 答错降级：每错2题降一级，最低1级
      const levelPenalty = Math.floor(newWrongCount / 2);
      newLevel = Math.max(1, Math.floor(newCorrectCount / 2) + 1 - levelPenalty);
    }
    
    this.setData({
      selectedIndex: index,
      isCorrect,
      showFeedback: true,
      score: newScore,
      questionCount: questionCount + 1,
      correctCount: newCorrectCount,
      wrongCount: newWrongCount,
      level: newLevel
    });
    
    // 震动反馈
    //wx.vibrateShort({ type: isCorrect ? 'light' : 'heavy' });
    
    // 0.8秒后下一题
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => {
      if (this.data.gameState === 'playing') {
        this.nextQuestion();
      }
    }, 800);
  },

  // 游戏结束
  async endGame() {
    this.stopGameTimer();
    this.stopStarMovement();
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
      this.feedbackTimer = null;
    }
    
    const { level, score, questionCount, correctCount, wrongCount, difficulty } = this.data;
    
    // 计算奖励积分：根据达到的等级
    const reward = config.calcTotalReward(level, difficulty);
    const accuracy = questionCount > 0 ? Math.round((correctCount / questionCount) * 100) : 0;
    const rank = config.getRank(score, 2000);
    
    this.setData({
      gameState: 'ended',
      showFeedback: false,
      reward,
      accuracy,
      rankText: rank.text,
      rankEmoji: rank.emoji
    });
    
    // 保存记录
    await gameService.uploadRecord({
      gameId: 'floating',
      level,
      score,
      reward,
      difficulty,
      accuracy,
      questionCount,
      correctCount,
      wrongCount
    });
    
    // 保存奖励积分到本地
    await gameService.saveRewardPoints('floating', reward);
  },

  // 重新开始
  onRetry() {
    this.setData({ gameState: 'ready' });
  },

  // 返回菜单
  onBack() {
    wx.navigateBack();
  },

  onUnload() {
    this.stopGameTimer();
    this.stopStarMovement();
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
    }
  }
});