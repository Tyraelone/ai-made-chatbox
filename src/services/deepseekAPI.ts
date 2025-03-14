import { Message } from '../types/chat';

// Deepseek API 配置类型
export interface DeepseekConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
  stream: boolean;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// 默认配置
export const defaultDeepseekConfig: DeepseekConfig = {
  apiKey: '',
  apiUrl: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-chat', // 默认模型
  stream: true, // 默认启用流式响应
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: ''
};

// 将消息转换为 Deepseek API 格式
const convertMessagesToDeepseekFormat = (messages: Message[]) => {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
};

// 调用 Deepseek API (非流式)
export const callDeepseekAPI = async (messages: Message[], config: DeepseekConfig) => {
  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: convertMessagesToDeepseekFormat(messages),
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Deepseek API 调用失败:', error);
    throw error;
  }
};

// 调用 Deepseek API (流式)
export const callDeepseekAPIStream = async (
  messages: Message[], 
  config: DeepseekConfig,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
) => {
  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: convertMessagesToDeepseekFormat(messages),
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('响应流不可用');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let done = false;
    
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      
      if (done) {
        onDone();
        break;
      }
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => line.replace(/^data: /, ''));
      
      for (const line of lines) {
        if (line === '[DONE]') {
          onDone();
          done = true;
          break;
        }
        
        try {
          const json = JSON.parse(line);
          const content = json.choices[0]?.delta?.content || '';
          if (content) {
            onChunk(content);
          }
        } catch (error) {
          console.error('解析流响应出错:', error);
        }
      }
    }
  } catch (error) {
    console.error('Deepseek API 流式调用失败:', error);
    onError(error instanceof Error ? error : new Error(String(error)));
  }
};
