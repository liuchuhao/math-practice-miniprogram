/**
 * 数字密码 - 页面逻辑
 */
const game = require('./game');
const config = require('../common/game-config');
const gameService = require('../common/game-service');

Page({
  data: {
    gameState: 'ready',
    difficulty: 'easy',
    
    level: 1,
    score: 0,
    questionCount: 0,
    correctCount: 0,
    wrongCount: 0,
    
    totalTime: 60,
    timeWarning: false,
    
    countdown: 3,
    targetCode: [],
    options: [],
    digits: 3,
    
    memoryTime: 3,
    memoryProgress: 100,
    
    selectedIndex: -1,
    isCorrect: false,
    showFeedback: false,
    
    reward: 0,
    accuracy: 0,
    rankText: '',
    rankEmoji: ''
  },
  
  gameTimer: null,
  countdownTimer: null,
  memoryTimer: null,
  feedbackTimer: null,

  onDiffChange(e) {
    this.setData({ difficulty: e.currentTarget.dataset.diff });
  },

  onStart() {
    this.setData({
      gameState: 'countdown',
      level: 1,
      score: 0,
      questionCount: 0,
      correctCount: 0,
      wrongCount: 0,
      totalTime: config.GAME_DURATION,
      timeWarning: false,
      countdown: 3
    });
    this.startCountdown();
  },

  startCountdown() {
    this.clearAllTimers();
    let count = 3;
    
    this.countdownTimer = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(this.countdownTimer);
        this.startGameTimer();
        this.startMemorizing();
      } else {
        this.setData({ countdown: count });
      }
    }, 1000);
  },

  startGameTimer() {
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

  startMemorizing() {
    const { difficulty, level } = this.data;
    const levelData = game.generateLevel(difficulty, level);
    
    this.setData({
      gameState: 'memorizing',
      ...levelData,
      // 1. 初始化样式字符串
      barStyle: 'width:100%;',
      selectedIndex: -1,
      showFeedback: false
    });
    
    const duration = levelData.memoryTime * 1000;
    const startTime = Date.now();
    
    this.memoryTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.max(0, 100 - (elapsed / duration) * 100);
      
      // 2. 在 JS 中拼好完整样式，WXML 直接用
      this.setData({ 
        barStyle: `width:${progress.toFixed(1)}%;` 
      });
      
      if (elapsed >= duration) {
        clearInterval(this.memoryTimer);
        this.setData({ gameState: 'answering' });
      }
    }, 50);
  },

  onSelect(e) {
    if (this.data.selectedIndex !== -1 || this.data.gameState !== 'answering') return;
    
    const index = e.currentTarget.dataset.index;
    const { options, targetCode, score, level, questionCount, correctCount, wrongCount, digits } = this.data;
    
    const isCorrect = options[index].join('') === targetCode.join('');
    const scoreChange = game.calcScore(isCorrect, level, digits);
    const newScore = Math.max(0, score + scoreChange);
    
    let newLevel = level;
    let newCorrectCount = correctCount;
    let newWrongCount = wrongCount;
    
    if (isCorrect) {
      newCorrectCount++;
      newLevel = Math.min(Math.floor(newCorrectCount / 2) + 1, config.MAX_LEVEL);
    } else {
      newWrongCount++;
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
    
    wx.vibrateShort({ type: isCorrect ? 'light' : 'heavy' });
    
    this.feedbackTimer = setTimeout(() => {
      if (this.data.gameState !== 'ended') {
        this.startMemorizing();
      }
    }, 1000);
  },

  async endGame() {
    this.clearAllTimers();
    
    const { level, score, questionCount, correctCount, wrongCount, difficulty } = this.data;
    
    const reward = config.calcTotalReward(level, difficulty);
    const accuracy = questionCount > 0 ? Math.round((correctCount / questionCount) * 100) : 0;
    const rank = config.getRank(score, 1500);
    
    this.setData({
      gameState: 'ended',
      showFeedback: false,
      reward,
      accuracy,
      rankText: rank.text,
      rankEmoji: rank.emoji
    });
    
    await gameService.uploadRecord({
      gameId: 'digit_code',
      level,
      score,
      reward,
      difficulty,
      accuracy,
      questionCount,
      correctCount,
      wrongCount
    });
    
    await gameService.saveRewardPoints('digit_code', reward);
  },

  clearAllTimers() {
    if (this.gameTimer) clearInterval(this.gameTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    if (this.memoryTimer) clearInterval(this.memoryTimer);
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
    this.gameTimer = null;
    this.countdownTimer = null;
    this.memoryTimer = null;
    this.feedbackTimer = null;
  },

  onRetry() {
    this.setData({ gameState: 'ready' });
  },

  onBack() {
    wx.navigateBack();
  },

  onUnload() {
    this.clearAllTimers();
  }
});