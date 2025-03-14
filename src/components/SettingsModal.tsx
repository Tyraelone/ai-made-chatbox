import { useState, useEffect } from 'react';
import { DeepseekConfig } from '../services/deepseekAPI';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DeepseekConfig;
  onSave: (config: DeepseekConfig) => void;
}

const SettingsModal = ({ isOpen, onClose, config, onSave }: SettingsModalProps) => {
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [apiUrl, setApiUrl] = useState(config.apiUrl);
  const [model, setModel] = useState(config.model);
  const [stream, setStream] = useState(config.stream);
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      // 重置表单数据
      setApiKey(config.apiKey);
      setApiUrl(config.apiUrl);
      setModel(config.model);
      setStream(config.stream);
      setErrorMessage('');
    }
  }, [isOpen, config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!apiKey.trim()) {
      setErrorMessage('API 密钥不能为空');
      return;
    }

    try {
      setIsValidating(true);
      
      // 这里可以添加 API 密钥的验证逻辑
      // 例如发送一个测试请求验证 API 密钥是否有效
      
      // 保存配置
      onSave({
        apiKey,
        apiUrl,
        model,
        stream
      });
      
      onClose();
    } catch (error) {
      setErrorMessage('验证 API 密钥失败');
      console.error('API 密钥验证失败:', error);
    } finally {
      setIsValidating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="settings-modal-header">
          <h2>API 设置</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="apiKey">Deepseek API 密钥</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="输入 API 密钥"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="apiUrl">API URL</label>
            <input
              type="text"
              id="apiUrl"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="API 端点 URL"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="model">模型</label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="deepseek-chat">deepseek-chat</option>
              <option value="deepseek-coder">deepseek-coder</option>
              <option value="deepseek-reasoner">deepseek-reasoner</option>
            </select>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={stream}
                onChange={(e) => setStream(e.target.checked)}
              />
              启用流式响应
            </label>
            <p className="setting-description">
              流式响应可以让回复逐步显示，提供更好的交互体验。
            </p>
          </div>
          
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              取消
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={isValidating}
            >
              {isValidating ? '验证中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
