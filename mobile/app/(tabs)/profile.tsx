import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useReactPeer } from '@seek-self/utils';
import { useEffect } from 'react';
import * as Clipboard from 'expo-clipboard';

export default function ProfileScreen() {
  // 初始化 PeerJS
  const { state: peerState, initialize } = useReactPeer({
    debug: true,
    autoConnect: false,
  });

  useEffect(() => {
    // 组件挂载时自动初始化 Peer 连接
    initialize().catch(error => {
      console.error('Failed to initialize peer:', error);
    });
  }, [initialize]);

  // 复制在线ID到剪贴板
  const copyOnlineId = async () => {
    if (peerState.peerId) {
      try {
        await Clipboard.setStringAsync(peerState.peerId);
        Alert.alert('✅ 复制成功', `在线ID已复制到剪贴板\n\n${peerState.peerId}`, [
          { text: '确定', style: 'default' }
        ]);
      } catch (error) {
        Alert.alert('❌ 复制失败', '无法复制到剪贴板，请重试', [
          { text: '确定', style: 'default' }
        ]);
      }
    } else {
      Alert.alert('⚠️ 无法复制', '在线ID尚未生成，请等待连接建立', [
        { text: '确定', style: 'default' }
      ]);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 头部信息 */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <ThemedText style={styles.avatar}>👤</ThemedText>
          </View>
          <ThemedText style={styles.userName}>求己</ThemedText>
        </View>

        {/* 个人信息卡片 */}
        <View style={styles.infoSection}>
          <ThemedText style={styles.sectionTitle}>个人信息</ThemedText>
          
          {/* 基本信息 */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>姓名</ThemedText>
              <ThemedText style={styles.infoValue}>求己用户</ThemedText>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>等级</ThemedText>
              <ThemedText style={styles.infoValue}>Lv.12</ThemedText>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>经验值</ThemedText>
              <ThemedText style={styles.infoValue}>350 / 500</ThemedText>
            </View>
          </View>
        </View>

        {/* 连接状态信息 */}
        <View style={styles.infoSection}>
          <ThemedText style={styles.sectionTitle}>设备状态</ThemedText>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>连接状态</ThemedText>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { 
                  backgroundColor: peerState.status === 'ready' ? '#10B981' : 
                                 peerState.status === 'initializing' ? '#F59E0B' : '#EF4444' 
                }]} />
                <ThemedText style={styles.statusText}>
                  {peerState.status === 'ready' ? '在线' : 
                   peerState.status === 'initializing' ? '连接中' : '离线'}
                </ThemedText>
              </View>
            </View>
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.infoRow} onPress={copyOnlineId}>
              <ThemedText style={styles.infoLabel}>在线ID</ThemedText>
              <View style={styles.onlineIdContainer}>
                <ThemedText style={styles.onlineIdText} numberOfLines={1}>
                  {peerState.peerId || (peerState.status === 'initializing' ? '连接中...' : '离线')}
                </ThemedText>
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>已连接设备</ThemedText>
              <ThemedText style={styles.infoValue}>{peerState.connections.size}</ThemedText>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>消息总数</ThemedText>
              <ThemedText style={styles.infoValue}>{peerState.messages.length}</ThemedText>
            </View>
          </View>
        </View>

        {/* 说明文字 */}
        <View style={styles.noteSection}>
          <ThemedText style={styles.noteText}>
            💡 在线ID用于与其他设备建立P2P连接，点击可自动复制到剪贴板
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  
  // 头部样式
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 16,
    color: '#666',
  },

  // 信息区域样式
  infoSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // 信息行样式
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: -16,
  },

  // 在线ID相关样式
  onlineIdContainer: {
    flex: 1,
    marginLeft: 12,
  },
  onlineIdText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
    textAlign: 'right',
  },

  // 状态相关样式
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  // 说明文字样式
  noteSection: {
    margin: 20,
    padding: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  noteText: {
    fontSize: 14,
    color: '#1D4ED8',
    lineHeight: 20,
  },
});
