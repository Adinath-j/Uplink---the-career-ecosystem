import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { Icon } from '../../components/common/Icon';
import { colors, typography, spacing, radii } from '../../theme';
import { useAiStore, AiChatMessage } from '../../store/aiStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PROMPT_SUGGESTIONS = [
  { label: '🚀 Career Advice', prompt: 'What are the most in-demand skills for junior developers in 2026?', type: 'CAREER_ADVICE' },
  { label: '🎯 Interview Prep', prompt: 'Ask me 3 technical interview questions for a Full Stack React & Spring developer.', type: 'INTERVIEW_PREP' },
  { label: '📄 Resume Tips', prompt: 'How do I optimize my projects section for automated ATS screening?', type: 'RESUME_FEEDBACK' },
  { label: '💡 Portfolio Ideas', prompt: 'Give me 3 impactful project ideas to showcase full-stack proficiency.', type: 'CAREER_ADVICE' },
];

export const AIChatScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { messages, isThinking, sendPrompt, clearChat } = useAiStore();
  const [inputText, setInputText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('CAREER_ADVICE');

  const handleSend = async (textToSend?: string, type?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isThinking) return;

    setInputText('');
    await sendPrompt(text, type || selectedTopic);
  };

  const renderMessageItem = ({ item }: { item: AiChatMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.assistantMessageRow,
        ]}
      >
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Icon name="sparkles" size={16} color="#FFFFFF" />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          {!isUser && (
            <View style={styles.senderHeader}>
              <Text style={styles.assistantSenderTitle}>Uplink AI</Text>
              <Text style={styles.timestampText}>{item.timestamp}</Text>
            </View>
          )}
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.assistantText,
            ]}
          >
            {item.content}
          </Text>
          {isUser && (
            <Text style={styles.userTimestampText}>{item.timestamp}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <AppHeader
        title="AI Career Coach"
        onBackPress={() => navigation.goBack()}
        rightAction={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ResumeBuilder')}
              style={styles.headerIconButton}
              activeOpacity={0.7}
            >
              <Icon name="file-text" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={clearChat}
              style={styles.headerIconButton}
              activeOpacity={0.7}
            >
              <Icon name="refresh" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Suggested chips */}
      <View style={styles.suggestionsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsContent}
        >
          {PROMPT_SUGGESTIONS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.chip,
                selectedTopic === item.type && styles.chipActive,
              ]}
              onPress={() => {
                setSelectedTopic(item.type);
                handleSend(item.prompt, item.type);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedTopic === item.type && styles.chipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Inverted Chat Feed */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        inverted
        contentContainerStyle={styles.chatListContent}
        ListHeaderComponent={
          isThinking ? (
            <View style={styles.thinkingContainer}>
              <View style={styles.aiAvatarSmall}>
                <Icon name="sparkles" size={12} color="#FFFFFF" />
              </View>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.thinkingText}>Uplink AI is thinking...</Text>
            </View>
          ) : undefined
        }
      />

      {/* Input row */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask career advice, interview prep, resume..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={600}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isThinking) && styles.sendButtonDisabled,
          ]}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || isThinking}
          activeOpacity={0.7}
        >
          {isThinking ? (
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  headerIconButton: {
    padding: spacing[1],
  },
  suggestionsContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing[2],
  },
  suggestionsContent: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  chatListContent: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: spacing[1],
    alignItems: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[2],
    marginBottom: spacing[1],
  },
  aiAvatarSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[2],
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 2,
  },
  senderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 2,
  },
  assistantSenderTitle: {
    ...typography.label,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  timestampText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    marginLeft: spacing[2],
  },
  userTimestampText: {
    ...typography.caption,
    fontSize: 10,
    color: '#E0E7FF',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  messageText: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: colors.text,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[2],
    paddingHorizontal: spacing[2],
  },
  thinkingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing[2],
    fontStyle: 'italic',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing[2],
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    minHeight: 42,
    backgroundColor: '#F9FAFB',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    color: colors.text,
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
});
