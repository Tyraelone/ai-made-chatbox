import React, { useState, useEffect } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import { usePromptContext } from '../contexts/PromptContext';

interface ChatInputProps {
  onOpenPromptLibrary: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onOpenPromptLibrary }) => {
  const { isLoading, sendMessage } = useChatContext();
  const { selectedPrompt } = usePromptContext();
  const [inputMessage, setInputMessage] = useState("");
  
  // 当选择了提示词模板时，更新输入框
  useEffect(() => {
    if (selectedPrompt) {
      setInputMessage(selectedPrompt);
    }
  }, [selectedPrompt]);
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    await sendMessage(inputMessage);
    setInputMessage("");
  };
  
  return (
    <div className="input-container">
      <div className="message-input-wrapper">
        <button
          className="prompt-library-button"
          onClick={onOpenPromptLibrary}
          title="提示词模板库"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </button>
        <textarea
          className="message-input-textarea"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="输入消息..."
          disabled={isLoading}
        />
        <button 
          className="send-button" 
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          <span>发送</span>
        </button>
      </div>
    </div>
  );
};

export default ChatInput; 