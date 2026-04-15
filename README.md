# DHF RPA Skills

> DHF Agent RPA 自动化技能包 - 按需安装，灵活使用

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![DHF Agent](https://img.shields.io/badge/DHF-Agent-blue)](https://dhf.pub)

## 简介

这是一个为 Claude Code 定制的 DHF Agent RPA 自动化技能包，采用**按需安装**设计，你可以只选择需要的技能，避免不必要的依赖和文件。

## 特性

- ✅ **按需安装** - 只安装你需要的技能
- ✅ **统一管理** - 所有技能在一个仓库中
- ✅ **命令行工具** - 简洁的 CLI 命令
- ✅ **符号链接** - 不复制文件，节省空间
- ✅ **动态配置** - 自动生成插件配置

## 包含的技能

### 邮件类

| 技能 | 描述 | 命令 |
|------|------|------|
| QQ 邮件发送 | 自动化发送 QQ 邮件 | `dhf-skills install qq-mail-task` |
| Outlook 邮件发送 | 自动化发送 Outlook 邮件 | `dhf-skills install outlook-mail-task` |
| 163 邮件发送 | 自动化发送 163 邮件 | `dhf-skills install mail-163-task` |

### 搜索类

| 技能 | 描述 | 命令 |
|------|------|------|
| Google 搜索 | 使用 Google 进行网络搜索 | `dhf-skills install google-search-task` |
| Bing 搜索 | 使用 Bing 进行网络搜索 | `dhf-skills install bing-search-task` |
| DuckDuckGo 搜索 | 使用 DuckDuckGo 进行隐私搜索 | `dhf-skills install duckduckgo-search-task` |
| Naver 搜索 | 使用 Naver 进行韩语搜索 | `dhf-skills install naver-search-task` |
| 搜狗微信搜索 | 搜索微信公众号文章 | `dhf-skills install sogou-wechat-search-task` |
| Yahoo 日本搜索 | 使用 Yahoo Japan 进行日语搜索 | `dhf-skills install yahoo-japan-search-task` |

### AI 任务类

| 技能 | 描述 | 命令 |
|------|------|------|
| ChatGPT AI | 使用 ChatGPT 进行 AI 对话 | `dhf-skills install chatgpt-ai-task` |
| Claude AI | 使用 Claude 进行 AI 对话 | `dhf-skills install claude-ai-task` |
| DeepSeek AI | 使用 DeepSeek 进行 AI 对话 | `dhf-skills install deepseek-ai-task` |
| Gemini AI | 使用 Google Gemini 进行 AI 对话 | `dhf-skills install gemini-ai-task` |
| Kimi AI | 使用 Moonshot Kimi 进行 AI 对话 | `dhf-skills install kimi-ai-task` |
| 通义千问 AI | 使用阿里云通义千问进行 AI 对话 | `dhf-skills install qwen-ai-task` |

### 测试类

| 技能 | 描述 | 命令 |
|------|------|------|
| RPA 测试工作流 | 测试 DHF Agent 基础连接和 RPA 操作 | `dhf-skills install test-workflow` |

## 快速开始

### 前置要求

1. **Claude Code** - 安装最新的 Claude Code
2. **DHF Agent** - 安装并运行 DHF Agent ([获取地址](https://dhf.pub))
3. **Node.js** - 版本 >= 18.0.0

### 安装

```bash
# 全局安装
npm install -g @caijikun/dhf-skills

# 查看所有可用技能
dhf-skills list

# 交互式选择安装
dhf-skills install

# 安装指定技能
dhf-skills install qq-mail-task

# 安装多个技能
dhf-skills install qq-mail-task google-search-task chatgpt-ai-task
```

### 从源码安装

```bash
# 克隆仓库
git clone https://github.com/jiangkun6/dhf-skills.git
cd dhf-skills

# 安装依赖
npm install

# 运行安装器
npm run install
```

## 命令说明

### dhf-skills list

查看所有可用技能

```bash
# 查看所有技能
dhf-skills list

# 仅查看已安装技能
dhf-skills list --installed

# 按 JSON 格式输出
dhf-skills list --json
```

### dhf-skills install

安装技能

```bash
# 交互式选择安装
dhf-skills install

# 安装指定技能（支持短名称）
dhf-skills install qq-mail-task
dhf-skills install qq
dhf-skills install chatgpt

# 安装多个技能
dhf-skills install qq-mail-task google-search-task chatgpt-ai-task
```

### dhf-skills uninstall

卸载技能

```bash
# 卸载指定技能
dhf-skills uninstall qq-mail-task

# 卸载多个技能
dhf-skills uninstall qq-mail-task google-search-task

# 交互式选择卸载
dhf-skills uninstall --interactive

# 卸载所有技能
dhf-skills uninstall --all
```

### 快捷名称

支持使用简短名称安装技能：

| 完整名称 | 快捷名称 |
|----------|----------|
| qq-mail-task | qq, qq-mail |
| outlook-mail-task | outlook, outlook-mail |
| mail-163-task | 163, 163-mail |
| google-search-task | google, google-search |
| bing-search-task | bing, bing-search |
| chatgpt-ai-task | chatgpt, chatgpt-ai |
| claude-ai-task | claude, claude-ai |
| deepseek-ai-task | deepseek, deepseek-ai |
| gemini-ai-task | gemini, gemini-ai |
| kimi-ai-task | kimi, kimi-ai |
| qwen-ai-task | qwen, qwen-ai |

## 使用方法

安装技能后，在 Claude Code 中使用对应命令：

```
/dhf-rpa-test-workflow
/dhf-qq-mail-task
/dhf-outlook-mail-task
/google-search-task
/chatgpt-ai-task
```

## 项目结构

```
dhf-skills/
├── skills/              # 所有技能源码
│   ├── dhf-rpa-test-workflow/
│   ├── dhf-rpa-qq-mail-task/
│   ├── google-search-task/
│   ├── chatgpt-ai-task/
│   └── ...
├── scripts/             # 安装和工具脚本
│   ├── install.js
│   ├── uninstall.js
│   ├── list.js
│   └── sync.js
├── bin/                 # CLI 命令工具
│   └── dhf-skills.js
├── skills.json          # 技能配置文件
├── .claude-plugin/      # 插件配置（动态生成）
│   └── marketplace.json
├── package.json
└── README.md
```

## 开发

### 添加新技能

1. 在 `skills/` 目录创建新技能目录
2. 添加 `SKILL.md` 和必要文件
3. 在 `skills.json` 中注册技能

详细指南：[开发文档](DEVELOPMENT.md)

## 故障排除

### 安装失败

确保：
- Node.js 版本 >= 18.0.0
- 有写入 `~/.claude/skills/` 的权限
- Windows 上可能需要管理员权限

### 技能不生效

检查：
- 已运行 `dhf-skills install`
- 已重启 Claude Code
- `~/.claude/skills/` 中存在技能链接

## 相关资源

- **DHF 官网：** https://dhf.pub
- **GitHub：** https://github.com/jiangkun6/dhf-skills
- **帮助中心：** https://dhf.pub/en/help

## 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意：** 使用时请确保遵守相关网站的服务条款。
