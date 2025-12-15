// pages/generatePaperGrade5/generatePaperGrade5.js
Page({
  data: {
    activeTab: 'config',
    paperTitle: '五年级数学计算练习卷',
    isGenerating: false,
    showAnswerInputs: false,
    showScore: false,
    
    // 题目配置
    questionConfig: [
      { type: 'type1', name: '小数乘除法', count: 5, score: 5 },
      { type: 'type2', name: '分数四则运算', count: 5, score: 5 },
      { type: 'type3', name: '简易方程', count: 5, score: 5 },
      { type: 'type4', name: '百分数计算', count: 5, score: 5 },
      { type: 'type5', name: '综合运算', count: 5, score: 6 }
    ],
    
    questions: [],
    userAnswers: {},
    score: 0,
    correctCount: 0,
    totalCount: 0,
    totalScore: 0
  },

  onLoad: function() {
    this.computeTotals();
  },

  // 计算总数
  computeTotals: function() {
    const config = this.data.questionConfig;
    let totalCount = 0;
    let totalScore = 0;
    
    for (const item of config) {
      totalCount += item.count;
      totalScore += item.count * item.score;
    }
    
    this.setData({
      totalCount,
      totalScore
    });
  },

  // 切换选项卡
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 切换到配置页面
  switchToConfig: function() {
    this.setData({ activeTab: 'config' });
  },

  // 处理试卷标题输入
  onTitleInput: function(e) {
    this.setData({
      paperTitle: e.detail.value
    });
  },

  // 更新题目数量
  updateQuestionCount: function(e) {
    const { type } = e.currentTarget.dataset;
    let value = parseInt(e.detail.value) || 0;
    value = Math.max(0, Math.min(50, value));
    
    this.updateConfigCount(type, value);
  },

  // 更新配置
  updateConfigCount: function(type, count) {
    const config = this.data.questionConfig;
    const newConfig = config.map(item => {
      if (item.type === type) {
        return { ...item, count: count };
      }
      return item;
    });
    
    this.setData({
      questionConfig: newConfig
    }, () => {
      this.computeTotals();
    });
  },

  // 生成试卷
  generatePaper: function() {
    if (this.data.isGenerating) return;
    
    this.setData({ isGenerating: true });
    
    setTimeout(() => {
      const questions = this.generateQuestions();
      
      this.setData({
        questions,
        isGenerating: false,
        activeTab: 'preview',
        userAnswers: {},
        showAnswerInputs: false,
        score: 0,
        correctCount: 0,
        showScore: false
      });
      
      wx.showToast({
        title: '试卷生成成功',
        icon: 'success'
      });
    }, 800);
  },

  // 生成题目
generateQuestions: function() {
  const questions = [];
  const config = this.data.questionConfig;
  let questionId = 1;
  
  console.log('开始生成题目...');
  
  // 生成小数乘除法
  for (let i = 0; i < config[0].count; i++) {
    const q = this.generateType1Question(questionId++, config[0].score);
    questions.push(q);
    console.log(`题目${questionId-1}:`, q);
  }
  
  // 生成分数四则运算
  for (let i = 0; i < config[1].count; i++) {
    const q = this.generateType2Question(questionId++, config[1].score);
    questions.push(q);
    console.log(`题目${questionId-1}:`, q);
  }
  
  // 生成简易方程
  for (let i = 0; i < config[2].count; i++) {
    const q = this.generateType3Question(questionId++, config[2].score);
    questions.push(q);
    console.log(`题目${questionId-1}:`, q);
  }
  
  // 生成百分数计算
  for (let i = 0; i < config[3].count; i++) {
    const q = this.generateType4Question(questionId++, config[3].score);
    questions.push(q);
    console.log(`题目${questionId-1}:`, q);
  }
  
  // 生成综合运算
  for (let i = 0; i < config[4].count; i++) {
    const q = this.generateType5Question(questionId++, config[4].score);
    questions.push(q);
    console.log(`题目${questionId-1}:`, q);
  }
  
  console.log('总共生成题目数量:', questions.length);
  console.log('题目数组:', questions);
  
  return questions;
},

  // 生成小数乘除法
  generateType1Question: function(id, score) {
    const operation = Math.random() > 0.5 ? 'multiplication' : 'division';
    
    let question, answer;
    
    if (operation === 'multiplication') {
      // 小数乘法：如 2.5 × 3.2
      const decimal1 = parseFloat((Math.random() * 9 + 0.1).toFixed(2));
      const decimal2 = parseFloat((Math.random() * 9 + 0.1).toFixed(2));
      question = `${decimal1} × ${decimal2} =`;
      answer = (decimal1 * decimal2).toFixed(4);
      // 去除末尾的0
      answer = parseFloat(answer).toString();
    } else {
      // 小数除法：如 7.2 ÷ 0.3
      const divisor = parseFloat((Math.random() * 9 + 0.1).toFixed(2));
      let quotient = parseFloat((Math.random() * 9 + 0.1).toFixed(2));
      
      // 确保能整除或得到有限小数
      const dividend = parseFloat((divisor * quotient).toFixed(4));
      question = `${dividend} ÷ ${divisor} =`;
      answer = quotient.toFixed(4);
      answer = parseFloat(answer).toString();
    }
    
    return {
      id: id.toString(),
      type: 'type1',
      category: '小数乘除法',
      score: score,
      question: question,
      answer: answer
    };
  },

  // 生成分数四则运算
generateType2Question: function(id, score) {
  // 生成两个分数
  const denominator1 = Math.floor(Math.random() * 8) + 2; // 2-9
  const denominator2 = Math.floor(Math.random() * 8) + 2; // 2-9
  const numerator1 = Math.floor(Math.random() * (denominator1 - 1)) + 1;
  const numerator2 = Math.floor(Math.random() * (denominator2 - 1)) + 1;
  
  const operations = ['+', '-', '×', '÷'];
  const operation = operations[Math.floor(Math.random() * 4)];
  
  let question, answer;
  let isReversed = false;
  
  if (operation === '+') {
    // 加法：通分后相加
    question = `${numerator1}/${denominator1} + ${numerator2}/${denominator2} =`;
    const lcm = this.lcm(denominator1, denominator2);
    const newNumerator1 = numerator1 * (lcm / denominator1);
    const newNumerator2 = numerator2 * (lcm / denominator2);
    const sumNumerator = newNumerator1 + newNumerator2;
    answer = this.simplifyFraction(`${sumNumerator}/${lcm}`);
  } else if (operation === '-') {
    // 减法：确保结果为正数
    const value1 = numerator1 / denominator1;
    const value2 = numerator2 / denominator2;
    
    if (value1 >= value2) {
      question = `${numerator1}/${denominator1} - ${numerator2}/${denominator2} =`;
      const lcm = this.lcm(denominator1, denominator2);
      const newNumerator1 = numerator1 * (lcm / denominator1);
      const newNumerator2 = numerator2 * (lcm / denominator2);
      const diffNumerator = newNumerator1 - newNumerator2;
      answer = this.simplifyFraction(`${diffNumerator}/${lcm}`);
    } else {
      question = `${numerator2}/${denominator2} - ${numerator1}/${denominator1} =`;
      const lcm = this.lcm(denominator1, denominator2);
      const newNumerator1 = numerator1 * (lcm / denominator1);
      const newNumerator2 = numerator2 * (lcm / denominator2);
      const diffNumerator = newNumerator2 - newNumerator1;
      answer = this.simplifyFraction(`${diffNumerator}/${lcm}`);
      isReversed = true;
    }
  } else if (operation === '×') {
    // 乘法：分子乘分子，分母乘分母
    question = `${numerator1}/${denominator1} × ${numerator2}/${denominator2} =`;
    const productNumerator = numerator1 * numerator2;
    const productDenominator = denominator1 * denominator2;
    answer = this.simplifyFraction(`${productNumerator}/${productDenominator}`);
  } else {
    // 除法：乘以倒数
    if (numerator2 === 0) {
      // 避免除数为0
      const newNumerator2 = Math.floor(Math.random() * (denominator2 - 1)) + 1;
      question = `${numerator1}/${denominator1} ÷ ${newNumerator2}/${denominator2} =`;
      const productNumerator = numerator1 * denominator2;
      const productDenominator = denominator1 * newNumerator2;
      answer = this.simplifyFraction(`${productNumerator}/${productDenominator}`);
    } else {
      question = `${numerator1}/${denominator1} ÷ ${numerator2}/${denominator2} =`;
      const productNumerator = numerator1 * denominator2;
      const productDenominator = denominator1 * numerator2;
      answer = this.simplifyFraction(`${productNumerator}/${productDenominator}`);
    }
  }
  
  return {
    id: id.toString(),
    type: 'fraction',
    category: '分数四则运算',
    score: score,
    question: question,
    answer: answer,
    // 为分数显示准备数据
    fractionData: {
      numerator1: isReversed ? numerator2 : numerator1,
      denominator1: isReversed ? denominator2 : denominator1,
      numerator2: isReversed ? numerator1 : numerator2,
      denominator2: isReversed ? denominator1 : denominator2,
      operator: operation,
      isReversed: isReversed
    }
  };
},

  // 生成简易方程
  generateType3Question: function(id, score) {
    // 生成形如 ax + b = c 或 ax - b = c 的方程
    const a = Math.floor(Math.random() * 9) + 2; // 2-10
    let b = Math.floor(Math.random() * 19) + 1; // 1-19
    const operator = Math.random() > 0.5 ? '+' : '-';
    
    // 确保x是整数或简单分数
    let x, c;
    
    if (Math.random() > 0.5) {
      // x是整数
      x = Math.floor(Math.random() * 9) + 1; // 1-9
      if (operator === '+') {
        c = a * x + b;
      } else {
        c = a * x - b;
        // 确保c为正数
        while (c <= 0) {
          b = Math.floor(Math.random() * 9) + 1;
          c = a * x - b;
        }
      }
    } else {
      // x是简单分数，如1/2
      const numerator = Math.floor(Math.random() * 3) + 1; // 1-3
      const denominator = Math.floor(Math.random() * 3) + 2; // 2-4
      x = numerator / denominator;
      
      if (operator === '+') {
        c = a * x + b;
      } else {
        c = a * x - b;
        // 确保c为正数
        while (c <= 0) {
          b = Math.floor(Math.random() * 9) + 1;
          c = a * x - b;
        }
      }
      
      // 将c转换为分数形式
      c = parseFloat(c.toFixed(4));
    }
    
    const question = `${a}x ${operator} ${b} = ${c}`;
    const answer = this.formatAnswer(x);
    
    return {
      id: id.toString(),
      type: 'equation',
      category: '简易方程',
      score: score,
      question: question,
      answer: answer
    };
  },

  // 生成百分数计算
  generateType4Question: function(id, score) {
    const types = ['percentOf', 'increase', 'decrease'];
    const type = types[Math.floor(Math.random() * 3)];
    
    let question, answer;
    
    if (type === 'percentOf') {
      // 求一个数的百分之几是多少
      const number = Math.floor(Math.random() * 900) + 100; // 100-999
      const percent = Math.floor(Math.random() * 50) + 10; // 10-59
      question = `求 ${number} 的 ${percent}% 是多少？`;
      answer = (number * percent / 100).toString();
    } else if (type === 'increase') {
      // 求比一个数增加百分之几是多少
      const number = Math.floor(Math.random() * 900) + 100; // 100-999
      const percent = Math.floor(Math.random() * 40) + 10; // 10-49
      question = `${number} 增加 ${percent}% 是多少？`;
      answer = (number * (1 + percent / 100)).toString();
    } else {
      // 求比一个数减少百分之几是多少
      const number = Math.floor(Math.random() * 900) + 100; // 100-999
      const percent = Math.floor(Math.random() * 40) + 10; // 10-49
      question = `${number} 减少 ${percent}% 是多少？`;
      answer = (number * (1 - percent / 100)).toString();
    }
    
    return {
      id: id.toString(),
      type: 'percent',
      category: '百分数计算',
      score: score,
      question: question,
      answer: answer
    };
  },

  // 生成综合运算
  generateType5Question: function(id, score) {
    // 生成包含小数、分数、括号的综合运算
    const num1 = Math.floor(Math.random() * 20) + 10; // 10-29
    const num2 = Math.floor(Math.random() * 9) + 2; // 2-10
    const num3 = Math.floor(Math.random() * 9) + 2; // 2-10
    const hasDecimal = Math.random() > 0.5;
    const hasFraction = Math.random() > 0.5;
    const hasParentheses = Math.random() > 0.5;
    
    let question, answer;
    
    if (hasParentheses) {
      // 带括号的运算
      const operators = ['+', '-', '×', '÷'];
      const op1 = operators[Math.floor(Math.random() * 4)];
      const op2 = operators[Math.floor(Math.random() * 4)];
      
      if (hasDecimal && hasFraction) {
        // 包含小数和分数
        const decimal = parseFloat((Math.random() * 9 + 0.1).toFixed(1));
        const denominator = Math.floor(Math.random() * 8) + 2;
        const numerator = Math.floor(Math.random() * (denominator - 1)) + 1;
        
        question = `(${decimal} ${op1} ${num2}) ${op2} ${numerator}/${denominator}`;
        // 计算答案
        let result = this.calculateExpression([decimal, op1, num2]);
        if (op2 === '+') {
          result += numerator / denominator;
        } else if (op2 === '-') {
          result -= numerator / denominator;
        } else if (op2 === '×') {
          result *= numerator / denominator;
        } else {
          result /= numerator / denominator;
        }
        answer = parseFloat(result.toFixed(4)).toString();
      } else if (hasDecimal) {
        // 只包含小数
        const decimal1 = parseFloat((Math.random() * 9 + 0.1).toFixed(1));
        const decimal2 = parseFloat((Math.random() * 9 + 0.1).toFixed(1));
        question = `(${decimal1} ${op1} ${decimal2}) ${op2} ${num3}`;
        let result = this.calculateExpression([decimal1, op1, decimal2]);
        if (op2 === '+') {
          result += num3;
        } else if (op2 === '-') {
          result -= num3;
        } else if (op2 === '×') {
          result *= num3;
        } else {
          result /= num3;
        }
        answer = parseFloat(result.toFixed(4)).toString();
      } else if (hasFraction) {
        // 只包含分数
        const denominator1 = Math.floor(Math.random() * 8) + 2;
        const numerator1 = Math.floor(Math.random() * (denominator1 - 1)) + 1;
        const denominator2 = Math.floor(Math.random() * 8) + 2;
        const numerator2 = Math.floor(Math.random() * (denominator2 - 1)) + 1;
        
        question = `(${numerator1}/${denominator1} ${op1} ${numerator2}/${denominator2}) ${op2} ${num3}`;
        // 计算括号内的值
        let value1, value2;
        if (op1 === '+') {
          const lcm = this.lcm(denominator1, denominator2);
          const newNum1 = numerator1 * (lcm / denominator1);
          const newNum2 = numerator2 * (lcm / denominator2);
          value1 = (newNum1 + newNum2) / lcm;
        } else if (op1 === '-') {
          const lcm = this.lcm(denominator1, denominator2);
          const newNum1 = numerator1 * (lcm / denominator1);
          const newNum2 = numerator2 * (lcm / denominator2);
          value1 = (newNum1 - newNum2) / lcm;
        } else if (op1 === '×') {
          value1 = (numerator1 * numerator2) / (denominator1 * denominator2);
        } else {
          value1 = (numerator1 * denominator2) / (denominator1 * numerator2);
        }
        
        let result;
        if (op2 === '+') {
          result = value1 + num3;
        } else if (op2 === '-') {
          result = value1 - num3;
        } else if (op2 === '×') {
          result = value1 * num3;
        } else {
          result = value1 / num3;
        }
        answer = parseFloat(result.toFixed(4)).toString();
      } else {
        // 整数运算
        question = `(${num1} ${op1} ${num2}) ${op2} ${num3}`;
        let result = this.calculateExpression([num1, op1, num2]);
        if (op2 === '+') {
          result += num3;
        } else if (op2 === '-') {
          result -= num3;
        } else if (op2 === '×') {
          result *= num3;
        } else {
          result = Math.floor(result / num3);
        }
        answer = result.toString();
      }
    } else {
      // 不带括号的运算
      const operators = ['+', '-', '×', '÷'];
      const op1 = operators[Math.floor(Math.random() * 4)];
      const op2 = operators[Math.floor(Math.random() * 4)];
      const op3 = operators[Math.floor(Math.random() * 2)]; // +或-
      
      if (hasDecimal) {
        const decimal1 = parseFloat((Math.random() * 9 + 0.1).toFixed(1));
        const decimal2 = parseFloat((Math.random() * 9 + 0.1).toFixed(1));
        const decimal3 = parseFloat((Math.random() * 9 + 0.1).toFixed(1));
        
        question = `${decimal1} ${op1} ${decimal2} ${op2} ${decimal3} ${op3} ${num3}`;
        const expression = [decimal1, op1, decimal2, op2, decimal3, op3, num3];
        const result = this.calculateExpression(expression);
        answer = parseFloat(result.toFixed(4)).toString();
      } else if (hasFraction) {
        const denominator1 = Math.floor(Math.random() * 8) + 2;
        const numerator1 = Math.floor(Math.random() * (denominator1 - 1)) + 1;
        const denominator2 = Math.floor(Math.random() * 8) + 2;
        const numerator2 = Math.floor(Math.random() * (denominator2 - 1)) + 1;
        const denominator3 = Math.floor(Math.random() * 8) + 2;
        const numerator3 = Math.floor(Math.random() * (denominator3 - 1)) + 1;
        
        question = `${numerator1}/${denominator1} ${op1} ${numerator2}/${denominator2} ${op2} ${numerator3}/${denominator3}`;
        // 计算需要按照运算优先级
        const value1 = numerator1 / denominator1;
        const value2 = numerator2 / denominator2;
        const value3 = numerator3 / denominator3;
        
        let result;
        if ((op1 === '×' || op1 === '÷') && (op2 === '+' || op2 === '-')) {
          // 先算第一个运算
          let temp;
          if (op1 === '×') {
            temp = value1 * value2;
          } else {
            temp = value1 / value2;
          }
          // 再算第二个运算
          if (op2 === '+') {
            result = temp + value3;
          } else {
            result = temp - value3;
          }
        } else if ((op2 === '×' || op2 === '÷') && (op1 === '+' || op1 === '-')) {
          // 先算第二个运算
          let temp;
          if (op2 === '×') {
            temp = value2 * value3;
          } else {
            temp = value2 / value3;
          }
          // 再算第一个运算
          if (op1 === '+') {
            result = value1 + temp;
          } else {
            result = value1 - temp;
          }
        } else {
          // 从左到右计算
          let temp;
          if (op1 === '+') {
            temp = value1 + value2;
          } else if (op1 === '-') {
            temp = value1 - value2;
          } else if (op1 === '×') {
            temp = value1 * value2;
          } else {
            temp = value1 / value2;
          }
          
          if (op2 === '+') {
            result = temp + value3;
          } else if (op2 === '-') {
            result = temp - value3;
          } else if (op2 === '×') {
            result = temp * value3;
          } else {
            result = temp / value3;
          }
        }
        answer = parseFloat(result.toFixed(4)).toString();
      } else {
        const num4 = Math.floor(Math.random() * 9) + 1;
        question = `${num1} ${op1} ${num2} ${op2} ${num3} ${op3} ${num4}`;
        const expression = [num1, op1, num2, op2, num3, op3, num4];
        const result = this.calculateExpression(expression);
        answer = result.toString();
      }
    }
    
    return {
      id: id.toString(),
      type: 'type5',
      category: '综合运算',
      score: score,
      question: question,
      answer: answer
    };
  },

  // 计算表达式（支持加减乘除优先级）
  calculateExpression: function(expression) {
    // 处理乘除运算
    for (let i = 1; i < expression.length; i += 2) {
      if (expression[i] === '×' || expression[i] === '÷') {
        const left = parseFloat(expression[i-1]);
        const right = parseFloat(expression[i+1]);
        let result;
        
        if (expression[i] === '×') {
          result = left * right;
        } else {
          result = left / right;
        }
        
        // 替换这三个元素为结果
        expression.splice(i-1, 3, result);
        i -= 2; // 调整索引
      }
    }
    
    // 处理加减运算
    let result = parseFloat(expression[0]);
    for (let i = 1; i < expression.length; i += 2) {
      const operator = expression[i];
      const operand = parseFloat(expression[i+1]);
      
      if (operator === '+') {
        result += operand;
      } else {
        result -= operand;
      }
    }
    
    return result;
  },

  // 求最大公约数
  gcd: function(a, b) {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  },

  // 求最小公倍数
  lcm: function(a, b) {
    return (a * b) / this.gcd(a, b);
  },

  // 简化分数
  simplifyFraction: function(fraction) {
    if (!fraction.includes('/')) return fraction;
    
    const parts = fraction.split('/');
    let numerator = parseInt(parts[0]);
    let denominator = parseInt(parts[1]);
    
    if (denominator === 0) return '0';
    if (numerator === 0) return '0';
    
    const divisor = this.gcd(Math.abs(numerator), denominator);
    
    numerator = numerator / divisor;
    denominator = denominator / divisor;
    
    if (denominator === 1) return numerator.toString();
    return `${numerator}/${denominator}`;
  },

  // 格式化答案（处理分数和小数）
  formatAnswer: function(value) {
    // 如果value是整数
    if (Math.abs(value - Math.round(value)) < 0.0001) {
      return Math.round(value).toString();
    }
    
    // 尝试表示为分数形式
    const tolerance = 0.0001;
    for (let denominator = 1; denominator <= 20; denominator++) {
      const numerator = Math.round(value * denominator);
      if (Math.abs(value - numerator / denominator) < tolerance) {
        return this.simplifyFraction(`${numerator}/${denominator}`);
      }
    }
    
    // 保留4位小数
    return parseFloat(value.toFixed(4)).toString();
  },

  // 切换答案输入显示
  toggleAnswerInputs: function() {
    this.setData({
      showAnswerInputs: !this.data.showAnswerInputs
    });
  },

  // 处理答案输入
  onAnswerInput: function(e) {
    const { id } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    const userAnswers = { ...this.data.userAnswers };
    userAnswers[id] = value;
    
    this.setData({
      userAnswers
    });
  },

  // 检查答案
  checkAnswers: function() {
    if (this.data.questions.length === 0) {
      wx.showToast({
        title: '请先生成试卷',
        icon: 'none'
      });
      return;
    }
    
    const questions = [...this.data.questions];
    let correctCount = 0;
    let totalScore = 0;
    
    questions.forEach((question, index) => {
      const userAnswer = this.data.userAnswers[question.id] || '';
      const correctAnswer = question.answer;
      
      // 标准化答案
      const normalizedUserAnswer = this.normalizeAnswer(userAnswer);
      const normalizedCorrectAnswer = this.normalizeAnswer(correctAnswer);
      
      const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
      
      if (isCorrect) {
        correctCount++;
        totalScore += question.score;
      }
      
      questions[index] = {
        ...question,
        userAnswer: userAnswer,
        isCorrect: isCorrect
      };
    });
    
    this.setData({
      questions,
      correctCount,
      score: totalScore,
      showScore: true,
      activeTab: 'answer'
    });
    
    wx.showToast({
      title: `答对${correctCount}题，得分${totalScore}`,
      icon: 'success'
    });
  },

  // 标准化答案
  normalizeAnswer: function(answer) {
    if (!answer) return '';
    
    // 移除空格
    let normalized = answer.toString().replace(/\s+/g, '');
    
    // 将全角符号转换为半角
    normalized = normalized
      .replace(/＞/g, '>')
      .replace(/＜/g, '<')
      .replace(/＝/g, '=')
      .replace(/÷/g, '/')
      .replace(/×/g, '*')
      .toLowerCase();
    
    // 处理小数：去除末尾的0
    if (normalized.includes('.')) {
      normalized = normalized.replace(/\.?0+$/, '');
      if (normalized.endsWith('.')) {
        normalized = normalized.slice(0, -1);
      }
    }
    
    return normalized;
  }
});