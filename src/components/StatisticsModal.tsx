import React, { useEffect, useState } from 'react';
import { Conversation } from '../types/chat';
import { calculateStatistics, getLastNDaysStats, StatisticsData } from '../utils/statistics';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  darkMode: boolean;
}

const StatisticsModal: React.FC<StatisticsModalProps> = ({ 
  isOpen, 
  onClose, 
  conversations,
  darkMode
}) => {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('7days');

  useEffect(() => {
    if (isOpen && conversations.length > 0) {
      const calculatedStats = calculateStatistics(conversations);
      setStats(calculatedStats);
    }
  }, [isOpen, conversations]);

  if (!isOpen || !stats) return null;

  // 获取过去N天的统计数据
  const { dates, conversationCounts, messageCounts } = getLastNDaysStats(
    stats, 
    timeRange === '7days' ? 7 : 30
  );

  return (
    <div className="settings-modal-overlay">
      <div className={`statistics-modal ${darkMode ? 'dark-mode' : ''}`}>
        <div className="settings-modal-header">
          <h2>使用统计</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="statistics-content">
          <div className="time-range-selector">
            <button 
              className={timeRange === '7days' ? 'active' : ''} 
              onClick={() => setTimeRange('7days')}
            >
              近7天
            </button>
            <button 
              className={timeRange === '30days' ? 'active' : ''} 
              onClick={() => setTimeRange('30days')}
            >
              近30天
            </button>
            <button 
              className={timeRange === 'all' ? 'active' : ''} 
              onClick={() => setTimeRange('all')}
            >
              全部
            </button>
          </div>
          
          <div className="statistics-summary">
            <div className="stat-card">
              <div className="stat-value">{stats.totalConversations}</div>
              <div className="stat-label">总对话数</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalMessages}</div>
              <div className="stat-label">总消息数</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.userMessages}</div>
              <div className="stat-label">用户消息</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.assistantMessages}</div>
              <div className="stat-label">助手消息</div>
            </div>
          </div>
          
          <div className="statistics-details">
            <div className="stat-section">
              <h3>消息统计</h3>
              <div className="stat-row">
                <div className="stat-label">平均每个对话消息数</div>
                <div className="stat-value">{stats.averageMessagesPerConversation.toFixed(1)}</div>
              </div>
              <div className="stat-row">
                <div className="stat-label">平均用户消息长度</div>
                <div className="stat-value">{stats.averageUserMessageLength.toFixed(0)} 字符</div>
              </div>
              <div className="stat-row">
                <div className="stat-label">平均助手消息长度</div>
                <div className="stat-value">{stats.averageAssistantMessageLength.toFixed(0)} 字符</div>
              </div>
              <div className="stat-row">
                <div className="stat-label">最活跃的日期</div>
                <div className="stat-value">{stats.mostActiveDay} ({stats.messagesPerDay[stats.mostActiveDay] || 0} 条消息)</div>
              </div>
            </div>
            
            <div className="stat-section">
              <h3>最长的对话</h3>
              <div className="stat-row">
                <div className="stat-label">标题</div>
                <div className="stat-value">{stats.longestConversation.title}</div>
              </div>
              <div className="stat-row">
                <div className="stat-label">消息数</div>
                <div className="stat-value">{stats.longestConversation.messageCount}</div>
              </div>
            </div>
            
            <div className="stat-section">
              <h3>模型使用统计</h3>
              {Object.keys(stats.modelUsage).length > 0 ? (
                Object.entries(stats.modelUsage).map(([model, count]) => (
                  <div className="stat-row" key={model}>
                    <div className="stat-label">{model}</div>
                    <div className="stat-value">{count} 次</div>
                  </div>
                ))
              ) : (
                <div className="stat-row">
                  <div className="stat-label">暂无模型使用记录</div>
                  <div className="stat-value">0</div>
                </div>
              )}
            </div>
          </div>
          
          {timeRange !== 'all' && (
            <div className="chart-container">
              <h3>活动趋势 ({timeRange === '7days' ? '近7天' : '近30天'})</h3>
              <div className="chart">
                {/* 简单的柱状图实现 */}
                <div className="chart-bars">
                  {dates.map((date, index) => (
                    <div key={date} className="chart-bar-group">
                      <div 
                        className="chart-bar messages-bar"
                        style={{ 
                          height: `${messageCounts[index] ? Math.min(100, messageCounts[index] * 5) : 0}px` 
                        }}
                        title={`${date}: ${messageCounts[index]} 条消息`}
                      />
                      <div 
                        className="chart-bar conversations-bar"
                        style={{ 
                          height: `${conversationCounts[index] ? Math.min(100, conversationCounts[index] * 10) : 0}px` 
                        }}
                        title={`${date}: ${conversationCounts[index]} 个对话`}
                      />
                      <div className="chart-label">{date.split('-')[2]}</div>
                    </div>
                  ))}
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color messages-color"></div>
                    <div>消息</div>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color conversations-color"></div>
                    <div>对话</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsModal; 