import { Conversation, Message } from '../types/chat';

// 统计数据类型
export interface StatisticsData {
  totalConversations: number;
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  averageMessagesPerConversation: number;
  totalUserCharacters: number;
  totalAssistantCharacters: number;
  averageUserMessageLength: number;
  averageAssistantMessageLength: number;
  conversationsPerDay: Record<string, number>;
  messagesPerDay: Record<string, number>;
  mostActiveDay: string;
  longestConversation: {
    id: string;
    title: string;
    messageCount: number;
  };
  modelUsage: Record<string, number>;
}

// 格式化日期为 YYYY-MM-DD 格式
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// 计算统计数据
export const calculateStatistics = (conversations: Conversation[]): StatisticsData => {
  // 初始化统计数据
  const stats: StatisticsData = {
    totalConversations: conversations.length,
    totalMessages: 0,
    userMessages: 0,
    assistantMessages: 0,
    averageMessagesPerConversation: 0,
    totalUserCharacters: 0,
    totalAssistantCharacters: 0,
    averageUserMessageLength: 0,
    averageAssistantMessageLength: 0,
    conversationsPerDay: {},
    messagesPerDay: {},
    mostActiveDay: '',
    longestConversation: {
      id: '',
      title: '',
      messageCount: 0
    },
    modelUsage: {}
  };

  // 如果没有对话，直接返回初始统计数据
  if (conversations.length === 0) {
    return stats;
  }

  // 遍历所有对话
  conversations.forEach(conversation => {
    // 记录对话创建日期
    const createdDate = formatDate(new Date(conversation.createdAt));
    stats.conversationsPerDay[createdDate] = (stats.conversationsPerDay[createdDate] || 0) + 1;

    // 记录对话使用的模型
    if (conversation.model) {
      stats.modelUsage[conversation.model] = (stats.modelUsage[conversation.model] || 0) + 1;
    }

    // 查找最长对话
    if (conversation.messages.length > stats.longestConversation.messageCount) {
      stats.longestConversation = {
        id: conversation.id,
        title: conversation.title,
        messageCount: conversation.messages.length
      };
    }

    // 遍历对话中的消息
    conversation.messages.forEach(message => {
      stats.totalMessages++;

      // 记录消息日期
      const messageDate = formatDate(new Date(message.timestamp));
      stats.messagesPerDay[messageDate] = (stats.messagesPerDay[messageDate] || 0) + 1;

      // 按角色统计消息
      if (message.role === 'user') {
        stats.userMessages++;
        stats.totalUserCharacters += message.content.length;
      } else if (message.role === 'assistant') {
        stats.assistantMessages++;
        stats.totalAssistantCharacters += message.content.length;
        
        // 记录助手消息使用的模型
        if (message.model) {
          stats.modelUsage[message.model] = (stats.modelUsage[message.model] || 0) + 1;
        }
      }
    });
  });

  // 计算平均值
  stats.averageMessagesPerConversation = stats.totalMessages / stats.totalConversations;
  stats.averageUserMessageLength = stats.userMessages > 0 ? stats.totalUserCharacters / stats.userMessages : 0;
  stats.averageAssistantMessageLength = stats.assistantMessages > 0 ? stats.totalAssistantCharacters / stats.assistantMessages : 0;

  // 找出最活跃的日期
  let maxMessages = 0;
  for (const [date, count] of Object.entries(stats.messagesPerDay)) {
    if (count > maxMessages) {
      maxMessages = count;
      stats.mostActiveDay = date;
    }
  }

  return stats;
};

// 获取过去N天的日期数组
export const getLastNDays = (n: number): string[] => {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(formatDate(date));
  }
  return dates;
};

// 获取过去N天的统计数据
export const getLastNDaysStats = (
  stats: StatisticsData, 
  n: number
): { dates: string[], conversationCounts: number[], messageCounts: number[] } => {
  const dates = getLastNDays(n);
  const conversationCounts = dates.map(date => stats.conversationsPerDay[date] || 0);
  const messageCounts = dates.map(date => stats.messagesPerDay[date] || 0);
  
  return { dates, conversationCounts, messageCounts };
}; 