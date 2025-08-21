import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface MessageModalProps {
  visible: boolean;
  title: string;
  message: string;
  senderId?: string;
  timestamp?: string;
  onClose: () => void;
  onReply?: () => void;
}

export default function MessageModal({
  visible,
  title,
  message,
  senderId,
  timestamp,
  onClose,
  onReply
}: MessageModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.modalContent}>
          {/* 标题 */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 发送者信息 */}
          {senderId && (
            <View style={styles.senderInfo}>
              <ThemedText style={styles.senderLabel}>发送者:</ThemedText>
              <ThemedText style={styles.senderId}>{senderId}</ThemedText>
            </View>
          )}

          {/* 消息内容 */}
          <View style={styles.messageContainer}>
            <ThemedText style={styles.message}>{message}</ThemedText>
          </View>

          {/* 时间戳 */}
          {timestamp && (
            <View style={styles.timestampContainer}>
              <ThemedText style={styles.timestamp}>{timestamp}</ThemedText>
            </View>
          )}

          {/* 按钮区域 */}
          <View style={styles.buttonContainer}>
            {onReply && (
              <TouchableOpacity style={styles.replyButton} onPress={onReply}>
                <Text style={styles.replyButtonText}>回复</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
              <Text style={styles.confirmButtonText}>确定</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  senderInfo: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  senderLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
    color: '#666',
  },
  senderId: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    flex: 1,
  },
  messageContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
  },
  timestampContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  replyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
  },
  replyButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
