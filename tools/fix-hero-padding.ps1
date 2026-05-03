$file = "src\content\docs\index.mdx"
$raw = [System.IO.File]::ReadAllText((Join-Path (Get-Location) $file))

# 1. Hero section: reduce top padding from 5rem to 1.5rem, min-height from 70vh to 55vh
$raw = $raw -replace '(?m)^      padding: 5rem 1\.5rem 3rem;', '      padding: 1.5rem 1.5rem 3rem;'
$raw = $raw -replace '(?m)^    min-height: 70vh;', '    min-height: 55vh;'

# 2. Reduce hero-badge margin-bottom
$raw = $raw -replace '(?m)^      display: inline-block; padding: 0\.35rem 1\.2rem; margin-bottom: 1\.5rem;', '      display: inline-block; padding: 0.25rem 1rem; margin-bottom: 1rem;'

# 3. Reduce hero-subtitle margin-top
$raw = $raw -replace '(?m)^      margin-top: 1\.5rem;', '      margin-top: 0.8rem;'

# 4. Reduce hero-actions margin-top
$raw = $raw -replace '(?m)^    \.hero-actions \{ margin-top: 2\.5rem;', '    .hero-actions { margin-top: 1.5rem;'

[System.IO.File]::WriteAllText((Join-Path (Get-Location) $file), $raw, [System.Text.Encoding]::UTF8)
Write-Host "Fixed hero padding in index.mdx"
