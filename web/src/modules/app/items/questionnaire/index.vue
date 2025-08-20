<template>
  <div class="questionnaire-container">
    <!-- 标题栏 -->
    <div class="header">
      <h2>答题系统</h2>
      <div class="stats">
        <span>题库数量: {{ questions.length }}</span>
        <span>错题数量: {{ wrongQuestions.length }}</span>
      </div>
    </div>

    <!-- 题库上传区域 -->
    <div v-if="!questions.length" class="upload-area">
      <div class="upload-tips">
        <h3>上传题库文件</h3>
        <p>支持两种题目格式：</p>

        <div class="format-section">
          <h4>格式一：计量单位题目</h4>
          <ul>
            <li>每行格式：项目名称[Tab]计量单位</li>
            <li>示例：挖单独土方	m³</li>
            <li>示例：平整场地	m²</li>
          </ul>
        </div>

        <div class="format-section">
          <h4>格式二：选择题</h4>
          <ul>
            <li>第一行：通用答案选项（如：A,B,C,D）</li>
            <li>其他行：题目 答案 [自定义选项1] [自定义选项2] ...</li>
            <li>示例：什么是Vue? A Vue是框架 React是框架 Angular是框架</li>
          </ul>
        </div>
      </div>
      <div class="upload-box" @click="triggerFileInput" @drop="handleDrop" @dragover.prevent>
        <input ref="fileInput" type="file" accept=".txt,.csv" @change="handleFileUpload" style="display: none;">
        <div class="upload-content">
          <i class="upload-icon">📁</i>
          <p>点击上传或拖拽文件到此处</p>
          <p class="file-types">支持 .txt .csv 格式</p>
        </div>
      </div>
    </div>

    <!-- 功能选择区域 -->
    <div v-if="questions.length && !currentQuestion" class="menu-area">
      <div class="menu-card" @click="startRandomQuiz">
        <div class="menu-icon">🎲</div>
        <h3>随机答题</h3>
        <p>从题库中随机抽取题目进行答题</p>
      </div>

      <div class="menu-card" @click="startWrongQuiz" :class="{ disabled: !wrongQuestions.length }">
        <div class="menu-icon">❌</div>
        <h3>错题练习</h3>
        <p>重新练习历史错题 ({{ wrongQuestions.length }}题)</p>
      </div>

      <div class="menu-card" @click="showStats = true">
        <div class="menu-icon">📊</div>
        <h3>答题统计</h3>
        <p>查看答题记录和统计信息</p>
      </div>

      <div class="menu-card" @click="resetQuestions">
        <div class="menu-icon">🔄</div>
        <h3>重新上传</h3>
        <p>上传新的题库文件</p>
      </div>
      
      <div class="menu-card" @click="openSettings">
        <div class="menu-icon">⚙️</div>
        <h3>通用选项设置</h3>
        <p>配置默认的选项列表</p>
      </div>
    </div>

    <!-- 答题区域 -->
    <div v-if="currentQuestion && !showResult" class="quiz-area">
      <div class="quiz-header">
        <div class="quiz-progress">
          <span>第 {{ currentQuestionIndex + 1 }} 题</span>
          <span v-if="isWrongQuizMode">错题练习模式</span>
        </div>
        <button @click="exitQuiz" class="exit-btn">退出答题</button>
      </div>

      <div class="question-card">
        <div class="question-text">{{ currentQuestion.question }}</div>

        <div class="options">
          <div
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            class="option"
            :class="{ selected: selectedAnswer === index }"
            @click="selectAnswer(index)"
          >
            <span class="option-label">{{ getOptionLabel(index) }}</span>
            <span class="option-text">{{ option }}</span>
          </div>
        </div>

        <div class="quiz-actions">
          <button @click="submitAnswer" :disabled="selectedAnswer === null" class="submit-btn">
            提交答案
          </button>
        </div>
      </div>
    </div>

    <!-- 答案展示区域 -->
    <div v-if="showResult" class="result-area">
      <div class="result-card">
        <div class="result-header">
          <div class="result-icon" :class="{ correct: isCorrect, wrong: !isCorrect }">
            {{ isCorrect ? '✅' : '❌' }}
          </div>
          <h3>{{ isCorrect ? '回答正确!' : '回答错误!' }}</h3>
        </div>

        <div class="result-content">
          <div class="question-review">
            <strong>题目：</strong>{{ currentQuestion.question }}
          </div>

          <div class="answer-review">
            <div class="your-answer">
              <strong>你的答案：</strong>
              <span :class="{ correct: isCorrect, wrong: !isCorrect }">
                {{ getOptionLabel(selectedAnswer) }}. {{ currentQuestion.options[selectedAnswer] }}
              </span>
            </div>

            <div class="correct-answer">
              <strong>正确答案：</strong>
              <span class="correct">
                {{ getOptionLabel(correctAnswerIndex) }}. {{ currentQuestion.options[correctAnswerIndex] }}
              </span>
            </div>
          </div>
        </div>

        <div class="result-actions">
          <button @click="nextQuestion" class="next-btn">下一题</button>
          <button @click="exitQuiz" class="exit-btn">结束答题</button>
        </div>
      </div>
    </div>

    <!-- 统计弹窗 -->
    <div v-if="showStats" class="modal-overlay" @click="showStats = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>答题统计</h3>
          <button @click="showStats = false" class="close-btn">×</button>
        </div>

        <div class="stats-content">
          <div class="stat-item">
            <span class="stat-label">总题数：</span>
            <span class="stat-value">{{ questions.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">已答题数：</span>
            <span class="stat-value">{{ stats.totalAnswered }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">正确题数：</span>
            <span class="stat-value correct">{{ stats.correctCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">错误题数：</span>
            <span class="stat-value wrong">{{ stats.wrongCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">正确率：</span>
            <span class="stat-value">{{ stats.accuracy }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">错题本：</span>
            <span class="stat-value">{{ wrongQuestions.length }} 题</span>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="clearStats" class="clear-btn">清空统计</button>
          <button @click="showStats = false" class="close-btn">关闭</button>
        </div>
      </div>
    </div>

    <!-- 通用选项设置弹窗 -->
    <div v-if="showSettings" class="modal-overlay" @click="showSettings = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>通用选项设置</h3>
          <button @click="showSettings = false" class="close-btn">×</button>
        </div>
        
        <div class="settings-content">
          <div class="setting-item">
            <label>通用选项列表（用逗号分隔）：</label>
            <textarea 
              v-model="settingsText" 
              class="settings-textarea"
              placeholder="例如：m,m²,m³,t,个"
              rows="3"
            ></textarea>
          </div>
          
          <div class="current-options">
            <h4>当前选项：</h4>
            <div class="option-tags">
              <span v-for="option in commAnswerOptions" :key="option" class="option-tag">
                {{ option }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="saveSettings" class="save-btn">保存设置</button>
          <button @click="resetSettings" class="reset-btn">恢复默认</button>
          <button @click="showSettings = false" class="close-btn">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// 响应式数据
const fileInput = ref(null)
const questions = ref([])
const commonAnswers = ref(['A', 'B', 'C', 'D'])
const currentQuestion = ref(null)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const showResult = ref(false)
const isCorrect = ref(false)
const correctAnswerIndex = ref(0)
const showStats = ref(false)
const showSettings = ref(false)
const settingsText = ref('')
const isWrongQuizMode = ref(false)
const wrongQuestions = ref([])
const answeredQuestions = ref([])

// 统计数据
const stats = reactive({
  totalAnswered: 0,
  correctCount: 0,
  wrongCount: 0,
  accuracy: 0
})

// 计算属性
const getOptionLabel = (index) => {
  return commonAnswers.value[index] || String.fromCharCode(65 + index)
}

// 文件上传相关
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleDrop = (e) => {
  e.preventDefault()
  const files = e.dataTransfer.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target.result
    parseQuestions(content)
  }
  reader.readAsText(file, 'UTF-8')
}

// 题库解析 - 主入口
const parseQuestions = (content) => {
  const lines = content.split('\n').filter(line => line.trim())

  if (lines.length < 1) {
    alert('文件格式错误：文件为空')
    return
  }

  // 调用自定义解析函数
  customParseQuestions(lines)
}

const commAnswerOptions = ref(['m' ,'m²', 'm³', 't', '个'])

// 自定义解析函数
const customParseQuestions = (lines) => {
  const parsedQuestions = lines.map((line, i) => {
    const parts = line.split('\t')
    const question = parts[0]
    const answer = parts[1]
    const customOptions = parts.slice(2).filter(opt => opt && opt.trim())
    
    // 如果有自定义选项使用自定义选项，否则使用通用选项
    const options = customOptions.length ? customOptions : [...commAnswerOptions.value]
    
    // 找到正确答案的索引
    let correctIndex = 0
    if (customOptions.length) {
      // 有自定义选项时，答案应该在选项中
      correctIndex = options.findIndex(opt => opt === answer)
      if (correctIndex === -1) correctIndex = 0 // 如果找不到，默认第一个
    } else {
      // 使用通用选项时，答案应该在通用选项中
      correctIndex = commAnswerOptions.value.findIndex(opt => opt === answer)
      if (correctIndex === -1) correctIndex = 0 // 如果找不到，默认第一个
    }
    
    return {
      id: i + 1,
      question: question,
      answer: answer,
      options: options,
      correctIndex: correctIndex,
      hasCustomOptions: customOptions.length > 0
    }
  })
  
  // 设置题目数据
  setQuestions(parsedQuestions)
}

// 工具函数 - 设置题目数据
const setQuestions = (parsedQuestions, answerLabels = ['A', 'B', 'C', 'D']) => {
  questions.value = parsedQuestions
  commonAnswers.value = answerLabels
  loadLocalData()
  console.log(`成功解析 ${parsedQuestions.length} 道题目`)
}

// 答题功能
const startRandomQuiz = () => {
  isWrongQuizMode.value = false
  const availableQuestions = questions.value.filter(q =>
    !answeredQuestions.value.includes(q.id)
  )

  if (availableQuestions.length === 0) {
    // 所有题目都答过了，重置
    answeredQuestions.value = []
    currentQuestion.value = getRandomQuestion(questions.value)
  } else {
    currentQuestion.value = getRandomQuestion(availableQuestions)
  }

  resetQuizState()
}

const startWrongQuiz = () => {
  if (wrongQuestions.value.length === 0) {
    alert('暂无错题')
    return
  }

  isWrongQuizMode.value = true
  currentQuestion.value = wrongQuestions.value[0]
  currentQuestionIndex.value = 0
  resetQuizState()
}

const getRandomQuestion = (questionList) => {
  const randomIndex = Math.floor(Math.random() * questionList.length)
  return questionList[randomIndex]
}

const resetQuizState = () => {
  selectedAnswer.value = null
  showResult.value = false
  isCorrect.value = false
  correctAnswerIndex.value = 0
}

const selectAnswer = (index) => {
  selectedAnswer.value = index
}

const submitAnswer = () => {
  if (selectedAnswer.value === null) return

  correctAnswerIndex.value = currentQuestion.value.correctIndex
  isCorrect.value = selectedAnswer.value === correctAnswerIndex.value

  // 更新统计
  stats.totalAnswered++
  if (isCorrect.value) {
    stats.correctCount++
    // 如果是错题练习模式且答对了，从错题本中移除
    if (isWrongQuizMode.value) {
      const index = wrongQuestions.value.findIndex(q => q.id === currentQuestion.value.id)
      if (index !== -1) {
        wrongQuestions.value.splice(index, 1)
      }
    }
  } else {
    stats.wrongCount++
    // 添加到错题本
    if (!wrongQuestions.value.find(q => q.id === currentQuestion.value.id)) {
      wrongQuestions.value.push({ ...currentQuestion.value })
    }
  }

  // 计算正确率
  stats.accuracy = stats.totalAnswered > 0
    ? Math.round((stats.correctCount / stats.totalAnswered) * 100)
    : 0

  // 记录已答题目
  if (!answeredQuestions.value.includes(currentQuestion.value.id)) {
    answeredQuestions.value.push(currentQuestion.value.id)
  }

  showResult.value = true
  saveLocalData()
}

const nextQuestion = () => {
  if (isWrongQuizMode.value) {
    // 错题练习模式
    currentQuestionIndex.value++
    if (currentQuestionIndex.value < wrongQuestions.value.length) {
      currentQuestion.value = wrongQuestions.value[currentQuestionIndex.value]
      resetQuizState()
    } else {
      // 错题练习完成
      exitQuiz()
    }
  } else {
    // 随机答题模式
    startRandomQuiz()
  }
}

const exitQuiz = () => {
  currentQuestion.value = null
  currentQuestionIndex.value = 0
  resetQuizState()
  isWrongQuizMode.value = false
}

// 数据管理
const resetQuestions = () => {
  questions.value = []
  wrongQuestions.value = []
  answeredQuestions.value = []
  stats.totalAnswered = 0
  stats.correctCount = 0
  stats.wrongCount = 0
  stats.accuracy = 0
  exitQuiz()
  clearLocalData()
}

const clearStats = () => {
  stats.totalAnswered = 0
  stats.correctCount = 0
  stats.wrongCount = 0
  stats.accuracy = 0
  wrongQuestions.value = []
  answeredQuestions.value = []
  saveLocalData()
  showStats.value = false
}

// 本地存储
const saveLocalData = () => {
  const data = {
    questions: questions.value,
    commonAnswers: commonAnswers.value,
    commAnswerOptions: commAnswerOptions.value,
    wrongQuestions: wrongQuestions.value,
    answeredQuestions: answeredQuestions.value,
    stats: { ...stats }
  }
  localStorage.setItem('questionnaire-data', JSON.stringify(data))
}

const loadLocalData = () => {
  const data = localStorage.getItem('questionnaire-data')
  if (data) {
    try {
      const parsed = JSON.parse(data)
      if (parsed.commAnswerOptions) commAnswerOptions.value = parsed.commAnswerOptions
      if (parsed.wrongQuestions) wrongQuestions.value = parsed.wrongQuestions
      if (parsed.answeredQuestions) answeredQuestions.value = parsed.answeredQuestions
      if (parsed.stats) Object.assign(stats, parsed.stats)
    } catch (error) {
      console.warn('加载本地数据失败:', error)
    }
  }
}

const clearLocalData = () => {
  localStorage.removeItem('questionnaire-data')
}

// 设置相关方法
const saveSettings = () => {
  const newOptions = settingsText.value
    .split(',')
    .map(opt => opt.trim())
    .filter(opt => opt)
  
  if (newOptions.length === 0) {
    alert('请至少输入一个选项')
    return
  }
  
  commAnswerOptions.value = newOptions
  saveLocalData()
  showSettings.value = false
  alert('设置已保存')
}

const resetSettings = () => {
  commAnswerOptions.value = ['m', 'm²', 'm³', 't', '个']
  settingsText.value = commAnswerOptions.value.join(',')
  saveLocalData()
}

const openSettings = () => {
  settingsText.value = commAnswerOptions.value.join(',')
  showSettings.value = true
}

// 生命周期
onMounted(() => {
  loadLocalData()
})
</script>

<style scoped>
.questionnaire-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 标题栏 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.header h2 {
  margin: 0;
  color: #333;
  font-size: 28px;
}

.stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

/* 上传区域 */
.upload-area {
  text-align: center;
  padding: 40px 20px;
}

.upload-tips {
  margin-bottom: 30px;
  text-align: left;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.upload-tips h3 {
  margin-top: 0;
  color: #495057;
}

.upload-tips ul {
  margin: 10px 0;
  padding-left: 20px;
}

.upload-tips li {
  margin: 5px 0;
  color: #6c757d;
}

.format-section {
  margin: 15px 0;
  padding: 15px;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 6px;
}

.format-section h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 16px;
}

.upload-box {
  border: 2px dashed #d1ecf1;
  border-radius: 8px;
  padding: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.upload-box:hover {
  border-color: #bee5eb;
  background: #e2f3f5;
}

.upload-content {
  pointer-events: none;
}

.upload-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.file-types {
  font-size: 12px;
  color: #6c757d;
}

/* 功能菜单 */
.menu-area {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.menu-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.menu-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.menu-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-card.disabled:hover {
  transform: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.menu-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.menu-card h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
}

.menu-card p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* 答题区域 */
.quiz-area {
  margin: 20px 0;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.quiz-progress {
  font-weight: 500;
  color: #495057;
}

.exit-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.exit-btn:hover {
  background: #c82333;
}

.question-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-text {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 25px;
  color: #333;
  line-height: 1.5;
}

.options {
  margin-bottom: 25px;
}

.option {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  margin: 10px 0;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.option:hover {
  border-color: #007bff;
  background: #f8f9ff;
}

.option.selected {
  border-color: #007bff;
  background: #e7f3ff;
}

.option-label {
  font-weight: bold;
  margin-right: 12px;
  color: #007bff;
  min-width: 20px;
}

.option-text {
  color: #333;
  font-size: 16px;
}

.quiz-actions {
  text-align: center;
}

.submit-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #218838;
}

.submit-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* 结果区域 */
.result-area {
  margin: 20px 0;
}

.result-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.result-header {
  margin-bottom: 25px;
}

.result-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.result-icon.correct {
  color: #28a745;
}

.result-icon.wrong {
  color: #dc3545;
}

.result-header h3 {
  margin: 0;
  font-size: 24px;
}

.result-content {
  text-align: left;
  margin-bottom: 25px;
}

.question-review {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 16px;
}

.answer-review {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.your-answer,
.correct-answer {
  padding: 15px;
  border-radius: 8px;
  font-size: 16px;
}

.your-answer {
  background: #f8f9fa;
}

.correct-answer {
  background: #d4edda;
}

.correct {
  color: #28a745;
  font-weight: 500;
}

.wrong {
  color: #dc3545;
  font-weight: 500;
}

.result-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.next-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.next-btn:hover {
  background: #0056b3;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  line-height: 1;
}

.close-btn:hover {
  color: #495057;
}

.stats-content {
  padding: 24px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f8f9fa;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  font-weight: 600;
  color: #333;
}

.stat-value.correct {
  color: #28a745;
}

.stat-value.wrong {
  color: #dc3545;
}

.modal-actions {
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.clear-btn {
  background: #ffc107;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.clear-btn:hover {
  background: #e0a800;
}

/* 设置弹窗样式 */
.settings-content {
  padding: 24px;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.settings-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.settings-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.current-options {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.current-options h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 14px;
}

.option-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-tag {
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.save-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn:hover {
  background: #218838;
}

.reset-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.reset-btn:hover {
  background: #5a6268;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .questionnaire-container {
    padding: 15px;
  }

  .header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .menu-area {
    grid-template-columns: 1fr;
  }

  .quiz-header {
    flex-direction: column;
    gap: 10px;
  }

  .question-card {
    padding: 20px;
  }

  .question-text {
    font-size: 18px;
  }

  .option {
    padding: 12px 15px;
  }

  .result-actions {
    flex-direction: column;
  }

  .answer-review {
    gap: 10px;
  }

  .modal-content {
    margin: 20px;
    width: calc(100% - 40px);
  }
}
</style>
