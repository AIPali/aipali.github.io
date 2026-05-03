#!/usr/bin/env node
/**
 * 🦞 Lobster Helper — AIPali 网站升级与管理助手
 * 
 * 用法:
 *   node tools/lobster-helper.mjs <命令>
 * 
 * 命令:
 *   dev         启动开发服务器
 *   build       构建生产版本 (DEPLOY_ENV=github)
 *   build:domain 构建域名版本 (DEPLOY_ENV=domain)
 *   preview     预览构建结果
 *   check       检查项目依赖与配置健康
 *   upgrade     自动更新依赖 (谨慎使用)
 *   status      查看 Git 状态
 *   deploy      推送到 GitHub 触发自动部署
 *   help        显示帮助信息
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function run(cmd, opts = {}) {
  console.log(`\n🦞 $ ${cmd}`);
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit', ...opts });
  } catch (e) {
    console.error(`\n❌ 命令失败 (exit code ${e.status}): ${cmd}`);
    process.exit(e.status);
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

const commands = {
  dev() {
    console.log('🦞 启动开发服务器...\n');
    run('npx astro dev');
  },

  build() {
    console.log('🦞 构建 GitHub Pages 版本...\n');
    run('set DEPLOY_ENV=github && npx astro build');
    console.log('\n✅ 构建完成！输出目录: dist/\n');
  },

  'build:domain'() {
    console.log('🦞 构建域名版本 (true-dhamma.com)...\n');
    run('set DEPLOY_ENV=domain && npx astro build');
    console.log('\n✅ 构建完成！输出目录: dist/\n');
  },

  preview() {
    console.log('🦞 启动预览服务器...\n');
    run('npx astro preview');
  },

  check() {
    console.log('🦞 检查项目健康状态...\n');

    // 1. 检查 package.json
    const pkg = readJson(resolve(ROOT, 'package.json'));
    console.log(`📦 项目: ${pkg.name}@${pkg.version}`);
    console.log(`   Astro: ${pkg.dependencies?.astro || '?'}`);
    console.log(`   Starlight: ${pkg.dependencies?.['@astrojs/starlight'] || '?'}`);

    // 2. 检查关键文件
    const criticalFiles = [
      'astro.config.mjs',
      'src/config/pwa.mjs',
      'src/styles/custom.css',
      'src/components/PageTitle.astro',
      'src/components/CustomHead.astro',
      'src/components/AlgoliaSearch.astro',
      'src/components/TodayRightView.astro',
      'src/components/scripts/GlobalScripts.astro',
    ];
    let allOk = true;
    for (const f of criticalFiles) {
      const ok = existsSync(resolve(ROOT, f));
      console.log(`   ${ok ? '✅' : '❌'} ${f}`);
      if (!ok) allOk = false;
    }

    // 3. 检查 dist 目录
    const distOk = existsSync(resolve(ROOT, 'dist'));
    console.log(`   ${distOk ? '✅' : '⚠️'} dist/ (${distOk ? '已存在' : '未构建'})`);

    // 4. 检查 node_modules
    const nmOk = existsSync(resolve(ROOT, 'node_modules'));
    console.log(`   ${nmOk ? '✅' : '❌'} node_modules/`);

    // 5. 检查 Git
    try {
      const branch = execSync('git branch --show-current', { cwd: ROOT, encoding: 'utf-8' }).trim();
      const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf-8' }).trim();
      const hasChanges = status.length > 0;
      console.log(`   ✅ Git 分支: ${branch}`);
      console.log(`   ${hasChanges ? '⚠️ 有未提交的变更 (请先 commit)' : '✅ 工作区干净'}`);
    } catch {
      console.log('   ⚠️ Git 不可用或非 Git 仓库');
    }

    console.log(allOk ? '\n✅ 所有关键文件正常' : '\n⚠️ 存在缺失文件');
  },

  upgrade() {
    console.log('🦞 检查依赖更新...\n');
    run('npx npm-check-updates --upgrade 2>NUL || echo "npm-check-updates 未安装，跳过自动升级"', { stdio: 'inherit' });
  },

  status() {
    console.log('🦞 Git 状态:\n');
    run('git status');
    console.log('\n🦞 Git 日志 (最近 5 条):\n');
    run('git log --oneline -5');
  },

  deploy() {
    console.log('🦞 准备部署到 GitHub...\n');

    // 检查是否有未提交变更
    try {
      const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf-8' }).trim();
      if (status.length > 0) {
        console.log('⚠️ 有未提交的变更，自动提交...\n');
        run('git add -A');
        run('git commit -m "🦞 Lobster Helper: auto-update site"');
      }
    } catch {
      console.log('⚠️ Git 不可用，跳过自动提交');
    }

    console.log('🦞 推送到 main 分支 (触发 GitHub Actions)...\n');
    run('git push origin main');
    console.log('\n✅ 推送完成! GitHub Actions 将自动构建和部署。');
    console.log('   检查进度: https://github.com/aipali/aipali.github.io/actions\n');
  },

  help() {
    console.log(`
🦞 Lobster Helper — AIPali 网站管理助手

用法:  node tools/lobster-helper.mjs <命令>

命令:
  dev           启动开发服务器 (http://localhost:4321)
  build         构建 GitHub Pages 版本
  build:domain  构建域名版本 (true-dhamma.com)
  preview       预览构建结果
  check         检查项目依赖与配置健康
  status        查看 Git 状态
  deploy        推送到 GitHub 触发自动部署
  help          显示此帮助信息
`);
  }
};

// Main
const cmd = process.argv[2];
if (!cmd || cmd === 'help' || !commands[cmd]) {
  commands.help();
  if (cmd && !commands[cmd]) {
    console.log(`\n❌ 未知命令: "${cmd}"\n`);
    process.exit(1);
  }
} else {
  commands[cmd]();
}
