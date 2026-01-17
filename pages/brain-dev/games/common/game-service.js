/**
 * 游戏云端服务接口
 * 预留接口，后续对接云函数
 */
const gameService = {
  
  /**
   * 上传游戏记录并保存本地
   * @param {Object} data 游戏数据
   */
  async uploadRecord(data) {
    console.log('[GameService] 上传记录:', data);
    
    // 保存到本地历史记录
    try {
      const key = `game_history_${data.gameId}`;
      let history = wx.getStorageSync(key) || [];
      history.unshift({
        ...data,
        time: Date.now()
      });
      // 只保留最近50条
      if (history.length > 50) history = history.slice(0, 50);
      wx.setStorageSync(key, history);
      
      // 更新最高分
      const bestKey = `game_best_${data.gameId}`;
      const best = wx.getStorageSync(bestKey) || { score: 0, level: 0 };
      if (data.score > best.score) {
        wx.setStorageSync(bestKey, {
          score: data.score,
          level: data.level,
          reward: data.reward,
          time: Date.now()
        });
      }
    } catch (e) {
      console.error('保存记录失败', e);
    }
    
    // TODO: 对接云函数
    // return await wx.cloud.callFunction({
    //   name: 'gameRecord',
    //   data: { action: 'upload', ...data }
    // });
    
    return { success: true, data };
  },
  
  /**
   * 保存奖励积分到本地
   * @param {string} gameId 游戏ID
   * @param {number} reward 奖励积分
   */
  async saveRewardPoints(gameId, reward) {
    try {
      // 获取总积分
      let totalPoints = wx.getStorageSync('totalIntegral') || 0;
      totalPoints += reward;
      wx.setStorageSync('totalIntegral', totalPoints);
      
      // 获取各游戏积分
      let gamePoints = wx.getStorageSync('gameRewardPoints') || {};
      gamePoints[gameId] = (gamePoints[gameId] || 0) + reward;
      wx.setStorageSync('gameRewardPoints', gamePoints);
      
      console.log('[GameService] 积分已保存, 总积分:', totalPoints);
      return { success: true, totalPoints };
    } catch (e) {
      console.error('保存积分失败', e);
      return { success: false, error: e };
    }
  },
  
  /**
   * 获取本地积分
   */
  getLocalPoints() {
    return {
      total: wx.getStorageSync('totalRewardPoints') || 0,
      games: wx.getStorageSync('totalIntegral') || {}
    };
  },
  
  /**
   * 获取游戏最高分
   * @param {string} gameId 游戏ID
   */
  getBestScore(gameId) {
    return wx.getStorageSync(`game_best_${gameId}`) || { score: 0, level: 0 };
  },
  
  /**
   * 获取游戏历史记录
   * @param {string} gameId 游戏ID
   */
  getHistory(gameId) {
    return wx.getStorageSync(`game_history_${gameId}`) || [];
  },
  
  /**
   * 获取排行榜（预留）
   * @param {string} gameId 游戏ID
   * @param {number} limit 数量限制
   */
  async getRankList(gameId, limit = 10) {
    console.log('[GameService] 获取排行榜:', gameId);
    // TODO: 对接云函数
    return { success: true, data: [] };
  }
};

module.exports = gameService;