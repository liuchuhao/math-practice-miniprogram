/**
 * 游戏云端服务接口
 * pages/brain-dev/common/game-service.js
 */
const gameService = {
  
  /**
   * 上传游戏记录并保存本地
   * @param {Object} data 游戏数据 {gameId, score, level, difficulty, ...}
   */
  async uploadRecord(data) {
    console.log('[GameService] 准备处理记录:', data);
    
    // 标记是否是新纪录
    let isNewRecord = false;
    let bestScore = 0;

    // ============================================
    // 1. 本地保存逻辑
    // ============================================
    try {
      // 保存历史 (只留最近50条)
      const key = `game_history_${data.gameId}`;
      let history = wx.getStorageSync(key) || [];
      history.unshift({ ...data, time: Date.now() });
      if (history.length > 50) history = history.slice(0, 50);
      wx.setStorageSync(key, history);
      
      // 更新本地最高分
      const bestKey = `game_best_${data.gameId}`;
      const best = wx.getStorageSync(bestKey) || { score: 0 };
      bestScore = best.score || 0;
      
      if (data.score > bestScore) {
        isNewRecord = true;
        wx.setStorageSync(bestKey, {
          score: data.score,
          level: data.level,
          reward: data.reward,
          time: Date.now()
        });
      }
    } catch (e) {
      console.error('保存本地记录失败', e);
    }

    // ============================================
    // 2. 云端上传逻辑 (新增过滤)
    // ============================================
    
    // 过滤A: 分数太低 (<=0) 不上传
    if (data.score <= 0) {
      console.log('[上传过滤] 分数为0，忽略');
      return { success: true, uploaded: false };
    }

    // 过滤B: 未打破本地记录且非首玩，不上传 (节省服务器资源)
    if (!isNewRecord && bestScore > 0) {
      console.log('[上传过滤] 未超过本地最高分，不上传');
      return { success: true, uploaded: false };
    }
    
    // 过滤C: 检查用户信息 (必须有昵称才能上榜)
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.nickName) {
      console.log('[上传过滤] 未授权用户信息，仅保存本地');
      return { success: true, uploaded: false };
    }

    // --- 开始上传 ---
    // 获取OpenID (如果没有则生成临时ID，最好在 app.js 里统一获取)
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      openid = 'user_' + Date.now() + Math.random().toString(36).substr(2);
      wx.setStorageSync('openid', openid);
    }

    // 统一等级字段 (兼容 difficulty 或 level)
    const uploadLevel = data.difficulty ? data.difficulty : (data.level || 1);
    
    // 统一时间字段 (兼容 avgTime, timeStr 等)
    // 如果是 "00:30" 这种字符串，后端PHP最好处理一下，或者前端这里转成秒
    let timeUsed = 0;
    if (typeof data.avgTime === 'number') timeUsed = data.avgTime;
    else if (typeof data.avgTime === 'string') timeUsed = parseFloat(data.avgTime);
    
    // 发起请求
    wx.request({
      url: 'https://lch97.cn/math_api/submit_brain_score.php', // 你的接口地址
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        openid: openid,
        nickname: userInfo.nickName,
        avatar: userInfo.avatarUrl || '',
        game_id: data.gameId,
        level: uploadLevel, 
        score: data.score,
        time_used: timeUsed
      },
      success: (res) => {
        console.log('[GameService] 上传成功:', res.data);
      },
      fail: (err) => {
        console.error('[GameService] 上传失败:', err);
      }
    });
    
    return { success: true, data };
  },
  
  /**
   * 保存奖励积分到本地
   * @param {string} gameId 游戏ID
   * @param {number} reward 奖励积分
   */
  async saveRewardPoints(gameId, reward) {
    try {
      // 统一使用 'totalIntegral' 作为总积分 Key
      let totalPoints = wx.getStorageSync('totalIntegral') || 0;
      totalPoints += reward;
      wx.setStorageSync('totalIntegral', totalPoints);
      
      // 保存各游戏分项积分
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
      // 修复 Key 名，确保和 saveRewardPoints 一致
      total: wx.getStorageSync('totalIntegral') || 0,
      games: wx.getStorageSync('gameRewardPoints') || {}
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
    // TODO: 这里可以发起 wx.request 请求 get_brain_rank.php
    return { success: true, data: [] };
  }
};

module.exports = gameService;