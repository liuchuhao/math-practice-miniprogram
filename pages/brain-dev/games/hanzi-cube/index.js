/**
 * 汉字魔方 - 页面逻辑
 */
const game = require('./game');
const config = require('../common/game-config');
const gameService = require('../common/game-service');

Page({
  data: {
    gameState: 'ready',
    difficulty: 'medium',
    
    level: 1,
    score: 0,
    questionCount: 0,
    correctCount: 0,
    wrongCount: 0,
    
    totalTime: 60,
    timeWarning: false,
    
    characters: [],
    targetChar: '',
    gridSize: 4,
    
    selectedIndex: -1,
    isCorrect: false,
    showFeedback: false,
    showAnswer: false,
    
    reward: 0,
    accuracy: 0,
    rankText: '',
    rankEmoji: ''
  },
  
  gameTimer: null,
  feedbackTimer: null,

  onDiffChange(e) {
    this.setData({ difficulty: e.currentTarget.dataset.diff });
  },

  onStart() {
    this.setData({
      gameState: 'playing',
      level: 1,
      score: 0,
      questionCount: 0,
      correctCount: 0,
      wrongCount: 0,
      totalTime: config.GAME_DURATION,
      timeWarning: false
    });
    
    this.nextQuestion();
    this.startGameTimer();
  },

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

  nextQuestion() {
    const { difficulty, level } = this.data;
    const levelData = game.generateLevel(difficulty, level);
    
    this.setData({
      ...levelData,
      selectedIndex: -1,
      showFeedback: false,
      showAnswer: false
    });
  },

  onSelect(e) {
    if (this.data.selectedIndex !== -1 || this.data.showFeedback) return;
    
    const index = e.currentTarget.dataset.index;
    const { characters, score, level, questionCount, correctCount, wrongCount, gridSize } = this.data;
    
    const isCorrect = characters[index].isTarget;
    const scoreChange = game.calcScore(isCorrect, level, gridSize);
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
      showAnswer: !isCorrect,
      score: newScore,
      questionCount: questionCount + 1,
      correctCount: newCorrectCount,
      wrongCount: newWrongCount,
      level: newLevel
    });
    
    wx.vibrateShort({ type: isCorrect ? 'light' : 'heavy' });
    
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => {
      if (this.data.gameState === 'playing') {
        this.nextQuestion();
      }
    }, 800);
  },

  async endGame() {
    this.stopGameTimer();
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
      this.feedbackTimer = null;
    }
    
    const { level, score, questionCount, correctCount, wrongCount, difficulty } = this.data;
    
    const reward = config.calcTotalReward(level, difficulty);
    const accuracy = questionCount > 0 ? Math.round((correctCount / questionCount) * 100) : 0;
    const rank = config.getRank(score, 2000);
    
    this.setData({
      gameState: 'ended',
      showFeedback: false,
      showAnswer: false,
      reward,
      accuracy,
      rankText: rank.text,
      rankEmoji: rank.emoji
    });
    
    await gameService.uploadRecord({
      gameId: 'hanzi_cube',
      level,
      score,
      reward,
      difficulty,
      accuracy,
      questionCount,
      correctCount,
      wrongCount
    });
    
    await gameService.saveRewardPoints('hanzi_cube', reward);
  },

  onRetry() {
    this.setData({ gameState: 'ready' });
  },

  onBack() {
    wx.navigateBack();
  },

  onUnload() {
    this.stopGameTimer();
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
    }
  }
});