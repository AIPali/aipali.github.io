$astroFile = "astro.config.mjs"
$raw = [System.IO.File]::ReadAllText((Join-Path (Get-Location) $astroFile))

# 在 starlight({ 里面加 customCss 后面插入配色
$newConfig = @'
      customCss:['./src/styles/custom.css'],
      // 暖金色主题 — 庄重佛法质感
      colors: {
        // 亮色模式
        accent: '#b8860b',      // DarkGoldenrod — 主色调（按钮/链接/高亮）
        accentLow: '#fdf4d1',   // 浅金底色
        accentHigh: '#8b6508',  // 深金（hover 态）
        // 灰阶微调，让暖色更协调
        gray100: '#f7f2e6',     // 极浅米
        gray1000: '#1a1610',    // 极深棕黑
      },
'@

$raw = $raw.Replace("customCss:['./src/styles/custom.css'],", $newConfig)

[System.IO.File]::WriteAllText((Join-Path (Get-Location) $astroFile), $raw, [System.Text.Encoding]::UTF8)
Write-Host "Updated astro.config.mjs with warm gold theme"
