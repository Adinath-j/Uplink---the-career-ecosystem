import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  AppState,
  AppStateStatus,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types/navigation';
import { radii, spacing, typography } from '../../theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { ColorPalette } from '../../theme/colors';
import { AppHeader } from '../../components/common/AppHeader';
import { Icon } from '../../components/common/Icon';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { useMessagingStore } from '../../store/messagingStore';
import { useAuthStore } from '../../store/authStore';
import { BackendMessage } from '../../services/messagingService';
import { validateChatMessage } from '../../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { conversationId, title } = route.params;
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');

  const currentUser = useAuthStore((state) => state.user);
  const {
    activeMessages,
    isLoadingMessages,
    isSending,
    error,
    isConnectedToSocket,
    connectionState,
    typingUsers,
    fetchMessages,
    sendMessage,
    clearActiveMessages,
    subscribeToConversation,
    sendTyping,
    initSocket,
    markAsRead,
  } = useMessagingStore();

  const typingUser = typingUsers[conversationId];
  const lastTypingTimeRef = useRef<number>(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchMessages(conversationId);
    markAsRead(conversationId);
    const unsubscribe = subscribeToConversation(conversationId);

    // Reconnect / re-sync when app returns from background
    const appStateSub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        initSocket();
        fetchMessages(conversationId, true);
        markAsRead(conversationId);
      }
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      sendTyping(conversationId, false);
      appStateSub.remove();
      unsubscribe();
      clearActiveMessages();
    };
  }, [conversationId, fetchMessages, markAsRead, subscribeToConversation, clearActiveMessages, initSocket, sendTyping]);

  const handleTextChange = (text: string) => {
    setInputText(text);

    if (text.trim().length > 0) {
      const now = Date.now();
      // Throttle typing emission to once every 2 seconds
      if (now - lastTypingTimeRef.current > 2000) {
        lastTypingTimeRef.current = now;
        sendTyping(conversationId, true);
      }

      // Reset auto-clear timer
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(conversationId, false);
      }, 2500);
    } else {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      sendTyping(conversationId, false);
    }
  };

  const handleSend = async () => {
    const error = validateChatMessage(inputText);
    if (error || isSending) return;
    const textToSend = inputText.trim();
    setInputText('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTyping(conversationId, false);

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

      const isPending = item.status === 'SENDING';
      const isFailed = item.status === 'FAILED';

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
              isPending && styles.pendingBubble,
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

            <View style={styles.bubbleFooter}>
              <Text
                style={[
                  styles.timeText,
                  isMine ? styles.myTimeText : styles.theirTimeText,
                ]}
              >
                {formatMessageTime(item.createdAt)}
              </Text>

              {isMine && (
                <View style={styles.statusIndicator}>
                  {isPending ? (
                    <Text style={styles.pendingText}>• sending</Text>
                  ) : isFailed ? (
                    <Text style={styles.failedText}>• failed</Text>
                  ) : item.isRead ? (
                    <Text style={styles.readText}>✓✓</Text>
                  ) : (
                    <Text style={styles.sentText}>✓</Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      );
    },
    [currentUser]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <AppHeader
        title={title || 'Direct Message'}
        onBackPress={() => navigation.goBack()}
        rightAction={
          <View style={styles.connectionStatusPill}>
            <View
              style={[
                styles.statusDot,
                isConnectedToSocket
                  ? styles.statusDotLive
                  : connectionState === 'RECONNECTING'
                  ? styles.statusDotReconnecting
                  : styles.statusDotOffline,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                isConnectedToSocket
                  ? styles.statusTextLive
                  : connectionState === 'RECONNECTING'
                  ? styles.statusTextReconnecting
                  : styles.statusTextOffline,
              ]}
            >
              {isConnectedToSocket
                ? 'Live'
                : connectionState === 'RECONNECTING'
                ? 'Syncing'
                : 'Polling'}
            </Text>
          </View>
        }
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
          keyExtractor={(item) => item.clientMessageId || item.id}
          renderItem={renderMessageItem}
          inverted
          contentContainerStyle={styles.messageList}
        />
      )}

      {/* Typing banner indicator */}
      {typingUser ? (
        <View style={styles.typingContainer}>
          <View style={styles.typingDot} />
          <Text style={styles.typingText}>{typingUser} is typing...</Text>
        </View>
      ) : null}

      {/* Input bar */}
      <View
        style={[
          styles.inputContainer,
          { paddingBottom: Math.max(insets.bottom, spacing[2]) },
        ]}
      >
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={handleTextChange}
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

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
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
      backgroundColor: colors.bubbleSent,
      borderBottomRightRadius: 2,
    },
    pendingBubble: {
      opacity: 0.82,
    },
    theirBubble: {
      backgroundColor: colors.bubbleReceived,
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
      color: colors.bubbleSentText,
    },
    theirMessageText: {
      color: colors.bubbleReceivedText,
    },
    bubbleFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 4,
      gap: 4,
    },
    timeText: {
      ...typography.caption,
      fontSize: 10,
    },
    myTimeText: {
      color: 'rgba(255, 255, 255, 0.75)',
    },
    theirTimeText: {
      color: colors.textMuted,
    },
    statusIndicator: {
      marginLeft: 2,
    },
    pendingText: {
      fontSize: 9,
      color: 'rgba(255, 255, 255, 0.7)',
      fontStyle: 'italic',
    },
    failedText: {
      fontSize: 9,
      color: colors.danger,
      fontWeight: '700',
    },
    sentText: {
      fontSize: 10,
      color: 'rgba(255, 255, 255, 0.7)',
    },
    readText: {
      fontSize: 10,
      color: '#93C5FD',
      fontWeight: 'bold',
    },
    typingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing[4],
      paddingVertical: 6,
      backgroundColor: colors.surfaceElevated,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 6,
    },
    typingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    typingText: {
      ...typography.caption,
      fontSize: 12,
      color: colors.primary,
      fontStyle: 'italic',
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
      backgroundColor: colors.inputBg,
      borderRadius: radii.full,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      fontSize: 15,
      color: colors.textPrimary,
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
      opacity: 0.5,
    },
    connectionStatusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: radii.full,
      backgroundColor: colors.surfaceElevated,
      gap: 5,
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
    },
    statusDotLive: {
      backgroundColor: colors.success,
    },
    statusDotReconnecting: {
      backgroundColor: colors.warning,
    },
    statusDotOffline: {
      backgroundColor: colors.textMuted,
    },
    statusText: {
      ...typography.caption,
      fontSize: 11,
      fontWeight: '600',
    },
    statusTextLive: {
      color: colors.success,
    },
    statusTextReconnecting: {
      color: colors.warning,
    },
    statusTextOffline: {
      color: colors.textMuted,
    },
  });
