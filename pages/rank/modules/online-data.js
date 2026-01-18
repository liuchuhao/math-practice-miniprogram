/**
 * 在线排行榜数据模块
 * pages/rank/modules/online-data.js
 */
const API_URL = 'https://lch97.cn/math_api/get_rank.php';
const BRAIN_API_URL = 'https://lch97.cn/math_api/get_brain_rank.php';
const TIMEOUT = 10000;

/**
 * 独立出来的格式化函数 (放在对象外面，避免 this 指向错误)
 */
function formatLevelText(level) {
  if (!level) return '普通';
  
  // 转成字符串并去除首尾空格，防止数据库有空格导致匹配失败
  const str = String(level).trim().toLowerCase();
  
  // 1. 匹配英文难度
  if (str === 'easy') return '简单';
  if (str === 'medium') return '中等';
  if (str === 'hard') return '困难';
  
  // 2. 匹配数字等级 (判断是否为纯数字)
  // 这里的正则意思是：匹配正整数
  if (/^\d+$/.test(str)) {
    return 'Lv.' + str;
  }
  
  // 3. 兜底：如果都不是，直接返回原文本
  return str;
}

const onlineData = {
  
  // 1. 数学练习排行榜
  getRankList(options) {
    const { grade, type, isTopRank } = options;
    return new Promise((resolve, reject) => {
      const requestTask = wx.request({
        url: API_URL,
        method: 'GET',
        data: { grade, type },
        timeout: TIMEOUT,
        success: (res) => {
          if (res.data && res.data.code === 200) {
            let rawList = res.data.data || [];
            rawList = rawList.map((item, index) => {
              if (!item.avatar) item.avatar = '/images/default_avatar.png';
              item.uniqueKey = 'rank_' + index;
              return item;
            });
            if (isTopRank) {
              const uniqueMap = new Map();
              const finalList = [];
              rawList.forEach(item => {
                if (!item.nickname || item.nickname.trim() === '') return;
                if (!uniqueMap.has(item.nickname)) {
                  uniqueMap.set(item.nickname, true);
                  finalList.push(item);
                }
              });
              resolve(finalList);
            } else {
              resolve(rawList);
            }
          } else {
            reject(new Error('数据格式错误'));
          }
        },
        fail: (err) => {
          console.error('请求失败:', err);
          reject(err);
        }
      });
      setTimeout(() => { requestTask.abort(); }, TIMEOUT + 1000);
    });
  },

    // 2. 大脑/数学排行榜
    getBrainRankList(params) {
      console.log('[调试] 发送请求参数:', params); // <--- 加这行
      return new Promise((resolve, reject) => {
        wx.request({
          url: BRAIN_API_URL,
          method: 'GET',
          data: {
            game_id: params.gameId || 'floating',
            level: params.level || ''
          },
          success: (res) => {
            if (res.data && res.data.code === 200) {
              const list = res.data.data.map((item, index) => {
                
                const diffText = formatLevelText(item.level);
                
                // ✨ 修复：安全处理 time_used
                let timeStr = '0.0';
                if (item.time_used !== null && item.time_used !== undefined) {
                  // 如果是纯数字字符串
                  if (!isNaN(parseFloat(item.time_used))) {
                    timeStr = parseFloat(item.time_used).toFixed(1);
                  } else {
                    // 如果是 00:30 这种格式，尝试保留
                    timeStr = item.time_used;
                  }
                }
  
                return {
                  ...item,
                  avatar: item.avatar || '/images/default_avatar.png',
                  uniqueKey: 'brain_' + index,
                  displayDiff: diffText,
                  rawLevel: String(item.level || '').trim(),
                  
                  // ✨ 赋值处理后的时间
                  time_used: timeStr
                };
              });
              resolve(list);
            } else {
              reject(res.data.msg || '请求失败');
            }
          },
          fail: (err) => {
            reject(err);
          }
        });
      });
    },
  
  checkUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    return userInfo && userInfo.nickName;
  }
};

module.exports = onlineData;