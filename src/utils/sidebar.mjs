/**
 * 自动拆分侧边栏中的中巴双语标题
 */
export function formatSidebarWithPali(items) {
  return items.map(item => {
    if (item.items) {
      item.items = formatSidebarWithPali(item.items);
    }

    const match = item.label.match(/^(.*?)\s*\(([^)]+)\)$/);
    if (match) {
      item.label = match[1].trim();
      item.badge = {
        text: match[2].trim(),
        variant: 'default'
      };
    }
    return item;
  });
}