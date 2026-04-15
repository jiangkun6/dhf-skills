#!/usr/bin/env node
/**
 * DHF RPA Skills 安装脚本
 *
 * 支持命令行参数和交互式安装
 */

import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载 skills.json 配置
function loadSkillsConfig() {
  const configPath = path.join(__dirname, '..', 'skills.json');
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return Object.values(config.skills);
  } catch (error) {
    console.error('无法加载 skills.json:', error.message);
    return [];
  }
}

// 短名称映射
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

// 解析短名称为完整 ID
function resolveSkillName(name) {
  // 如果是完整 ID，直接返回
  const SKILLS_REGISTRY = loadSkillsConfig();
  if (SKILLS_REGISTRY.find(s => s.id === name)) {
    return name;
  }
  // 尝试短名称映射
  return SHORT_NAME_MAP[name] || name;
}

class SkillInstaller {
  constructor(args = []) {
    this.args = args;
    this.repoRoot = path.join(__dirname, '..');
    this.skillsDir = path.join(this.repoRoot, 'skills');
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

  skillExists(skillId) {
    const skillPath = path.join(this.skillsDir, skillId);
    return fs.existsSync(skillPath);
  }

  showWelcome() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║          DHF RPA Skills - 安装器                            ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
  }

  categorizeSkills() {
    const categories = {};
    this.SKILLS_REGISTRY.forEach(skill => {
      if (!categories[skill.category]) {
        categories[skill.category] = [];
      }
      categories[skill.category].push(skill);
    });
    return categories;
  }

  async selectSkills() {
    const categories = this.categorizeSkills();
    const installed = this.getInstalledSkills();

    const choices = [];
    for (const [category, skills] of Object.entries(categories)) {
      choices.push(new inquirer.Separator(`\n📦 ${category}`));
      skills.forEach(skill => {
        const isInstalled = installed.includes(skill.id);
        const exists = this.skillExists(skill.id);
        if (!exists) return;

        const status = isInstalled ? '✓' : ' ';
        choices.push({
          name: `${status} ${skill.name.padEnd(20)} - ${skill.description} [${skill.size}]`,
          value: skill.id,
          checked: isInstalled,
          short: skill.name
        });
      });
    }

    const answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message: '选择要安装的技能 (空格选择/取消，回车确认):',
        choices: choices,
        pageSize: 20
      }
    ]);

    return answers.selected;
  }

  async confirmInstallation(selectedSkills) {
    const skills = this.SKILLS_REGISTRY.filter(s => selectedSkills.includes(s.id));
    const totalSize = skills.reduce((sum, s) => {
      const size = parseFloat(s.size) || 0;
      return sum + size;
    }, 0);

    console.log('\n📋 即将安装以下技能:\n');
    skills.forEach(skill => {
      console.log(`  • ${skill.name} (${skill.size})`);
    });
    console.log(`\n  总计: ${skills.length} 个技能，约 ${totalSize.toFixed(1)}MB\n`);

    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: '确认安装这些技能？',
        default: true
      }
    ]);

    return answers.confirm;
  }

  async installSkill(skillId) {
    const skillPath = path.join(this.skillsDir, skillId);
    const targetPath = path.join(this.claudeSkillsDir, skillId);

    if (!fs.existsSync(skillPath)) {
      throw new Error(`技能目录不存在: ${skillPath}`);
    }

    if (fs.existsSync(targetPath)) {
      try {
        const stats = fs.lstatSync(targetPath);
        if (stats.isSymbolicLink()) {
          fs.unlinkSync(targetPath);
        } else {
          fs.rmSync(targetPath, { recursive: true, force: true });
        }
      } catch (error) {
        // 忽略错误
      }
    }

    try {
      fs.symlinkSync(skillPath, targetPath, 'junction');
    } catch (error) {
      if (process.platform === 'win32') {
        console.warn(`  ⚠️  无法创建符号链接，正在复制文件...`);
        this.copyDirectory(skillPath, targetPath);
      } else {
        throw error;
      }
    }

    const packageJsonPath = path.join(skillPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        process.chdir(skillPath);
        execSync('npm install', { stdio: 'pipe' });
      } catch (error) {
        console.warn(`  ⚠️  依赖安装失败: ${error.message}`);
      }
    }

    console.log(`  ✓ ${skillId}`);
  }

  copyDirectory(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  updateMarketplace(installedSkills) {
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
          skills: installedSkills.map(id => `./skills/${id}`)
        }
      ]
    };

    if (!fs.existsSync(this.pluginDir)) {
      fs.mkdirSync(this.pluginDir, { recursive: true });
    }

    fs.writeFileSync(this.marketplaceFile, JSON.stringify(marketplace, null, 2));
  }

  // 解析命令行参数
  parseArgs() {
    const skillNames = [];
    const options = {
      interactive: false,
      check: false
    };

    for (const arg of this.args) {
      if (arg === '--interactive' || arg === '-i') {
        options.interactive = true;
      } else if (arg === '--check') {
        options.check = true;
      } else if (!arg.startsWith('--')) {
        skillNames.push(arg);
      }
    }

    return { skillNames, options };
  }

  // 检查模式（npm postinstall 使用）
  async checkMode() {
    const installed = this.getInstalledSkills();
    if (installed.length > 0) {
      console.log(`\n✅ 已安装 ${installed.length} 个技能`);
      console.log('   使用 "dhf-skills list" 查看详情\n');
    } else {
      console.log('\n💡 还没有安装任何技能');
      console.log('   使用 "dhf-skills install" 开始安装\n');
    }
  }

  async install() {
    try {
      const { skillNames, options } = this.parseArgs();

      // 检查模式
      if (options.check) {
        await this.checkMode();
        return;
      }

      // 命令行指定技能
      if (skillNames.length > 0 && !options.interactive) {
        this.showWelcome();

        const resolvedIds = skillNames.map(resolveSkillName);
        const validIds = resolvedIds.filter(id => this.skillExists(id));
        const invalidNames = skillNames.filter((_, i) => !this.skillExists(resolvedIds[i]));

        if (invalidNames.length > 0) {
          console.log('\n⚠️  以下技能不存在，已跳过:');
          invalidNames.forEach(name => console.log(`   - ${name}`));
        }

        if (validIds.length === 0) {
          console.log('\n❌ 没有有效的技能可安装');
          console.log('   使用 "dhf-skills list" 查看可用技能\n');
          return;
        }

        console.log('\n📋 即将安装以下技能:\n');
        validIds.forEach(id => {
          const skill = this.SKILLS_REGISTRY.find(s => s.id === id);
          console.log(`  • ${skill?.name || id} (${skill?.size || 'N/A'})`);
        });
        console.log();

        const confirmed = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: '确认安装？',
            default: true
          }
        ]);

        if (!confirmed.confirm) {
          console.log('\n❌ 安装已取消\n');
          return;
        }

        if (!fs.existsSync(this.claudeSkillsDir)) {
          fs.mkdirSync(this.claudeSkillsDir, { recursive: true });
        }

        const originalDir = process.cwd();
        console.log('\n🔧 开始安装...\n');
        for (const skillId of validIds) {
          await this.installSkill(skillId);
        }
        process.chdir(originalDir);

        // 更新已安装列表
        const installed = this.getInstalledSkills();
        const newInstalled = [...new Set([...installed, ...validIds])];
        this.updateMarketplace(newInstalled);

        console.log('\n✅ 安装完成！');
        console.log('\n📝 提示:');
        console.log('  1. 请重新启动 Claude Code');
        console.log('  2. 使用 /xxx 命令调用技能');
        console.log('  3. 运行 "dhf-skills list" 查看已安装技能\n');

        return;
      }

      // 交互式安装
      this.showWelcome();
      const selectedSkills = await this.selectSkills();
      if (selectedSkills.length === 0) {
        console.log('\n❌ 未选择任何技能，安装取消。');
        return;
      }

      const confirmed = await this.confirmInstallation(selectedSkills);
      if (!confirmed) {
        console.log('\n❌ 安装已取消。');
        return;
      }

      if (!fs.existsSync(this.claudeSkillsDir)) {
        fs.mkdirSync(this.claudeSkillsDir, { recursive: true });
      }

      const originalDir = process.cwd();
      console.log('\n🔧 开始安装...\n');
      for (const skillId of selectedSkills) {
        await this.installSkill(skillId);
      }
      process.chdir(originalDir);

      this.updateMarketplace(selectedSkills);

      console.log('\n✅ 安装完成！');
      console.log('\n📝 提示:');
      console.log('  1. 请重新启动 Claude Code');
      console.log('  2. 使用 /xxx 命令调用技能');
      console.log('  3. 运行 "dhf-skills list" 查看已安装技能\n');

    } catch (error) {
      console.error('\n❌ 安装失败:', error.message);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }
}

// 导出默认函数供 CLI 调用
export default async function(args) {
  const installer = new SkillInstaller(args);
  await installer.install();
}

// 直接运行时
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const installer = new SkillInstaller(process.argv.slice(2));
  installer.install();
}
