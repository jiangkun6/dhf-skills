#!/usr/bin/env node
/**
 * DHF RPA Skills 卸载脚本
 *
 * 支持命令行参数和交互式卸载
 */

import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载 skills.json 配置
function loadSkillsConfig() {
  const configPath = path.join(__dirname, '..', 'skills.json');
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return Object.values(config.skills);
  } catch (error) {
    return [];
  }
}

// 短名称映射（与 install.js 保持一致）
const SHORT_NAME_MAP = {
  'test': 'dhf-rpa-test-workflow',
  'test-workflow': 'dhf-rpa-test-workflow',
  'qq': 'dhf-rpa-qq-mail-task',
  'qq-mail': 'dhf-rpa-qq-mail-task',
  'qq-mail-task': 'dhf-rpa-qq-mail-task',
  'outlook': 'dhf-rpa-outlook-mail-task',
  'outlook-mail': 'dhf-rpa-outlook-mail-task',
  'outlook-mail-task': 'dhf-rpa-outlook-mail-task',
  '163': 'dhf-rpa-163mail-task',
  '163-mail': 'dhf-rpa-163mail-task',
  'mail-163': 'dhf-rpa-163mail-task',
  'mail-163-task': 'dhf-rpa-163mail-task',
  'google': 'google-search-task',
  'google-search': 'google-search-task',
  'google-search-task': 'google-search-task',
  'bing': 'bing-search-task',
  'bing-search': 'bing-search-task',
  'bing-search-task': 'bing-search-task',
  'duckduckgo': 'duckduckgo-search-task',
  'ddg': 'duckduckgo-search-task',
  'naver': 'naver-search-task',
  'naver-search': 'naver-search-task',
  'naver-search-task': 'naver-search-task',
  'sogou': 'sogou-wechat-search-task',
  'sogou-wechat': 'sogou-wechat-search-task',
  'sogou-wechat-search': 'sogou-wechat-search-task',
  'wechat': 'sogou-wechat-search-task',
  'yahoo-japan': 'yahoo-japan-search-task',
  'yahoo-jp': 'yahoo-japan-search-task',
  'chatgpt': 'chatgpt-ai-task',
  'chatgpt-ai': 'chatgpt-ai-task',
  'chatgpt-ai-task': 'chatgpt-ai-task',
  'claude': 'claude-ai-task',
  'claude-ai': 'claude-ai-task',
  'claude-ai-task': 'claude-ai-task',
  'deepseek': 'deepseek-ai-task',
  'deepseek-ai': 'deepseek-ai-task',
  'deepseek-ai-task': 'deepseek-ai-task',
  'gemini': 'gemini-ai-task',
  'gemini-ai': 'gemini-ai-task',
  'gemini-ai-task': 'gemini-ai-task',
  'kimi': 'kimi-ai-task',
  'kimi-ai': 'kimi-ai-task',
  'kimi-ai-task': 'kimi-ai-task',
  'qwen': 'qwen-ai-task',
  'qwen-ai': 'qwen-ai-task',
  'qwen-ai-task': 'qwen-ai-task'
};

function resolveSkillName(name) {
  const SKILLS_REGISTRY = loadSkillsConfig();
  if (SKILLS_REGISTRY.find(s => s.id === name)) {
    return name;
  }
  return SHORT_NAME_MAP[name] || name;
}

class SkillUninstaller {
  constructor(args = []) {
    this.args = args;
    this.repoRoot = path.join(__dirname, '..');
    this.claudeSkillsDir = this.getClaudeSkillsDir();
    this.pluginDir = path.join(this.repoRoot, '.claude-plugin');
    this.marketplaceFile = path.join(this.pluginDir, 'marketplace.json');
    this.SKILLS_REGISTRY = loadSkillsConfig();
  }

  getClaudeSkillsDir() {
    const home = process.env.HOME || process.env.USERPROFILE;
    return path.join(home, '.claude', 'skills');
  }

  getInstalledSkills() {
    if (!fs.existsSync(this.marketplaceFile)) {
      return [];
    }
    try {
      const marketplace = JSON.parse(fs.readFileSync(this.marketplaceFile, 'utf-8'));
      const plugin = marketplace.plugins?.find(p => p.name === 'dhf-rpa-skills');
      if (!plugin?.skills) return [];
      return plugin.skills.map(s => path.basename(s));
    } catch (error) {
      return [];
    }
  }

  showWelcome() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║          DHF RPA Skills - 卸载技能                          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
  }

  async selectSkills() {
    const installed = this.getInstalledSkills();

    if (installed.length === 0) {
      console.log('❌ 没有已安装的技能。');
      return [];
    }

    const skills = this.SKILLS_REGISTRY.filter(s => installed.includes(s.id));

    const choices = skills.map(skill => ({
      name: `🗑️  ${skill.name} - ${skill.description}`,
      value: skill.id,
      short: skill.name
    }));

    const answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message: '选择要卸载的技能 (空格选择，回车确认):',
        choices: choices,
        pageSize: 15
      }
    ]);

    return answers.selected;
  }

  async confirmUninstallation(selectedSkills) {
    const skills = this.SKILLS_REGISTRY.filter(s => selectedSkills.includes(s.id));

    console.log('\n📋 即将卸载以下技能:\n');
    skills.forEach(skill => {
      console.log(`  • ${skill.name}`);
    });
    console.log(`\n  总计: ${skills.length} 个技能\n`);

    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: '确认卸载这些技能？',
        default: false
      }
    ]);

    return answers.confirm;
  }

  uninstallSkill(skillId) {
    const targetPath = path.join(this.claudeSkillsDir, skillId);

    if (!fs.existsSync(targetPath)) {
      console.warn(`  ⚠️  ${skillId} 不存在，跳过`);
      return;
    }

    try {
      const stats = fs.lstatSync(targetPath);
      if (stats.isSymbolicLink()) {
        fs.unlinkSync(targetPath);
      } else {
        fs.rmSync(targetPath, { recursive: true, force: true });
      }
      console.log(`  ✓ ${skillId}`);
    } catch (error) {
      console.warn(`  ⚠️  卸载 ${skillId} 失败: ${error.message}`);
    }
  }

  updateMarketplace(remainingSkills) {
    if (remainingSkills.length === 0) {
      if (fs.existsSync(this.marketplaceFile)) {
        fs.unlinkSync(this.marketplaceFile);
      }
      return;
    }

    const marketplace = {
      name: 'dhf-rpa-skills',
      owner: {
        name: 'DHF RPA Community',
        email: 'community@dhf.pub'
      },
      metadata: {
        description: 'DHF Agent RPA 自动化技能包',
        version: '1.0.0'
      },
      plugins: [
        {
          name: 'dhf-rpa-skills',
          description: 'DHF RPA 自动化技能',
          source: './',
          strict: true,
          skills: remainingSkills.map(id => `./skills/${id}`)
        }
      ]
    };

    fs.writeFileSync(this.marketplaceFile, JSON.stringify(marketplace, null, 2));
  }

  parseArgs() {
    const skillNames = [];
    const options = {
      all: false,
      interactive: false
    };

    for (const arg of this.args) {
      if (arg === '--all' || arg === '-a') {
        options.all = true;
      } else if (arg === '--interactive' || arg === '-i') {
        options.interactive = true;
      } else if (!arg.startsWith('--')) {
        skillNames.push(arg);
      }
    }

    return { skillNames, options };
  }

  async uninstall() {
    try {
      const { skillNames, options } = this.parseArgs();
      const installed = this.getInstalledSkills();

      if (installed.length === 0) {
        console.log('\n❌ 没有已安装的技能\n');
        return;
      }

      let selectedSkills = [];

      // 卸载所有
      if (options.all) {
        selectedSkills = installed;
      }
      // 命令行指定技能
      else if (skillNames.length > 0 && !options.interactive) {
        const resolvedIds = skillNames.map(resolveSkillName);
        const validIds = resolvedIds.filter(id => installed.includes(id));
        const invalidNames = skillNames.filter((_, i) => !installed.includes(resolvedIds[i]));

        if (invalidNames.length > 0) {
          console.log('\n⚠️  以下技能未安装，已跳过:');
          invalidNames.forEach(name => console.log(`   - ${name}`));
        }

        if (validIds.length === 0) {
          console.log('\n❌ 没有有效的技能可卸载\n');
          return;
        }

        selectedSkills = validIds;
      }
      // 交互式选择
      else {
        this.showWelcome();
        selectedSkills = await this.selectSkills();
      }

      if (selectedSkills.length === 0) {
        return;
      }

      // 确认卸载（仅交互模式）
      if (options.interactive || skillNames.length === 0) {
        const confirmed = await this.confirmUninstallation(selectedSkills);
        if (!confirmed) {
          console.log('\n❌ 卸载已取消。\n');
          return;
        }
      } else {
        console.log('\n📋 即将卸载以下技能:\n');
        selectedSkills.forEach(id => {
          const skill = this.SKILLS_REGISTRY.find(s => s.id === id);
          console.log(`  • ${skill?.name || id}`);
        });
        console.log();

        const confirmed = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: '确认卸载？',
            default: false
          }
        ]);

        if (!confirmed.confirm) {
          console.log('\n❌ 卸载已取消\n');
          return;
        }
      }

      console.log('\n🔧 开始卸载...\n');
      for (const skillId of selectedSkills) {
        this.uninstallSkill(skillId);
      }

      const remaining = installed.filter(id => !selectedSkills.includes(id));
      this.updateMarketplace(remaining);

      console.log('\n✅ 卸载完成！');
      console.log('\n📝 提示:');
      console.log('  1. 请重新启动 Claude Code');
      console.log('  2. 运行 "dhf-skills list" 查看剩余技能\n');

    } catch (error) {
      console.error('\n❌ 卸载失败:', error.message);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }
}

// 导出默认函数供 CLI 调用
export default async function(args) {
  const uninstaller = new SkillUninstaller(args);
  await uninstaller.uninstall();
}

// 直接运行时
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const uninstaller = new SkillUninstaller(process.argv.slice(2));
  uninstaller.uninstall();
}
