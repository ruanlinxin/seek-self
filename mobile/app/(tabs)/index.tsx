import { StyleSheet, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  reward: {
    exp: number;
    gold: number;
  };
  status: 'available' | 'in_progress' | 'completed';
  type: 'daily' | 'weekly' | 'main' | 'side';
}

export default function TaskScreen() {
  const [userStats, setUserStats] = useState({
    level: 12,
    exp: 350,
    maxExp: 500,
    gold: 1250,
  });

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: '晨间冥想',
      description: '进行10分钟的冥想练习，提升内心平静',
      difficulty: 'easy',
      reward: { exp: 25, gold: 10 },
      status: 'available',
      type: 'daily'
    },
    {
      id: '2',
      title: '学习新技能',
      description: '花费1小时学习一门新技能或深化现有知识',
      difficulty: 'medium',
      reward: { exp: 50, gold: 25 },
      status: 'in_progress',
      type: 'daily'
    },
    {
      id: '3',
      title: '阅读经典书籍',
      description: '阅读至少30分钟的经典文学或哲学著作',
      difficulty: 'medium',
      reward: { exp: 40, gold: 20 },
      status: 'available',
      type: 'daily'
    },
    {
      id: '4',
      title: '完成周计划',
      description: '制定并执行本周的个人成长计划',
      difficulty: 'hard',
      reward: { exp: 100, gold: 50 },
      status: 'available',
      type: 'weekly'
    },
    {
      id: '5',
      title: '自我反思大师',
      description: '连续30天进行深度自我反思，记录成长感悟',
      difficulty: 'epic',
      reward: { exp: 500, gold: 200 },
      status: 'available',
      type: 'main'
    }
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#6B7280';
      case 'medium': return '#374151';
      case 'hard': return '#1F2937';
      case 'epic': return '#111827';
      default: return '#9CA3AF';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '⭐';
      case 'medium': return '⭐⭐';
      case 'hard': return '⭐⭐⭐';
      case 'epic': return '👑';
      default: return '⭐';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return '📋';
      case 'in_progress': return '🔄';
      case 'completed': return '✅';
      default: return '📋';
    }
  };

  const handleTaskPress = (task: Task) => {
    if (task.status === 'completed') {
      Alert.alert('任务已完成', '此任务已经完成了！');
      return;
    }
    
    Alert.alert(
      `${task.title}`,
      `难度: ${getDifficultyIcon(task.difficulty)}\n奖励: ${task.reward.exp} EXP + ${task.reward.gold} 金币\n\n${task.description}\n\n是否开始执行此任务？`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: task.status === 'available' ? '开始任务' : '完成任务', 
          onPress: () => {
            if (task.status === 'available') {
              // 开始任务
              setTasks(prev => prev.map(t => 
                t.id === task.id ? { ...t, status: 'in_progress' as const } : t
              ));
              Alert.alert('任务开始', '任务已添加到进行中列表！');
            } else {
              // 完成任务
              setTasks(prev => prev.map(t => 
                t.id === task.id ? { ...t, status: 'completed' as const } : t
              ));
              setUserStats(prev => ({
                ...prev,
                exp: prev.exp + task.reward.exp,
                gold: prev.gold + task.reward.gold
              }));
              Alert.alert('任务完成！', `获得 ${task.reward.exp} EXP 和 ${task.reward.gold} 金币！`);
            }
          }
        }
      ]
    );
  };

  const getTasksByType = (type: string) => {
    return tasks.filter(task => task.type === type);
  };

  return (
    <ScrollView style={styles.container}>
      {/* 用户状态栏 */}
      <View style={styles.headerGradient}>
        <View style={styles.userStatsContainer}>
          <View style={styles.userInfo}>
            <ThemedText style={styles.levelText}>等级 {userStats.level}</ThemedText>
            <View style={styles.expBar}>
              <View style={[styles.expFill, { width: `${(userStats.exp / userStats.maxExp) * 100}%` }]} />
              <ThemedText style={styles.expText}>{userStats.exp}/{userStats.maxExp} EXP</ThemedText>
            </View>
          </View>
          <View style={styles.goldContainer}>
            <ThemedText style={styles.goldText}>💰 {userStats.gold}</ThemedText>
          </View>
        </View>
      </View>

      {/* 任务列表 */}
      <ThemedView style={styles.tasksContainer}>
        {/* 每日任务 */}
        <View style={styles.taskSection}>
          <ThemedText style={styles.sectionTitle}>📅 每日任务</ThemedText>
          {getTasksByType('daily').map((task) => (
            <TouchableOpacity key={task.id} style={styles.taskCard} onPress={() => handleTaskPress(task)}>
              <View style={styles.taskHeader}>
                <View style={styles.taskInfo}>
                  <ThemedText style={styles.taskTitle}>{getStatusIcon(task.status)} {task.title}</ThemedText>
                  <ThemedText style={styles.taskDescription}>{task.description}</ThemedText>
                </View>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(task.difficulty) }]}>
                  <ThemedText style={styles.difficultyText}>{getDifficultyIcon(task.difficulty)}</ThemedText>
                </View>
              </View>
              <View style={styles.taskFooter}>
                <ThemedText style={styles.rewardText}>+{task.reward.exp} EXP  +{task.reward.gold} 💰</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: task.status === 'completed' ? '#1F2937' : task.status === 'in_progress' ? '#374151' : '#6B7280' }]}>
                  <ThemedText style={styles.statusText}>
                    {task.status === 'available' ? '可接取' : task.status === 'in_progress' ? '进行中' : '已完成'}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 周任务 */}
        <View style={styles.taskSection}>
          <ThemedText style={styles.sectionTitle}>📆 周任务</ThemedText>
          {getTasksByType('weekly').map((task) => (
            <TouchableOpacity key={task.id} style={styles.taskCard} onPress={() => handleTaskPress(task)}>
              <View style={styles.taskHeader}>
                <View style={styles.taskInfo}>
                  <ThemedText style={styles.taskTitle}>{getStatusIcon(task.status)} {task.title}</ThemedText>
                  <ThemedText style={styles.taskDescription}>{task.description}</ThemedText>
                </View>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(task.difficulty) }]}>
                  <ThemedText style={styles.difficultyText}>{getDifficultyIcon(task.difficulty)}</ThemedText>
                </View>
              </View>
              <View style={styles.taskFooter}>
                <ThemedText style={styles.rewardText}>+{task.reward.exp} EXP  +{task.reward.gold} 💰</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: task.status === 'completed' ? '#1F2937' : task.status === 'in_progress' ? '#374151' : '#6B7280' }]}>
                  <ThemedText style={styles.statusText}>
                    {task.status === 'available' ? '可接取' : task.status === 'in_progress' ? '进行中' : '已完成'}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 主线任务 */}
        <View style={styles.taskSection}>
          <ThemedText style={styles.sectionTitle}>⚔️ 主线任务</ThemedText>
          {getTasksByType('main').map((task) => (
            <TouchableOpacity key={task.id} style={[styles.taskCard, styles.epicTaskCard]} onPress={() => handleTaskPress(task)}>
              <View style={styles.taskHeader}>
                <View style={styles.taskInfo}>
                  <ThemedText style={[styles.taskTitle, styles.epicTaskTitle]}>{getStatusIcon(task.status)} {task.title}</ThemedText>
                  <ThemedText style={styles.taskDescription}>{task.description}</ThemedText>
                </View>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(task.difficulty) }]}>
                  <ThemedText style={styles.difficultyText}>{getDifficultyIcon(task.difficulty)}</ThemedText>
                </View>
              </View>
              <View style={styles.taskFooter}>
                <ThemedText style={[styles.rewardText, styles.epicRewardText]}>+{task.reward.exp} EXP  +{task.reward.gold} 💰</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: task.status === 'completed' ? '#1F2937' : task.status === 'in_progress' ? '#374151' : '#6B7280' }]}>
                  <ThemedText style={styles.statusText}>
                    {task.status === 'available' ? '可接取' : task.status === 'in_progress' ? '进行中' : '已完成'}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  
  // 头部状态栏样式
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#374151',
  },
  userStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginRight: 20,
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  expBar: {
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  expFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 10,
  },
  expText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    zIndex: 1,
  },
  goldContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  goldText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // 任务列表样式
  tasksContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  taskSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },

  // 任务卡片样式
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  epicTaskCard: {
    backgroundColor: 'white',
    borderColor: '#374151',
    borderWidth: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  epicTaskTitle: {
    color: '#1F2937',
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  difficultyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 任务底部样式
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  epicRewardText: {
    color: '#1F2937',
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
