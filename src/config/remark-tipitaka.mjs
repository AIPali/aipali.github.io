import { visit } from 'unist-util-visit';
/**
 * 插件 1：解析行尾的 [P:123] 或 [P:100-101] 标签
 */
export function remarkParagraphRef() {
  return (tree) => {
    visit(tree, 'text', (node) => {
      const regex = /\[P:([\d-]+)\]$/;
      const match = node.value.match(regex);
      
      if (match) {
        const pNum = match[1]; // 可能是 "82" 也可能是 "580-583"
        let displayHtml = '';
        
        // 核心修改：不再使用 startNum 截断，直接将完整的 pNum 放入 data 属性
        if (pNum.includes('-') && pNum.length > 4) {
          const parts = pNum.split('-');
          // data-pali-para 现在存储的是 "580-583"
          displayHtml = `<span class="p-ref" data-pali-para="${pNum}">[${parts[0]}<br>-${parts[1]}]</span>`;
        } else {
          displayHtml = `<span class="p-ref" data-pali-para="${pNum}">[${pNum}]</span>`;
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