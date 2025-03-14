import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Conversation, 
  Message, 
  serializeConversation, 
  deserializeConversation, 
  SerializedConversation 
} from "../types/chat";
import { DeepseekConfig, defaultDeepseekConfig, callDeepseekAPI, callDeepseekAPIStream } from "../services/deepseekAPI";
import { CHAT_HISTORY_KEY, saveToLocalStorage, getFromLocalStorage } from "../utils/storage";
import { PromptTemplate } from "../types/prompt";
import usePromptStore from "../stores/promptStore";

// 定义上下文类型
interface ChatContextType {
  // 状态
  conversations: Conversation[];
  currentConversation: string | null;
  isLoading: boolean;
  editingTitleId: string | null;
  newTitle: string;
  deepseekConfig: DeepseekConfig;
  currentAssistant: PromptTemplate | null;
  
  // 方法
  setCurrentConversation: (id: string) => void;
  createNewConversation: () => Conversation;
  deleteConversation: (id: string, e: React.MouseEvent) => void;
  startEditingTitle: (id: string, currentTitle: string, e: React.MouseEvent) => void;
  saveTitle: () => void;
  setNewTitle: (title: string) => void;
  saveDeepseekConfig: (config: DeepseekConfig) => void;
  sendMessage: (content: string) => Promise<void>;
  getCurrentConversation: () => Conversation | null;
  prepareMessageContent: (content: string) => string;
  processThinkingContent: (content: string) => { regularContent: string, thinkingContent: string[] };
  setCurrentAssistant: (assistant: PromptTemplate | null) => void;
}

// 创建上下文
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// 提供者组件
export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 状态管理
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [currentAssistant, setCurrentAssistant] = useState<PromptTemplate | null>(null);
  const [deepseekConfig, setDeepseekConfig] = useState<DeepseekConfig>(() => {
    const savedConfig = localStorage.getItem('deepseekConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultDeepseekConfig;
  });
  
  // 从本地存储加载对话
  const loadConversationsFromStorage = () => {
    try {
      const serializedConversations = getFromLocalStorage<SerializedConversation[]>(CHAT_HISTORY_KEY, []);
      if (serializedConversations && serializedConversations.length > 0) {
        const loadedConversations = serializedConversations.map(deserializeConversation);
        setConversations(loadedConversations);
        
        // 如果有对话，选择最新的那个
        setCurrentConversation(loadedConversations[loadedConversations.length - 1].id);
      } else {
        // 如果没有存储的对话，创建一个新的
        createNewConversation();
      }
    } catch (error) {
      console.error('加载对话失败:', error);
      // 出错时创建新对话
      createNewConversation();
    }
  };
  
  // 保存对话到本地存储
  const saveConversationsToStorage = (convs: Conversation[]) => {
    try {
      const serializedConversations = convs.map(serializeConversation);
      saveToLocalStorage(CHAT_HISTORY_KEY, serializedConversations);
    } catch (error) {
      console.error('保存对话失败:', error);
    }
  };
  
  // 创建新对话
  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: `新对话 ${conversations.length + 1}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const newConversations = [...conversations, newConversation];
    setConversations(newConversations);
    setCurrentConversation(newConversation.id);
    
    // 保存到本地存储
    saveConversationsToStorage(newConversations);
    
    return newConversation;
  };
  
  // 删除对话
  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发选择对话
    
    const updatedConversations = conversations.filter(conv => conv.id !== id);
    setConversations(updatedConversations);
    
    // 如果删除的是当前对话，则选择最新的对话或创建一个新的
    if (id === currentConversation) {
      if (updatedConversations.length > 0) {
        setCurrentConversation(updatedConversations[updatedConversations.length - 1].id);
      } else {
        createNewConversation();
      }
    }
    
    // 保存到本地存储
    saveConversationsToStorage(updatedConversations);
  };
  
  // 开始编辑标题
  const startEditingTitle = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发选择对话
    setEditingTitleId(id);
    setNewTitle(currentTitle);
  };
  
  // 保存编辑后的标题
  const saveTitle = () => {
    if (!editingTitleId || !newTitle.trim()) return;
    
    const updatedConversations = conversations.map(conv => 
      conv.id === editingTitleId 
        ? { ...conv, title: newTitle.trim(), updatedAt: new Date() } 
        : conv
    );
    
    setConversations(updatedConversations);
    setEditingTitleId(null);
    setNewTitle("");
    
    // 保存到本地存储
    saveConversationsToStorage(updatedConversations);
  };
  
  // 保存 Deepseek 配置
  const saveDeepseekConfig = (config: DeepseekConfig) => {
    setDeepseekConfig(config);
    localStorage.setItem('deepseekConfig', JSON.stringify(config));
  };
  
  // 设置当前AI助手
  const handleSetCurrentAssistant = (assistant: PromptTemplate | null) => {
    setCurrentAssistant(assistant);
    if (assistant?.assistantConfig) {
      const newConfig: DeepseekConfig = {
        ...deepseekConfig,
        model: assistant.assistantConfig.model,
        temperature: assistant.assistantConfig.temperature,
        maxTokens: assistant.assistantConfig.maxTokens,
        systemPrompt: assistant.assistantConfig.systemPrompt
      };
      saveDeepseekConfig(newConfig);
    }
  };
  
  // 修改发送消息函数，使用当前助手的配置
  const sendMessage = async (inputMessage: string) => {
    if (!inputMessage.trim() || !currentConversation) return;
    
    // 找到当前对话
    const conversationIndex = conversations.findIndex(conv => conv.id === currentConversation);
    if (conversationIndex === -1) return;
    
    // 创建用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    // 更新对话列表
    const updatedConversations = [...conversations];
    updatedConversations[conversationIndex].messages.push(userMessage);
    updatedConversations[conversationIndex].updatedAt = new Date();
    setConversations(updatedConversations);
    
    // 保存到本地存储
    saveConversationsToStorage(updatedConversations);
    
    // 调用 API
    setIsLoading(true);
    try {
      // 如果没有设置 API 密钥，提示用户
      if (!deepseekConfig.apiKey) {
        throw new Error("请先配置 API 密钥");
      }
      
      // 创建当前消息历史
      const messageHistory = [...updatedConversations[conversationIndex].messages];
      
      // 创建一个新的助手消息，用于流式更新
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: deepseekConfig.stream ? '' : '正在生成回复...',
        timestamp: new Date(),
        model: currentAssistant?.assistantConfig?.model || deepseekConfig.model
      };
      
      // 添加助手消息到对话中
      const newConversations = [...updatedConversations];
      newConversations[conversationIndex].messages.push(assistantMessage);
      newConversations[conversationIndex].updatedAt = new Date();
      
      // 更新对话的模型信息
      if (!newConversations[conversationIndex].model) {
        newConversations[conversationIndex].model = currentAssistant?.assistantConfig?.model || deepseekConfig.model;
      }
      
      setConversations(newConversations);
      
      // 如果是第一条消息，更新对话标题
      if (newConversations[conversationIndex].messages.length === 2) {
        const title = userMessage.content.substring(0, 30) + (userMessage.content.length > 30 ? "..." : "");
        newConversations[conversationIndex].title = title;
        setConversations([...newConversations]);
      }
      
      // 保存到本地存储
      saveConversationsToStorage(newConversations);
      
      // 根据配置选择是否使用流式响应
      if (deepseekConfig.stream) {
        // 使用流式响应
        let fullContent = ''; // 用于跟踪完整响应
        
        callDeepseekAPIStream(
          messageHistory, 
          deepseekConfig,
          (chunk) => {
            // 接收到新的内容块，添加到完整响应中
            fullContent += chunk;
            
            // 更新消息内容为完整的内容，而不是追加
            setConversations(prev => {
              const convs = [...prev];
              const convIndex = convs.findIndex(conv => conv.id === currentConversation);
              if (convIndex !== -1) {
                const msgIndex = convs[convIndex].messages.findIndex(msg => msg.id === assistantMessageId);
                if (msgIndex !== -1) {
                  convs[convIndex].messages[msgIndex].content = fullContent;
                  convs[convIndex].updatedAt = new Date();
                }
              }
              
              // 每次更新都保存到本地存储
              saveConversationsToStorage(convs);
              
              return convs;
            });
          },
          () => {
            // 响应结束
            setIsLoading(false);
            
            // 确保最终结果已保存
            setConversations(prev => {
              saveConversationsToStorage(prev);
              return prev;
            });
          },
          (error) => {
            // 错误处理
            console.error('流式响应错误:', error);
            setConversations(prev => {
              const convs = [...prev];
              const convIndex = convs.findIndex(conv => conv.id === currentConversation);
              if (convIndex !== -1) {
                const msgIndex = convs[convIndex].messages.findIndex(msg => msg.id === assistantMessageId);
                if (msgIndex !== -1) {
                  convs[convIndex].messages[msgIndex].content = `错误: ${error.message}`;
                  convs[convIndex].updatedAt = new Date();
                }
              }
              
              // 保存错误状态
              saveConversationsToStorage(convs);
              
              return convs;
            });
            setIsLoading(false);
          }
        );
      } else {
        // 使用非流式响应
        const response = await callDeepseekAPI(messageHistory, deepseekConfig);
        
        // 更新助手消息
        setConversations(prev => {
          const convs = [...prev];
          const convIndex = convs.findIndex(conv => conv.id === currentConversation);
          if (convIndex !== -1) {
            const msgIndex = convs[convIndex].messages.findIndex(msg => msg.id === assistantMessageId);
            if (msgIndex !== -1) {
              convs[convIndex].messages[msgIndex].content = response;
              convs[convIndex].updatedAt = new Date();
            }
          }
          
          // 保存最终响应
          saveConversationsToStorage(convs);
          
          return convs;
        });
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error("发送消息失败:", error);
      
      // 显示错误消息
      setConversations(prev => {
        const convs = [...prev];
        const convIndex = convs.findIndex(conv => conv.id === currentConversation);
        if (convIndex !== -1) {
          // 查找最后一条消息，假设是刚才添加的助手消息
          const lastMsgIndex = convs[convIndex].messages.length - 1;
          if (lastMsgIndex >= 0 && convs[convIndex].messages[lastMsgIndex].role === 'assistant') {
            // 更新为错误消息
            convs[convIndex].messages[lastMsgIndex].content = 
              `错误: ${error instanceof Error ? error.message : '未知错误'}`;
            convs[convIndex].updatedAt = new Date();
          } else {
            // 或者添加一个新的错误消息
            convs[convIndex].messages.push({
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `错误: ${error instanceof Error ? error.message : '未知错误'}`,
              timestamp: new Date()
            });
            convs[convIndex].updatedAt = new Date();
          }
        }
        
        // 保存错误状态
        saveConversationsToStorage(convs);
        
        return convs;
      });
      setIsLoading(false);
    }
  };
  
  // 获取当前对话
  const getCurrentConversation = () => {
    return conversations.find(conv => conv.id === currentConversation) || null;
  };

  // 添加函数，确保消息内容可以被安全渲染，并处理推理过程
  const prepareMessageContent = (content: string) => {
    // 确保内容是字符串
    if (!content) return '';
    
    // 处理可能的字符串转义问题
    return content;
  };

  // 添加函数，用于处理显示推理过程
  const processThinkingContent = (content: string) => {
    if (!content) return { regularContent: '', thinkingContent: [] };
    
    // 使用正则表达式匹配<think>标签内的内容
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
    const thinkingParts: string[] = [];
    
    // 提取所有推理过程
    let match;
    let processedContent = content;
    while ((match = thinkRegex.exec(content)) !== null) {
      thinkingParts.push(match[1]);
      // 从原内容中移除推理部分
      processedContent = processedContent.replace(match[0], '');
    }
    
    return {
      regularContent: processedContent,
      thinkingContent: thinkingParts
    };
  };
  
  // 初始化时加载对话
  useEffect(() => {
    loadConversationsFromStorage();
  }, []);
  
  // 提供上下文值
  const contextValue: ChatContextType = {
    conversations,
    currentConversation,
    isLoading,
    editingTitleId,
    newTitle,
    deepseekConfig,
    currentAssistant,
    setCurrentConversation,
    createNewConversation,
    deleteConversation,
    startEditingTitle,
    saveTitle,
    setNewTitle,
    saveDeepseekConfig,
    sendMessage,
    getCurrentConversation,
    prepareMessageContent,
    processThinkingContent,
    setCurrentAssistant: handleSetCurrentAssistant
  };
  
  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// 自定义钩子，用于访问上下文
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}; 