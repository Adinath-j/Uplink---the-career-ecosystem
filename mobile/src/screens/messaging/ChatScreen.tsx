import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, radii, spacing, typography } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { Icon } from '../../components/common/Icon';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { useMessagingStore } from '../../store/messagingStore';
import { useAuthStore } from '../../store/authStore';
import { BackendMessage } from '../../services/messagingService';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  const { conversationId, title } = route.params;
  const [inputText, setInputText] = useState('');

  const currentUser = useAuthStore((state) => state.user);
  const {
    activeMessages,
    isLoadingMessages,
    isSending,
    error,
    fetchMessages,
    sendMessage,
    clearActiveMessages,
  } = useMessagingStore();

  useEffect(() => {
    fetchMessages(conversationId);
    return () => {
      clearActiveMessages();
    };
  }, [conversationId, fetchMessages, clearActiveMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    const textToSend = inputText.trim();
    setInputText('');
    await sendMessage(conversationId, textToSend);
  };

  const formatMessageTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const renderMessageItem = useCallback(
    ({ item }: { item: BackendMessage }) => {
      const isMine =
        item.sender?.id === currentUser?.id ||
        item.sender?.email === currentUser?.email;

      return (
        <View
          style={[
            styles.messageRow,
            isMine ? styles.myMessageRow : styles.theirMessageRow,
          ]}
        >
          <View
            style={[
              styles.bubble,
              isMine ? styles.myBubble : styles.theirBubble,
            ]}
          >
            {!isMine && item.sender?.fullName ? (
              <Text style={styles.senderName}>{item.sender.fullName}</Text>
            ) : null}

            <Text
              style={[
                styles.messageText,
                isMine ? styles.myMessageText : styles.theirMessageText,
              ]}
            >
              {item.content}
            </Text>

            <Text
              style={[
                styles.timeText,
                isMine ? styles.myTimeText : styles.theirTimeText,
              ]}
            >
              {formatMessageTime(item.createdAt)}
            </Text>
          </View>
        </View>
      );
    },
    [currentUser]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <AppHeader
        title={title || 'Direct Message'}
        onBackPress={() => navigation.goBack()}
      />

      {isLoadingMessages && activeMessages.length === 0 ? (
        <LoadingState message="Loading conversation..." />
      ) : error && activeMessages.length === 0 ? (
        <ErrorState
          message={error}
          onRetry={() => fetchMessages(conversationId)}
        />
      ) : (
        /* CRUCIAL: FlatList inverted for standard bottom-to-top chat stream */
        <FlatList
          data={activeMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          inverted
          contentContainerStyle={styles.messageList}
        />
      )}

      {/* Input bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isSending}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Icon name="send" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messageList: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  theirMessageRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.lg,
  },
  myBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 2,
  },
  senderName: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
    fontSize: 11,
  },
  messageText: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: colors.text,
  },
  timeText: {
    ...typography.caption,
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  theirTimeText: {
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F9FAFB',
    borderRadius: radii.full,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing[2],
  },
  sendButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
});
