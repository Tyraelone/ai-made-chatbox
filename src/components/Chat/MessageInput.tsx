import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import PromptLibrary from '../PromptLibrary/PromptLibrary';
import '../../styles/PromptTemplateModal.css';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onRegenerate: () => void;
  regenerateDisabled: boolean;
  currentSession: any;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onRegenerate, regenerateDisabled, currentSession }) => {
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPromptLibraryVisible, setIsPromptLibraryVisible] = useState(false);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setIsLoading(true);
      onSendMessage(messageText);
      setMessageText('');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectPrompt = (content: string) => {
    setMessageText(content);
  };

  return (
    <div className="message-input-container">
      <div className="prompt-library-button-container">
        <Button
          className="prompt-library-button-top"
          type="text"
          icon={<BookOutlined />}
          onClick={() => setIsPromptLibraryVisible(true)}
          title="提示词模板库"
        >
          提示词模板
        </Button>
      </div>
      
      <div className="flex items-end">
        <div className="flex-1 message-input-wrapper">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="输入消息，Shift + Enter 换行"
            className="message-input-textarea"
            onKeyDown={handleKeyDown}
            rows={4}
          />
          <Button 
            className="send-button"
            type="primary" 
            disabled={!messageText.trim() || isLoading} 
            onClick={handleSendMessage}
          >
            发送
          </Button>
        </div>
      </div>
      
      <PromptLibrary
        visible={isPromptLibraryVisible}
        onClose={() => setIsPromptLibraryVisible(false)}
        onSelect={handleSelectPrompt}
      />
    </div>
  );
};

export default MessageInput;
