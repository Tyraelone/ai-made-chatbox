import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
// 移除 rehypeRaw 插件，它用于处理 HTML
// 引入优化过的样式
import '../styles/markdown.css';

interface MarkdownRendererProps {
  content: string;
  darkMode: boolean;
}

// 检测内容是否为HTML的函数
const isCompleteHtml = (content: string): boolean => {
  const trimmedContent = content.trim();
  return trimmedContent.startsWith('<') && 
         (trimmedContent.includes('<html') || 
          trimmedContent.includes('<body') || 
          trimmedContent.includes('<div') ||
          trimmedContent.includes('<p'));
};

// HTML预览模态框组件
const HtmlPreviewModal: React.FC<{
  htmlContent: string;
  onClose: () => void;
  darkMode: boolean;
}> = ({ htmlContent, onClose, darkMode }) => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '80%',
          height: '80%',
          backgroundColor: darkMode ? '#1e1e1e' : 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <h3 style={{ color: darkMode ? 'white' : 'black', margin: 0 }}>HTML 预览</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: darkMode ? 'white' : 'black',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            &times;
          </button>
        </div>
        <div style={{
          flex: 1,
          border: `1px solid ${darkMode ? '#444' : '#ddd'}`,
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          <iframe
            srcDoc={htmlContent}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: 'white'
            }}
            sandbox="allow-scripts"
            title="HTML Preview"
          />
        </div>
      </div>
    </div>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, darkMode }) => {
  // 添加状态管理
  const [showHtmlPreview, setShowHtmlPreview] = useState<boolean>(false);
  const [htmlContent, setHtmlContent] = useState<string>('');

  // 处理HTML预览
  const handleHtmlPreview = (code: string) => {
    setHtmlContent(code);
    setShowHtmlPreview(true);
  };

  // 渲染控制逻辑，简化后只保留 Markdown 渲染
  return (
    <div className="markdown-content" style={{position: 'relative'}}>
      <ReactMarkdown
        className={`markdown-body ${darkMode ? 'dark-mode' : ''}`}
        remarkPlugins={[remarkGfm]}
        // 移除 rehypeRaw 插件
        components={{
          code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '');
            const codeContent = String(children).replace(/\n$/, '');
            const isHtml = match && (match[1] === 'html' || match[1] === 'xml') && isCompleteHtml(codeContent);
            
            return !inline && match ? (
              <div style={{position: 'relative'}}>
                <SyntaxHighlighter
                  style={darkMode ? tomorrow : solarizedlight}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                  customStyle={{fontSize: '0.8rem', padding: '10px', marginTop: '28px'} as React.CSSProperties}
                >
                  {codeContent}
                </SyntaxHighlighter>
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  display: 'flex',
                  gap: '4px'
                }}>
                  {isHtml && (
                    <button
                      onClick={() => handleHtmlPreview(codeContent)}
                      style={{
                        padding: '4px 8px',
                        background: darkMode ? '#444' : '#f0f0f0',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: darkMode ? '#fff' : '#000'
                      }}
                    >
                      预览HTML
                    </button>
                  )}
                  <button
                    onClick={() => navigator.clipboard.writeText(codeContent)}
                    style={{
                      padding: '4px 8px',
                      background: darkMode ? '#333' : '#eee',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      color: darkMode ? '#fff' : '#000'
                    }}
                  >
                    复制
                  </button>
                </div>
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
      
      {showHtmlPreview && (
        <HtmlPreviewModal 
          htmlContent={htmlContent}
          onClose={() => setShowHtmlPreview(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default MarkdownRenderer;
