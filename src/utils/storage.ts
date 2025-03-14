/**
 * 本地存储工具函数
 */

// 对话历史存储的键名
export const CHAT_HISTORY_KEY = 'chatbox_conversations';

// 保存数据到本地存储
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error('保存到本地存储失败:', error);
  }
};

// 从本地存储获取数据
export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) {
      return defaultValue;
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.error('从本地存储读取失败:', error);
    return defaultValue;
  }
};

// 从本地存储中删除数据
export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('从本地存储删除失败:', error);
  }
};

// 清空本地存储
export const clearLocalStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('清空本地存储失败:', error);
  }
};
