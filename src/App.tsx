import { useState } from "react";
import "./App.css";
// 确保引入了调整后的markdown样式和提示词模板样式
import "./styles/markdown.css";
import "./styles/PromptTemplateModal.css"; // 添加引入提示词模板样式

// 导入上下文提供者
import { ChatProvider } from "./contexts/ChatContext";
import { ThemeProvider, useThemeContext } from "./contexts/ThemeContext";
import { PromptProvider, usePromptContext } from "./contexts/PromptContext";

// 导入组件
import ConversationList from "./components/ConversationList";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import SettingsModal from "./components/SettingsModal";
import StatisticsModal from "./components/StatisticsModal";
import PromptLibrary from "./components/PromptLibrary";

// 导入类型和服务
import { useChatContext } from "./contexts/ChatContext";

// 主应用组件
const AppContent = () => {
  // 使用上下文
  const { darkMode, toggleDarkMode } = useThemeContext();
  const { conversations, saveDeepseekConfig, deepseekConfig } = useChatContext();
  const { setSelectedPrompt } = usePromptContext();
  
  // 模态框状态
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // 处理选择提示词模板
  const handleSelectPrompt = (content: string) => {
    setSelectedPrompt(content);
    setIsPromptLibraryOpen(false);
  };
  
  // 处理侧边栏折叠状态变化
  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };
  
  return (
    <div className={`chat-app ${darkMode ? 'dark-mode' : ''}`}>
      {/* 侧边栏 - 对话列表 */}
      <ConversationList 
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenStatistics={() => setIsStatisticsModalOpen(true)}
        onToggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        onCollapse={handleSidebarCollapse}
      />
      
      {/* 主聊天区域 */}
      <div className={`chat-container ${isSidebarCollapsed ? 'expanded' : ''}`}>
        {/* 聊天消息区域 */}
        <ChatMessages darkMode={darkMode} />
        
        {/* 输入区域 */}
        <ChatInput onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)} />
      </div>
      
      {/* 设置模态框 */}
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={deepseekConfig}
        onSave={saveDeepseekConfig}
      />
      
      {/* 统计模态框 */}
      <StatisticsModal
        isOpen={isStatisticsModalOpen}
        onClose={() => setIsStatisticsModalOpen(false)}
        conversations={conversations}
        darkMode={darkMode}
      />
      
      {/* 提示词模板库 */}
      <PromptLibrary
        visible={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        onSelect={handleSelectPrompt}
      />
    </div>
  );
};

// 包装应用程序，提供上下文
function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <PromptProvider>
          <AppContent />
        </PromptProvider>
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;
