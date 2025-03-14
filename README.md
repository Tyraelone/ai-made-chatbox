# Chatbox

Chatbox 是一个基于 Tauri + React 开发的现代化聊天应用，支持 Markdown 渲染、代码高亮、深色模式等功能。

## 功能特性

- 💬 支持 Markdown 格式的消息渲染
- 🌙 深色/浅色主题切换
- 📝 提示词模板库
- 📊 对话统计
- ⚙️ 自定义设置
- 🎨 现代化的用户界面
- 🔍 代码高亮显示
- 📱 响应式设计

## 技术栈

- [Tauri](https://tauri.app/) - 构建跨平台桌面应用
- [React](https://reactjs.org/) - 用户界面框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript
- [Ant Design](https://ant.design/) - UI 组件库
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown 渲染
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理

## 开发环境要求

- Node.js 18+
- Rust 1.70+
- Tauri CLI

## 安装

1. 克隆项目
```bash
git clone https://github.com/yourusername/chatbox.git
cd chatbox
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run tauri dev
```

## 构建

```bash
npm run tauri build
```

## 项目结构

```
chatbox/
├── src/
│   ├── components/     # React 组件
│   ├── contexts/      # React Context
│   ├── styles/        # CSS 样式文件
│   └── App.tsx        # 主应用组件
├── src-tauri/         # Tauri 后端代码
└── package.json       # 项目配置和依赖
```

## 使用说明

1. 启动应用后，可以在左侧边栏查看对话列表
2. 点击"+"按钮创建新对话
3. 在输入框中输入消息，支持 Markdown 格式
4. 使用设置按钮配置应用参数
5. 使用统计按钮查看对话统计信息
6. 使用提示词库按钮访问预设的提示词模板

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

MIT License
