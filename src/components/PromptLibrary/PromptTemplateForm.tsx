import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Modal, Select, message, Switch, InputNumber } from 'antd';
import { PromptTemplate } from '../../types/prompt';
import usePromptStore from '../../stores/promptStore';

const { TextArea } = Input;
const { Option } = Select;

interface PromptTemplateFormProps {
  visible: boolean;
  onClose: () => void;
  template: PromptTemplate | null;
}

const PromptTemplateForm: React.FC<PromptTemplateFormProps> = ({ 
  visible, 
  onClose, 
  template 
}) => {
  const [form] = Form.useForm();
  const { addTemplate, updateTemplate } = usePromptStore();
  const [loading, setLoading] = useState(false);
  const [isAssistant, setIsAssistant] = useState(false);
  
  useEffect(() => {
    if (visible) {
      if (template) {
        form.setFieldsValue({
          title: template.title,
          content: template.content,
          tags: template.tags || [],
          isAssistant: template.isAssistant || false,
          assistantConfig: template.assistantConfig || {
            model: 'deepseek-chat',
            temperature: 0.7,
            maxTokens: 2000,
            systemPrompt: ''
          }
        });
        setIsAssistant(template.isAssistant || false);
      } else {
        form.resetFields();
        setIsAssistant(false);
      }
    }
  }, [visible, template, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (template) {
        await updateTemplate(template.id, values);
        message.success('模板已更新');
      } else {
        await addTemplate(values);
        message.success('模板已创建');
      }
      
      onClose();
    } catch (error) {
      console.error('提交表单出错:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={template ? '编辑模板' : '创建模板'}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {template ? '更新' : '创建'}
        </Button>,
      ]}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title: '',
          content: '',
          tags: [],
          isAssistant: false,
          assistantConfig: {
            model: 'deepseek-chat',
            temperature: 0.7,
            maxTokens: 2000,
            systemPrompt: ''
          }
        }}
      >
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input placeholder="给模板起个名称" />
        </Form.Item>

        <Form.Item
          name="isAssistant"
          label="是否为AI助手"
          valuePropName="checked"
        >
          <Switch onChange={setIsAssistant} />
        </Form.Item>

        {isAssistant && (
          <>
            <Form.Item
              name={['assistantConfig', 'model']}
              label="模型"
              rules={[{ required: true, message: '请选择模型' }]}
            >
              <Select>
                <Option value="deepseek-chat">DeepSeek Chat</Option>
                <Option value="gpt-4">GPT-4</Option>
                <Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Option>
                <Option value="claude-3-opus">Claude 3 Opus</Option>
                <Option value="claude-3-sonnet">Claude 3 Sonnet</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name={['assistantConfig', 'temperature']}
              label="温度"
              rules={[{ required: true, message: '请输入温度值' }]}
            >
              <InputNumber
                min={0}
                max={2}
                step={0.1}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name={['assistantConfig', 'maxTokens']}
              label="最大Token数"
              rules={[{ required: true, message: '请输入最大Token数' }]}
            >
              <InputNumber
                min={1}
                max={4000}
                step={100}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name={['assistantConfig', 'systemPrompt']}
              label="系统提示词"
            >
              <TextArea rows={4} placeholder="输入系统提示词..." />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="content"
          label="内容"
          rules={[{ required: true, message: '请输入内容' }]}
        >
          <TextArea 
            rows={10} 
            placeholder={isAssistant ? "输入助手的描述..." : "输入提示词内容..."} 
          />
        </Form.Item>

        <Form.Item
          name="tags"
          label="标签"
        >
          <Select
            mode="tags"
            placeholder="添加标签"
            style={{ width: '100%' }}
          >
            {['翻译', '总结', '创作', '代码', '业务', '学术', '助手'].map(tag => (
              <Option key={tag} value={tag}>
                {tag}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PromptTemplateForm;
