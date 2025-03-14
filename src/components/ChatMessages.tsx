import React, { useRef, useEffect } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import MarkdownRenderer from './MarkdownRenderer';
import { Tag } from 'antd';

interface ChatMessagesProps {
  darkMode: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ darkMode }) => {
  const {
    getCurrentConversation,
    isLoading,
    deepseekConfig,
    prepareMessageContent,
    processThinkingContent,
    currentAssistant
  } = useChatContext();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [getCurrentConversation()]);
  
  const currentConversation = getCurrentConversation();
  
  return (
    <div className="messages-container" style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
      {currentAssistant && (
        <div className="current-assistant-info" style={{ padding: '8px 16px', borderBottom: '1px solid #eee' }}>
          <Tag color="blue">
            <span>当前助手: {currentAssistant.title}</span>
            {currentAssistant.assistantConfig && (
              <span style={{ marginLeft: 8 }}>
                ({currentAssistant.assistantConfig.model})
              </span>
            )}
          </Tag>
        </div>
      )}
      {currentConversation?.messages.map(message => (
        <div key={message.id} className={`message ${message.role}`}>
          {message.role === 'assistant' && (
            <div className="avatar assistant-avatar">AI</div>
          )}
          <div className="message-bubble">
            {message.role === 'assistant' ? (
              <>
                {(() => {
                  const { regularContent, thinkingContent } = processThinkingContent(message.content);
                  return (
                    <>
                      {thinkingContent.length > 0 && thinkingContent.map((think, index) => (
                        <div className="thinking-process" key={index}>
                          <div className="thinking-header">推理过程:</div>
                          <MarkdownRenderer 
                            content={think} 
                            darkMode={darkMode}
                          />
                        </div>
                      ))}
                      <MarkdownRenderer 
                        content={prepareMessageContent(regularContent)} 
                        darkMode={darkMode}
                      />
                    </>
                  );
                })()}
              </>
            ) : (
              message.content
            )}
          </div>
          {message.role === 'user' && (
            <div className="avatar user-avatar">我</div>
          )}
        </div>
      ))}
      {isLoading && !deepseekConfig.stream && (
        <div className="message assistant">
          <div className="avatar assistant-avatar">AI</div>
          <div className="message-bubble">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages; 