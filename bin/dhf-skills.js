#!/usr/bin/env node
/**
 * DHF Skills CLI 命令行工具
 *
 * 使用方法:
 *   dhf-skills list              - 查看所有可用技能
 *   dhf-skills list --installed  - 查看已安装技能
 *   dhf-skills install           - 交互式选择安装
 *   dhf-skills install <skill>   - 安装指定技能
 *   dhf-skills uninstall <skill> - 卸载指定技能
 */

import path from 'path';
import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptsDir = path.join(__dirname, '..', 'scripts');

// 解析命令行参数
const args = process.argv.slice(2);
const command = args[0];
const commandArgs = args.slice(1);

async function main() {
  try {
    switch (command) {
      case 'list':
      case 'ls': {
        const module = await import(pathToFileURL(path.join(scriptsDir, 'list.js')));
        module.default(commandArgs);
        break;
      }

      case 'install':
      case 'add': {
        const module = await import(pathToFileURL(path.join(scriptsDir, 'install.js')));
        await module.default(commandArgs);
        break;
      }

      case 'uninstall':
      case 'remove':
      case 'rm': {
        const module = await import(pathToFileURL(path.join(scriptsDir, 'uninstall.js')));
        await module.default(commandArgs);
        break;
      }

      case 'sync': {
        const module = await import(pathToFileURL(path.join(scriptsDir, 'sync.js')));
        await module.default(commandArgs);
        break;
      }

      case '--help':
      case '-h':
      case 'help':
      case undefined:
        showHelp();
        break;

      default:
        console.error(`\n❌ 未知命令: ${command}\n`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ 执行失败:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║           DHF Skills CLI - 命令行工具                        ║
╚══════════════════════════════════════════════════════════════╝

使用方法:

  dhf-skills <command> [options]

命令:

  list, ls              查看所有可用技能
    --installed         仅显示已安装的技能

  install, add          安装技能
    <skill-name>        安装指定技能 (可多个)
    --interactive, -i   交互式选择安装

  uninstall, remove, rm 卸载技能
    <skill-name>        卸载指定技能 (可多个)
    --all, -a           卸载所有技能

  sync                  同步已安装技能

  help, -h, --help      显示帮助信息

示例:

  # 查看所有技能
  dhf-skills list

  # 查看已安装技能
  dhf-skills list --installed

  # 交互式安装
  dhf-skills install

  # 安装单个技能
  dhf-skills install qq-mail-task

  # 安装多个技能
  dhf-skills install qq-mail-task google-search-task

  # 卸载技能
  dhf-skills uninstall qq-mail-task

可用技能 ID:

  邮件类:
    qq-mail-task           QQ 邮件发送
    outlook-mail-task      Outlook 邮件发送
    mail-163-task          163 邮件发送

  搜索类:
    google-search-task     Google 搜索
    bing-search-task       Bing 搜索
    duckduckgo-search-task DuckDuckGo 搜索
    naver-search-task      Naver 搜索
    sogou-wechat-search-task 搜狗微信搜索
    yahoo-japan-search-task Yahoo 日本搜索

  AI 任务类:
    chatgpt-ai-task        ChatGPT AI
    claude-ai-task         Claude AI
    deepseek-ai-task       DeepSeek AI
    gemini-ai-task         Gemini AI
    kimi-ai-task           Kimi AI
    qwen-ai-task           通义千问 AI

  测试类:
    test-workflow          RPA 测试工作流

更多信息: https://github.com/jiangkun6/dhf-skills
`);
}

main();
