export interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  isAssistant?: boolean;
  assistantConfig?: {
    model: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  };
}

export interface PromptTemplateStore {
  templates: PromptTemplate[];
  addTemplate: (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PromptTemplate>;
  updateTemplate: (id: string, template: Partial<Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<PromptTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplateById: (id: string) => PromptTemplate | undefined;
  getTemplates: () => PromptTemplate[];
}
