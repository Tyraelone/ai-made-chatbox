import React, { useState } from 'react';
import { Button, Input, List, Modal, Tag, Typography, Popconfirm, Space, Drawer, Tabs } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, RobotOutlined } from '@ant-design/icons';
import usePromptStore from '../../stores/promptStore';
import { PromptTemplate } from '../../types/prompt';
import PromptTemplateForm from './PromptTemplateForm';
import { useChatContext } from '../../contexts/ChatContext';

const { Search } = Input;
const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

interface PromptLibraryProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
}

const PromptLibrary: React.FC<PromptLibraryProps> = ({ visible, onClose, onSelect }) => {
  const { templates, deleteTemplate } = usePromptStore();
  const { setCurrentAssistant, currentAssistant } = useChatContext();
  const [searchText, setSearchText] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('assistants');

  const assistants = templates.filter(template => template.isAssistant);
  const promptTemplates = templates.filter(template => !template.isAssistant);

  const filteredAssistants = assistants.filter(assistant => 
    assistant.title.toLowerCase().includes(searchText.toLowerCase()) ||
    assistant.content.toLowerCase().includes(searchText.toLowerCase()) ||
    assistant.tags?.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
  );

  const filteredTemplates = promptTemplates.filter(template => 
    template.title.toLowerCase().includes(searchText.toLowerCase()) ||
    template.content.toLowerCase().includes(searchText.toLowerCase()) ||
    template.tags?.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setIsAddModalVisible(true);
  };

  const handleEditTemplate = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setIsAddModalVisible(true);
  };

  const handleModalClose = () => {
    setIsAddModalVisible(false);
    setEditingTemplate(null);
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    if (template.isAssistant) {
      setCurrentAssistant(template);
      onClose();
    } else {
      onSelect(template.content);
      onClose();
    }
  };

  const renderAssistantList = () => (
    <List
      itemLayout="vertical"
      dataSource={filteredAssistants}
      renderItem={template => (
        <List.Item
          key={template.id}
          actions={[
            <Button 
              key="use" 
              type="primary" 
              size="small"
              onClick={() => handleSelectTemplate(template)}
            >
              {currentAssistant?.id === template.id ? '当前助手' : '选择助手'}
            </Button>,
            <Button
              key="edit"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditTemplate(template)}
            />,
            <Popconfirm
              key="delete"
              title="确定要删除这个助手吗？"
              onConfirm={() => deleteTemplate(template.id)}
              okText="是"
              cancelText="否"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>,
          ]}
        >
          <List.Item.Meta
            avatar={<RobotOutlined style={{ fontSize: 24 }} />}
            title={<a onClick={() => handleSelectTemplate(template)}>{template.title}</a>}
            description={
              <Space direction="vertical" size="small">
                <Space>
                  {template.tags?.map(tag => (
                    <Tag key={tag} color="blue">{tag}</Tag>
                  ))}
                </Space>
                {template.assistantConfig && (
                  <div>
                    <Tag color="green">模型: {template.assistantConfig.model}</Tag>
                    {template.assistantConfig.temperature && (
                      <Tag color="orange">温度: {template.assistantConfig.temperature}</Tag>
                    )}
                  </div>
                )}
              </Space>
            }
          />
          <Paragraph ellipsis={{ rows: 2 }}>{template.content}</Paragraph>
        </List.Item>
      )}
    />
  );

  const renderTemplateList = () => (
    <List
      itemLayout="vertical"
      dataSource={filteredTemplates}
      renderItem={template => (
        <List.Item
          key={template.id}
          actions={[
            <Button 
              key="use" 
              type="primary" 
              size="small"
              onClick={() => handleSelectTemplate(template)}
            >
              使用
            </Button>,
            <Button
              key="edit"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditTemplate(template)}
            />,
            <Popconfirm
              key="delete"
              title="确定要删除这个模板吗？"
              onConfirm={() => deleteTemplate(template.id)}
              okText="是"
              cancelText="否"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>,
          ]}
        >
          <List.Item.Meta
            title={<a onClick={() => handleSelectTemplate(template)}>{template.title}</a>}
            description={
              <Space>
                {template.tags?.map(tag => (
                  <Tag key={tag} color="blue">{tag}</Tag>
                ))}
              </Space>
            }
          />
          <Paragraph ellipsis={{ rows: 2 }}>{template.content}</Paragraph>
        </List.Item>
      )}
    />
  );

  return (
    <Drawer
      title="AI助手与提示词库"
      placement="right"
      onClose={onClose}
      open={visible}
      width={500}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTemplate}>
          新建
        </Button>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Search 
          placeholder="搜索..." 
          allowClear 
          enterButton="搜索" 
          size="middle" 
          onSearch={handleSearch} 
        />
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="AI助手" key="assistants">
          {renderAssistantList()}
        </TabPane>
        <TabPane tab="提示词模板" key="templates">
          {renderTemplateList()}
        </TabPane>
      </Tabs>
      
      <PromptTemplateForm
        visible={isAddModalVisible}
        onClose={handleModalClose}
        template={editingTemplate}
      />
    </Drawer>
  );
};

export default PromptLibrary;
