import fs from 'fs/promises';
import path from 'path';

// ================= 配置区域 =================
// 规则文件路径
const RULES_FILE = 'tools/rules.txt'; 
// 目标文件夹路径
const TARGET_DIR = 'src/content/docs'; 
// ============================================
// docker exec -it tipitaka-dev node tools/batch-replace.mjs


/**
 * 解析规则文件
 * 逻辑：仅识别行首为 [[ 且行尾为 ]]，中间包含 ||| 的有效行
 */
async function parseRules(ruleFilePath) {
    const content = await fs.readFile(ruleFilePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    const rules = [];
    
    // 匹配正则说明：
    // ^\[\[        - 以 [[ 开头
    // (.*?)        - 捕获第一个方括号内的内容（非贪婪）
    // \]\]         - 匹配第一个方括号结束
    // \s*\|\|\|\s* - 匹配中间的 |||，允许两边有空格
    // \[\[         - 匹配第二个方括号开始
    // (.*?)        - 捕获第二个方括号内的内容
    // \]\]         - 以 ]] 结尾
    const ruleRegex = /^\[\[(.*?)\]\]\s*\|\|\|\s*\[\[(.*?)\]\]$/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const match = line.match(ruleRegex);
        
        if (match) {
            rules.push({
                search: match[1],
                replace: match[2],
                lineNum: i + 1
            });
        }
    }
    return rules;
}

/**
 * 读取单个文件并进行精确替换
 */
async function processFile(filePath, rules) {
    try {
        let content = await fs.readFile(filePath, 'utf-8');
        let originalContent = content;
        let fileStats = {
            totalReplacements: 0,
            matchedRulesCount: 0
        };

        for (const rule of rules) {
            if (content.includes(rule.search)) {
                const parts = content.split(rule.search);
                const count = parts.length - 1;
                fileStats.totalReplacements += count;
                fileStats.matchedRulesCount++;
                content = parts.join(rule.replace);
            }
        }

        // 如果内容有变化则写入
        if (content !== originalContent) {
            await fs.writeFile(filePath, content, 'utf-8');
            console.log(`✅ [已更新] ${filePath}`);
            console.log(`   └─ 命中规则数: ${fileStats.matchedRulesCount} | 替换总处数: ${fileStats.totalReplacements}`);
            return fileStats.totalReplacements;
        }
        return 0;
    } catch (err) {
        console.error(`❌ [错误] 无法处理文件 ${filePath}:`, err.message);
        return 0;
    }
}

/**
 * 递归遍历目录
 */
async function processDirectory(dir, rules, stats) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            await processDirectory(fullPath, rules, stats);
        } else if (entry.isFile() && (fullPath.endsWith('.md') || fullPath.endsWith('.mdx') || fullPath.endsWith('.txt'))) {
            const count = await processFile(fullPath, rules);
            if (count > 0) {
                stats.updatedFiles++;
                stats.totalChanges += count;
            }
        }
    }
}

async function main() {
    const startTime = Date.now();
    const globalStats = {
        updatedFiles: 0,
        totalChanges: 0
    };

    try {
        console.log(`--------------------------------------------------`);
        console.log(`🚀 开始执行批量替换`);
        console.log(`📂 目标目录: ${TARGET_DIR}`);
        console.log(`📄 规则文件: ${RULES_FILE}`);
        
        const rules = await parseRules(RULES_FILE);
        if (rules.length === 0) {
            console.warn('⚠️  未在规则文件中找到有效的替换规则（格式需为 [[A]] ||| [[B]]）');
            return;
        }
        console.log(`✨ 成功加载 ${rules.length} 条有效规则 (已忽略注释和标题)`);
        console.log(`--------------------------------------------------`);

        await processDirectory(TARGET_DIR, rules, globalStats);
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`--------------------------------------------------`);
        console.log(`🎉 任务完成！`);
        console.log(`📊 总计: 更新了 ${globalStats.updatedFiles} 个文件，共替换 ${globalStats.totalChanges} 处`);
        console.log(`⏱️  耗时: ${duration} 秒`);
        console.log(`--------------------------------------------------`);
    } catch (err) {
        console.error('❌ 程序执行过程中发生崩溃:', err);
    }
}

main();