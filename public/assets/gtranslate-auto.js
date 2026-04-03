(function () {
  // 1. 检测是否为繁体中文环境
  var lang = (navigator.language || navigator.userLanguage).toLowerCase();
  var isTraditionalChinese = lang.includes('tw') || lang.includes('hk') || lang.includes('mo') || lang.includes('hant');

  if (isTraditionalChinese) {
    // 2. 动态创建一个隐藏的 div 给 GTranslate 挂载（必须有这个容器，插件才能运行）
    var gtDiv = document.createElement('div');
    gtDiv.className = 'gtranslate_wrapper';
    gtDiv.style.display = 'none'; // 彻底隐藏 UI
    document.body.appendChild(gtDiv);

    // 3. 配置 GTranslate 
    window.gtranslateSettings = {
      "default_language": "zh-CN",
      "detect_browser_language": true, // 核心：开启自动检测
      "languages": ["zh-CN", "zh-TW"],
      "wrapper_selector": ".gtranslate_wrapper"
    };

    // 4. 异步加载 GTranslate 核心脚本
    var script = document.createElement('script');
    script.src = "https://cdn.gtranslate.net/widgets/latest/lc.js";
    script.defer = true;
    document.head.appendChild(script);
    
    console.log("GTranslate: 繁体环境已激活自动翻译");
  } else {
    // 如果不是繁体环境，脚本到此结束，不会加载额外的 GTranslate JS，节省资源
    console.log("GTranslate: 非繁体环境，跳过加载");
  }
})();