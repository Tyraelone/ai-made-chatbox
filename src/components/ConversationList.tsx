import React, { useRef, useEffect, useState } from 'react';
import { useChatContext } from '../contexts/ChatContext';

interface ConversationListProps {
  onOpenSettings: () => void;
  onOpenStatistics: () => void;
  onToggleDarkMode: () => void;
  darkMode: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  onOpenSettings,
  onOpenStatistics,
  onToggleDarkMode,
  darkMode,
  onCollapse
}) => {
  const {
    conversations,
    currentConversation,
    editingTitleId,
    newTitle,
    setCurrentConversation,
    createNewConversation,
    deleteConversation,
    startEditingTitle,
    saveTitle,
    setNewTitle
  } = useChatContext();
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // 处理点击外部区域结束编辑
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editingTitleId && 
        titleInputRef.current && 
        !titleInputRef.current.contains(event.target as Node)
      ) {
        saveTitle();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingTitleId, saveTitle]);
  
  // 在编辑模式下聚焦输入框
  useEffect(() => {
    if (editingTitleId && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [editingTitleId]);
  
  // 当折叠状态变化时通知父组件
  useEffect(() => {
    if (onCollapse) {
      onCollapse(isCollapsed);
    }
  }, [isCollapsed, onCollapse]);
  
  // 按日期对对话进行分组
  const groupedConversations = conversations.reduce((groups, conv) => {
    const date = new Date(conv.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(conv);
    return groups;
  }, {} as Record<string, typeof conversations>);
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title-container">
          {!isCollapsed && <h2>对话列表</h2>}
          <button 
            className="icon-button collapse-button" 
            onClick={toggleCollapse}
            title={isCollapsed ? "展开侧边栏" : "折叠侧边栏"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isCollapsed ? (
                <>
                  <polyline points="9 18 15 12 9 6"></polyline>
                </>
              ) : (
                <>
                  <polyline points="15 18 9 12 15 6"></polyline>
                </>
              )}
            </svg>
          </button>
        </div>
        <div className="sidebar-actions">
          <button 
            className="icon-button statistics-button" 
            onClick={onOpenStatistics} 
            title="使用统计"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10"></path>
              <path d="M12 20V4"></path>
              <path d="M6 20v-6"></path>
            </svg>
            {!isCollapsed && <span className="button-text">统计</span>}
          </button>
          <button 
            className="icon-button settings-button" 
            onClick={onOpenSettings} 
            title="API 设置"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            {!isCollapsed && <span className="button-text">设置</span>}
          </button>
          <button 
            className="icon-button dark-mode-toggle" 
            onClick={onToggleDarkMode} 
            title={darkMode ? "切换到浅色模式" : "切换到深色模式"}
          >
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
            {!isCollapsed && <span className="button-text">{darkMode ? "浅色" : "深色"}</span>}
          </button>
          <button 
            className="icon-button new-chat-btn" 
            onClick={createNewConversation}
            title="新对话"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {!isCollapsed && <span className="button-text">新对话</span>}
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <div className="no-conversations">没有对话记录</div>
          ) : (
            Object.entries(groupedConversations).map(([date, convs]) => (
              <div key={date} className="conversation-group">
                <div className="conversation-date">{date}</div>
                {convs.map(conv => (
                  <div 
                    key={conv.id} 
                    className={`conversation-item ${currentConversation === conv.id ? 'active' : ''}`}
                    onClick={() => setCurrentConversation(conv.id)}
                  >
                    <div className="conversation-info">
                      {editingTitleId === conv.id ? (
                        <input 
                          ref={titleInputRef}
                          type="text" 
                          className="title-edit-input"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              saveTitle();
                            } else if (e.key === 'Escape') {
                              setNewTitle("");
                              saveTitle();
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span 
                          className="conversation-title" 
                          onDoubleClick={(e) => startEditingTitle(conv.id, conv.title, e)}
                        >
                          {conv.title}
                        </span>
                      )}
                      <span className="conversation-time">
                        {new Date(conv.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="conversation-actions">
                      <button 
                        className="icon-button edit-button"
                        onClick={(e) => startEditingTitle(conv.id, conv.title, e)}
                        title="编辑标题"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button 
                        className="icon-button delete-button" 
                        onClick={(e) => deleteConversation(conv.id, e)}
                        title="删除对话"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationList; 