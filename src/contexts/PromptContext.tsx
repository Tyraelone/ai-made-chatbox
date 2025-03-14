import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PromptContextType {
  selectedPrompt: string;
  setSelectedPrompt: (prompt: string) => void;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export const PromptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPrompt, setSelectedPrompt] = useState("");
  
  const contextValue: PromptContextType = {
    selectedPrompt,
    setSelectedPrompt
  };
  
  return (
    <PromptContext.Provider value={contextValue}>
      {children}
    </PromptContext.Provider>
  );
};

// 自定义钩子，用于访问上下文
export const usePromptContext = () => {
  const context = useContext(PromptContext);
  if (context === undefined) {
    throw new Error('usePromptContext must be used within a PromptProvider');
  }
  return context;
}; 