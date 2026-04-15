#!/usr/bin/env node
/**
 * DHF RPA Skills 列表查看脚本
 *
 * 支持命令行参数
 */

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

class SkillLister {
  constructor(args = []) {
    this.args = args;
    this.repoRoot = path.join(__dirname, '..');
    this.skillsDir = path.join(this.repoRoot, 'skills');
    this.pluginDir = path.join(this.repoRoot, '.claude-plugin');
    this.marketplaceFile = path.join(this.pluginDir, 'marketplace.json');
    this.SKILLS_REGISTRY = loadSkillsConfig();
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

  getAvailableSkills() {
    return this.SKILLS_REGISTRY.filter(skill => {
      const skillPath = path.join(this.skillsDir, skill.id);
      return fs.existsSync(skillPath);
    });
  }

  parseArgs() {
    const options = {
      installedOnly: false,
      json: false,
      category: null
    };

    for (const arg of this.args) {
      if (arg === '--installed' || arg === '-i') {
        options.installedOnly = true;
      } else if (arg === '--json') {
        options.json = true;
      } else if (arg.startsWith('--category=')) {
        options.category = arg.split('=')[1];
      }
    }

    return options;
  }

  displayJson() {
    const installed = this.getInstalledSkills();
    const available = this.getAvailableSkills();

    const data = {
      available: available.length,
      installed: installed.length,
      skills: available.map(skill => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        version: skill.version,
        command: skill.command,
        installed: installed.includes(skill.id)
      }))
    };

    console.log(JSON.stringify(data, null, 2));
  }

  displayTable() {
    const options = this.parseArgs();
    const installed = this.getInstalledSkills();
    let available = this.getAvailableSkills();

    // 筛选已安装
    if (options.installedOnly) {
      available = available.filter(skill => installed.includes(skill.id));
    }

    // 筛选分类
    if (options.category) {
      available = available.filter(skill => skill.category === options.category);
    }

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║          DHF RPA Skills - 技能列表                         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    console.log(`📦 可用技能: ${this.getAvailableSkills().length} | ✅ 已安装: ${installed.length}\n`);

    if (available.length === 0) {
      console.log('   没有符合条件的技能\n');
      return;
    }

    const categories = {};
    available.forEach(skill => {
      if (!categories[skill.category]) {
        categories[skill.category] = [];
      }
      categories[skill.category].push(skill);
    });

    for (const [category, skills] of Object.entries(categories)) {
      console.log(`\n📂 ${category}`);
      console.log('─'.repeat(70));

      skills.forEach(skill => {
        const isInstalled = installed.includes(skill.id);
        const status = isInstalled ? '✅ 已安装' : '⬜ 未安装';
        const command = skill.command || skill.id;

        console.log(`\n  ${skill.name}`);
        console.log(`    描述: ${skill.description}`);
        console.log(`    命令: /${command}`);
        console.log(`    状态: ${status}`);
        console.log(`    版本: ${skill.version}`);
      });
    }

    console.log('\n' + '─'.repeat(70));
    console.log('\n💡 使用方法:');
    console.log('  dhf-skills list              - 查看所有技能');
    console.log('  dhf-skills list --installed  - 查看已安装技能');
    console.log('  dhf-skills install           - 交互式安装');
    console.log('  dhf-skills install <skill>   - 安装指定技能');
    console.log('  dhf-skills uninstall <skill> - 卸载技能\n');

    // 显示快捷安装提示
    if (!options.installedOnly) {
      console.log('🚀 快捷安装示例:');
      const examples = [
        { name: 'QQ 邮件', id: 'qq-mail-task' },
        { name: 'Google 搜索', id: 'google-search-task' },
        { name: 'ChatGPT', id: 'chatgpt-ai-task' }
      ];
      examples.forEach(ex => {
        const isInstalled = installed.includes(this.SKILLS_REGISTRY.find(s => s.id === ex.id)?.id);
        if (!isInstalled) {
          console.log(`  dhf-skills install ${ex.id}`);
        }
      });
      console.log();
    }
  }

  list() {
    const options = this.parseArgs();

    if (options.json) {
      this.displayJson();
    } else {
      this.displayTable();
    }
  }
}

// 导出默认函数供 CLI 调用
export default function(args) {
  const lister = new SkillLister(args);
  lister.list();
}

// 直接运行时
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const lister = new SkillLister(process.argv.slice(2));
  lister.list();
}
