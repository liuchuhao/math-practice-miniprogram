// utils/questionGenerator.js

/**
 * 题目生成器类
 */
class QuestionGenerator {
  constructor(grade) {
    this.grade = grade
    this.questionHistory = new Set() // 使用Set避免重复
    this.maxHistorySize = 30
  }

  /**
   * 生成一道题目（带防重复检查）
   */
  generate() {
    let attempts = 0
    const maxAttempts = 50 // 最大尝试次数，避免死循环
    
    while (attempts < maxAttempts) {
      attempts++
      
      const type = this.selectQuestionType()
      let question
      
      switch(type) {
        case 'addition':
          question = this.generateAddition()
          break
        case 'subtraction':
          question = this.generateSubtraction()
          break
        case 'multiplication':
          question = this.generateMultiplication()
          break
        case 'division':
          question = this.generateDivision()
          break
        case 'mixed':
          question = this.generateMixedOperation()
          break
        case 'decimal':
          question = this.generateDecimalOperation()
          break
        default:
          question = this.generateAddition()
      }
      
      // 检查是否重复
      if (!this.isDuplicate(question.key)) {
        // 添加到历史记录
        this.addToHistory(question.key)
        return question
      }
    }
    
    // 如果尝试次数过多，返回最后生成的题目并清空历史
    console.warn('达到最大尝试次数，清空历史重新开始')
    this.clearHistory()
    const finalQuestion = this.generateAddition()
    this.addToHistory(finalQuestion.key)
    return finalQuestion
  }

  /**
   * 选择题目类型
   */
  selectQuestionType() {
    const typeWeights = this.getTypeWeights()
    const random = Math.random()
    let cumulative = 0
    
    for (const [type, weight] of Object.entries(typeWeights)) {
      cumulative += weight
      if (random <= cumulative) {
        return type
      }
    }
    
    return 'addition'
  }

  /**
   * 获取类型权重
   */
  getTypeWeights() {
    const weights = {
      1: { addition: 0.6, subtraction: 0.4 },
      2: { addition: 0.5, subtraction: 0.5 },
      3: { addition: 0.3, subtraction: 0.3, multiplication: 0.4 },
      4: { addition: 0.2, subtraction: 0.2, multiplication: 0.4, division: 0.2 },
      5: { addition: 0.15, subtraction: 0.15, multiplication: 0.3, division: 0.3, decimal: 0.1 },
      6: { addition: 0.1, subtraction: 0.1, multiplication: 0.25, division: 0.25, mixed: 0.2, decimal: 0.1 }
    }
    
    return weights[this.grade] || weights[1]
  }

  /**
   * 生成加法题目
   */
  generateAddition() {
    const range = this.getNumberRange('addition')
    let num1 = this.randomInt(range.min1, range.max1)
    let num2 = this.randomInt(range.min2, range.max2)
    
    // 调整使结果不超过最大值（低年级）
    if (this.grade <= 2 && num1 + num2 > range.maxResult) {
      num1 = this.randomInt(1, range.maxResult - 1)
      num2 = this.randomInt(1, range.maxResult - num1)
    }
    
    const answer = num1 + num2
    const key = `add_${num1}_${num2}`
    
    return {
      question: `${num1} + ${num2}`,
      answer: answer,
      type: 'addition',
      key: key,
      num1: num1,
      num2: num2,
      operator: '+'
    }
  }

  /**
   * 生成减法题目
   */
  generateSubtraction() {
    const range = this.getNumberRange('subtraction')
    let num1 = this.randomInt(range.min1, range.max1)
    let num2 = this.randomInt(range.min2, range.max2)
    
    // 确保减法结果不为负数
    if (num1 < num2) {
      [num1, num2] = [num2, num1]
    }
    
    // 对于低年级，确保差在合理范围内
    if (this.grade <= 2 && num1 - num2 > range.maxResult) {
      num2 = num1 - this.randomInt(0, range.maxResult)
    }
    
    const answer = num1 - num2
    const key = `sub_${num1}_${num2}`
    
    return {
      question: `${num1} - ${num2}`,
      answer: answer,
      type: 'subtraction',
      key: key,
      num1: num1,
      num2: num2,
      operator: '-'
    }
  }

  /**
   * 生成乘法题目
   */
  generateMultiplication() {
    const range = this.getNumberRange('multiplication')
    let num1 = this.randomInt(range.min1, range.max1)
    let num2 = this.randomInt(range.min2, range.max2)
    
    // 对于低年级，限制乘数大小
    if (this.grade <= 3) {
      num1 = this.randomInt(1, 9)
      num2 = this.randomInt(1, 9)
    }
    
    const answer = num1 * num2
    const key = `mul_${num1}_${num2}`
    
    return {
      question: `${num1} × ${num2}`,
      answer: answer,
      type: 'multiplication',
      key: key,
      num1: num1,
      num2: num2,
      operator: '×'
    }
  }

  /**
   * 生成除法题目
   */
  generateDivision() {
    const range = this.getNumberRange('division')
    
    // 修复：确保范围参数存在
    const minResult = range.minResult || 1
    const maxResult = range.maxResult || 10
    const min2 = range.min2 || 1
    const max2 = range.max2 || 10
    
    // 确保除法能整除
    const divisor = this.randomInt(min2, max2)
    const quotient = this.randomInt(minResult, maxResult)
    const dividend = divisor * quotient
    
    const answer = quotient
    const key = `div_${dividend}_${divisor}`
    
    return {
      question: `${dividend} ÷ ${divisor}`,
      answer: answer,
      type: 'division',
      key: key,
      num1: dividend,
      num2: divisor,
      operator: '÷'
    }
  }

  /**
   * 生成混合运算题目（适合高年级）
   */
  generateMixedOperation() {
    // 随机选择两种运算
    const operators = ['+', '-', '×', '÷']
    const op1 = operators[Math.floor(Math.random() * 2)] // 前两种：+ 或 -
    const op2 = operators[Math.floor(Math.random() * 2) + 2] // 后两种：× 或 ÷
    
    let num1, num2, num3, answer, question
    
    if (Math.random() > 0.5) {
      // 形式：a op1 b op2 c
      num1 = this.randomInt(1, 20)
      num2 = this.randomInt(1, 20)
      num3 = this.randomInt(1, 10)
      
      // 根据运算符计算
      let intermediate
      if (op1 === '+') {
        intermediate = num1 + num2
      } else {
        intermediate = num1 - num2
      }
      
      if (op2 === '×') {
        answer = intermediate * num3
      } else {
        // 确保能整除
        num3 = this.randomInt(1, 5)
        answer = Math.round(intermediate / num3)
        intermediate = answer * num3
      }
      
      question = `${num1} ${op1} ${num2} ${op2} ${num3}`
    } else {
      // 形式：a op2 b op1 c
      num1 = this.randomInt(1, 10)
      num2 = this.randomInt(1, 10)
      num3 = this.randomInt(1, 20)
      
      let intermediate = num1 * num2
      
      if (op1 === '+') {
        answer = intermediate + num3
      } else {
        answer = intermediate - num3
        if (answer < 0) {
          [intermediate, num3] = [num3 + 5, intermediate - 5]
          answer = intermediate - num3
        }
      }
      
      question = `${num1} × ${num2} ${op1} ${num3}`
    }
    
    const key = `mix_${num1}_${op1}_${num2}_${op2}_${num3}`
    
    return {
      question: question,
      answer: answer,
      type: 'mixed',
      key: key,
      num1: num1,
      num2: num2,
      num3: num3,
      operator: `${op1}${op2}`
    }
  }

  /**
   * 生成小数运算题目
   */
  generateDecimalOperation() {
    const operation = Math.random() > 0.5 ? 'addition' : 'subtraction'
    
    // 生成小数（1位或2位）
    const decimalPlaces = this.grade === 5 ? 1 : 2
    
    // 修复：使用更精确的小数生成方式
    const num1 = this.randomDecimal(0.1, 9.9, decimalPlaces)
    const num2 = this.randomDecimal(0.1, 9.9, decimalPlaces)
    
    let answer, question, operator
    
    if (operation === 'addition') {
      answer = this.roundDecimal(num1 + num2, decimalPlaces)
      question = `${num1.toFixed(decimalPlaces)} + ${num2.toFixed(decimalPlaces)}`
      operator = '+'
    } else {
      // 确保减法结果不为负
      const maxNum = Math.max(num1, num2)
      const minNum = Math.min(num1, num2)
      answer = this.roundDecimal(maxNum - minNum, decimalPlaces)
      question = `${maxNum.toFixed(decimalPlaces)} - ${minNum.toFixed(decimalPlaces)}`
      operator = '-'
    }
    
    const key = `dec_${num1.toFixed(decimalPlaces)}_${operator}_${num2.toFixed(decimalPlaces)}`
    
    return {
      question: question,
      answer: answer,
      type: 'decimal',
      key: key,
      num1: num1,
      num2: num2,
      operator: operator
    }
  }

  /**
   * 获取数字范围配置
   */
  getNumberRange(operation) {
    const ranges = {
      1: { // 一年级
        addition: { min1: 1, max1: 10, min2: 1, max2: 10, maxResult: 20 },
        subtraction: { min1: 1, max1: 20, min2: 1, max2: 10, maxResult: 10 }
      },
      2: { // 二年级
        addition: { min1: 10, max1: 50, min2: 10, max2: 50, maxResult: 100 },
        subtraction: { min1: 20, max1: 100, min2: 10, max2: 50, maxResult: 50 }
      },
      3: { // 三年级
        addition: { min1: 10, max1: 100, min2: 10, max2: 100, maxResult: 200 },
        subtraction: { min1: 50, max1: 200, min2: 10, max2: 100, maxResult: 150 },
        multiplication: { min1: 1, max1: 10, min2: 1, max2: 10, maxResult: 100 },
        division: { min2: 1, max2: 10, minResult: 1, maxResult: 10 }
      },
      4: { // 四年级
        addition: { min1: 100, max1: 500, min2: 100, max2: 500, maxResult: 1000 },
        subtraction: { min1: 200, max1: 1000, min2: 100, max2: 500, maxResult: 500 },
        multiplication: { min1: 10, max1: 50, min2: 2, max2: 10, maxResult: 500 },
        division: { min2: 2, max2: 20, minResult: 5, maxResult: 50 }
      },
      5: { // 五年级
        addition: { min1: 100, max1: 1000, min2: 100, max2: 1000, maxResult: 2000 },
        subtraction: { min1: 500, max1: 2000, min2: 100, max2: 1000, maxResult: 1500 },
        multiplication: { min1: 10, max1: 100, min2: 2, max2: 20, maxResult: 2000 },
        division: { min2: 2, max2: 50, minResult: 10, maxResult: 100 }
      },
      6: { // 六年级
        addition: { min1: 100, max1: 1000, min2: 100, max2: 1000, maxResult: 2000 },
        subtraction: { min1: 500, max1: 2000, min2: 100, max2: 1000, maxResult: 1500 },
        multiplication: { min1: 10, max1: 100, min2: 10, max2: 100, maxResult: 10000 },
        division: { min2: 10, max2: 100, minResult: 10, maxResult: 100 }
      }
    }
    
    const gradeRanges = ranges[this.grade] || ranges[1]
    return gradeRanges[operation] || gradeRanges.addition
  }

  /**
   * 生成随机整数
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * 生成随机小数
   */
  randomDecimal(min, max, decimals) {
    const multiplier = Math.pow(10, decimals)
    const random = Math.random() * (max - min) + min
    return Math.round(random * multiplier) / multiplier
  }

  /**
   * 四舍五入小数
   */
  roundDecimal(value, decimals) {
    const multiplier = Math.pow(10, decimals)
    return Math.round(value * multiplier) / multiplier
  }

  /**
   * 添加到历史记录
   */
  addToHistory(key) {
    this.questionHistory.add(key)
    
    // 限制历史记录大小
    if (this.questionHistory.size > this.maxHistorySize) {
      const array = Array.from(this.questionHistory)
      array.shift() // 移除最旧的一条
      this.questionHistory = new Set(array)
    }
  }

  /**
   * 检查是否重复
   */
  isDuplicate(key) {
    return this.questionHistory.has(key)
  }

  /**
   * 清空历史记录
   */
  clearHistory() {
    this.questionHistory.clear()
  }
}

// 导出
module.exports = QuestionGenerator