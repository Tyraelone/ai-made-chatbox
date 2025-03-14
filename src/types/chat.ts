// 消息类型定义
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
}

// 对话类型定义
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt?: Date;
  model?: string;
}

// 用于处理本地存储的序列化和反序列化
export interface SerializedConversation {
  id: string;
  title: string;
  messages: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string; // ISO 字符串
    model?: string;
  }[];
  createdAt: string; // ISO 字符串
  updatedAt?: string; // ISO 字符串
  model?: string;
}

// 将对话对象转换为可序列化的对象
export function serializeConversation(conv: Conversation): SerializedConversation {
  return {
    ...conv,
    messages: conv.messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    })),
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt ? conv.updatedAt.toISOString() : undefined,
    model: conv.model
  };
}

// 将序列化的对话对象转换回原始对象
export function deserializeConversation(serialized: SerializedConversation): Conversation {
  return {
    ...serialized,
    messages: serialized.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    })),
    createdAt: new Date(serialized.createdAt),
    updatedAt: serialized.updatedAt ? new Date(serialized.updatedAt) : undefined,
    model: serialized.model
  };
}
