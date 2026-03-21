import { visit } from 'unist-util-visit';

/**
 * 插件 1：解析行尾的 [P:123] 或 [P:100-101] 标签
 */
export function remarkParagraphRef() {
  return (tree) => {
    visit(tree, 'text', (node) => {
      // 匹配行尾的 [P:1-2] 或 [P:1000-1100]
      const regex = /\[P:([\d-]+)\]$/;
      const match = node.value.match(regex);
      
      if (match) {
        const pNum = match[1]; // 提取方括号内的内容
        let displayHtml = '';
        
        /**
         * 智能换行逻辑：
         * 1. 必须包含连字符 '-'
         * 2. 且内容长度超过 4 个字符（例如 "9-10" 是 4 个字符，不换行；"11-12" 是 5 个字符，换行）
         */
        if (pNum.includes('-') && pNum.length > 4) {
          const parts = pNum.split('-');
          // 渲染为两行，横杠放在第二行开头
          displayHtml = `<span class="p-ref">[${parts[0]}<br>-${parts[1]}]</span>`;
        } else {
          // 纯数字或短范围（如 1-2, 9-10）保持单行显示
          displayHtml = `<span class="p-ref">[${pNum}]</span>`;
        }

        node.type = 'html';
        node.value = node.value.replace(regex, displayHtml);
      }
    });
  };
}

/**
 * 插件 2：将 Obsidian Callouts 映射为 Starlight 警告框 (保持不变)
 */
export function remarkObsidianCallouts() {
  return (tree) => {
    visit(tree, 'blockquote', (node) => {
      if (!node.children || node.children.length === 0) return;
      const firstChild = node.children[0];
      if (firstChild.type !== 'paragraph' || !firstChild.children || firstChild.children.length === 0) return;
      
      const firstTextNode = firstChild.children[0];
      if (firstTextNode.type !== 'text') return;
      
      const match = firstTextNode.value.match(/^\[!(\w+)\](.*?)(?:\n|$)/);
      if (!match) return;
      
      const type = match[1].toLowerCase();
      const title = match[2].trim();
      
      const typeMap = {
        note: 'note', info: 'note',
        tip: 'tip', success: 'tip', important: 'tip',
        warning: 'caution',
        caution: 'danger', danger: 'danger', error: 'danger',
      };
      const starlightType = typeMap[type] || 'note';
      
      firstTextNode.value = firstTextNode.value.substring(match[0].length);
      node.type = 'containerDirective';
      node.name = starlightType;
      
      if (title) {
        node.children.unshift({
          type: 'paragraph',
          data: { directiveLabel: true },
          children:[{ type: 'text', value: title }]
        });
      }
    });
  };
}