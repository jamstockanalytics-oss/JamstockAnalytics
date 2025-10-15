import { useEffect, useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Text, TextInput, Button, Chip, ActivityIndicator, Card, IconButton, Menu, Divider } from "react-native-paper";
import { FlashList } from "@shopify/flash-list";
import { ChatService, type ChatMessage, type ChatSession } from "../../lib/services/chat-service";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [showSessionMenu, setShowSessionMenu] = useState(false);
  const [chatService, setChatService] = useState<ChatService | null>(null);
  const { user } = useAuth();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const flashListRef = useRef<FlashList<ChatMessage>>(null);

  // Initialize chat service
  useEffect(() => {
    if (user?.id) {
      const service = new ChatService(user.id);
      setChatService(service);
      initializeChat(service);
    }
  }, [user?.id]);

  const initializeChat = async (service: ChatService) => {
    try {
      // Get or create active session
      const session = await service.getActiveSession();
      if (session) {
        setCurrentSession(session);
        const history = await service.getChatHistory(session.id);
        setMessages(history);
      } else {
        // Create new session
        const newSession = await service.initializeSession("New Chat");
        setCurrentSession(newSession);
        setMessages([]);
      }

      // Load user sessions
      const userSessions = await service.getUserSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('Error initializing chat:', error);
      // Fallback to welcome message
      setMessages([{
        id: 'welcome',
        type: 'ai',
        content: "Hello! I'm your AI financial analyst specializing in Jamaican and Caribbean markets. How can I help you today?",
        created_at: new Date().toISOString(),
        suggestions: [
          'What are the current market trends?',
          'Tell me about Jamaican stocks',
          'How should I start investing?'
        ],
        related_topics: [
          'Jamaican Stock Exchange',
          'Investment Strategies',
          'Market Analysis'
        ]
      }]);
    }
  };

  const onSend = async () => {
    if (!input.trim() || loading || !chatService) return;
    
    setLoading(true);
    try {
      const updated = await chatService.sendMessage(input.trim());
      setMessages(updated);
      setInput("");
      
      // Scroll to bottom
      setTimeout(() => {
        flashListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Chat error:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSuggestionPress = (suggestion: string) => {
    setInput(suggestion);
  };

  const onNewChat = async () => {
    if (!chatService) return;
    
    try {
      const newSession = await chatService.initializeSession("New Chat");
      setCurrentSession(newSession);
      setMessages([]);
      
      // Refresh sessions list
      const userSessions = await chatService.getUserSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('Error creating new chat:', error);
      Alert.alert('Error', 'Failed to create new chat session.');
    }
  };

  const onSwitchSession = async (sessionId: string) => {
    if (!chatService) return;
    
    try {
      const session = await chatService.switchSession(sessionId);
      if (session) {
        setCurrentSession(session);
        const history = await chatService.getChatHistory(sessionId);
        setMessages(history);
        setShowSessionMenu(false);
      }
    } catch (error) {
      console.error('Error switching session:', error);
      Alert.alert('Error', 'Failed to switch chat session.');
    }
  };

  const onEndSession = async () => {
    if (!chatService || !currentSession) return;
    
    try {
      await chatService.endSession();
      setCurrentSession(null);
      setMessages([]);
      
      // Refresh sessions list
      const userSessions = await chatService.getUserSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  useEffect(() => {
    if (typeof q === "string" && q.length) {
      setInput(q);
    }
  }, [q]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text variant="headlineMedium">Market Analyst AI</Text>
            <Text variant="bodySmall">Powered by DeepSeek AI</Text>
          </View>
          <View style={styles.headerActions}>
            <Menu
              visible={showSessionMenu}
              onDismiss={() => setShowSessionMenu(false)}
              anchor={
                <IconButton
                  icon="history"
                  onPress={() => setShowSessionMenu(true)}
                />
              }
            >
              <Menu.Item
                onPress={onNewChat}
                title="New Chat"
                leadingIcon="plus"
              />
              <Divider />
              {sessions.map((session) => (
                <Menu.Item
                  key={session.id}
                  onPress={() => onSwitchSession(session.id)}
                  title={session.session_name || `Chat ${new Date(session.started_at).toLocaleDateString()}`}
                  leadingIcon={session.id === currentSession?.id ? "check" : "chat"}
                />
              ))}
            </Menu>
            <IconButton
              icon="plus"
              onPress={onNewChat}
            />
            {currentSession && (
              <IconButton
                icon="close"
                onPress={onEndSession}
              />
            )}
          </View>
        </View>
        
        {currentSession && (
          <View style={styles.sessionInfo}>
            <Text variant="labelSmall">
              Session: {currentSession.session_name || 'New Chat'} • 
              {currentSession.total_messages} messages
            </Text>
          </View>
        )}
      </View>
      
      <FlashList
        ref={flashListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        estimatedItemSize={80}
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            { alignItems: item.type === "user" ? "flex-end" : "flex-start" }
          ]}>
            <View style={[
              styles.messageBubble,
              { backgroundColor: item.type === "user" ? "#DCF8C6" : "#F0F0F0" }
            ]}>
              <Text variant="bodyMedium">{item.content}</Text>
              <View style={styles.messageFooter}>
                <Text variant="labelSmall" style={styles.timestamp}>
                  {new Date(item.created_at).toLocaleTimeString()}
                </Text>
                {item.tokens_used && (
                  <Text variant="labelSmall" style={styles.tokenInfo}>
                    {item.tokens_used} tokens
                  </Text>
                )}
                {item.response_time_ms && (
                  <Text variant="labelSmall" style={styles.responseTime}>
                    {item.response_time_ms}ms
                  </Text>
                )}
              </View>
              
              {/* Show suggestions for AI messages */}
              {item.type === "ai" && item.suggestions && item.suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text variant="labelSmall" style={styles.suggestionsLabel}>Quick suggestions:</Text>
                  <View style={styles.suggestions}>
                    {item.suggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => onSuggestionPress(suggestion)}
                        style={styles.suggestionChip}
                      >
                        <Chip mode="outlined" compact>{suggestion}</Chip>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      />
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.textInput} 
          mode="outlined" 
          placeholder="Ask about the market, investments, or financial planning..." 
          value={input} 
          onChangeText={setInput}
          multiline
          disabled={loading}
        />
        <Button 
          mode="contained" 
          onPress={onSend}
          disabled={loading || !input.trim()}
          loading={loading}
        >
          {loading ? "Thinking..." : "Send"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  messageContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  timestamp: {
    opacity: 0.6,
    fontSize: 10,
  },
  tokenInfo: {
    opacity: 0.5,
    fontSize: 10,
    marginLeft: 8,
  },
  responseTime: {
    opacity: 0.5,
    fontSize: 10,
    marginLeft: 8,
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionsLabel: {
    marginBottom: 4,
    fontWeight: '500',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  suggestionChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  textInput: {
    flex: 1,
  },
});


