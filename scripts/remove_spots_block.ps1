$src = "src\App.jsx"
$lines = Get-Content $src -Encoding UTF8
Write-Host "Total lines before: $($lines.Count)"

# Line 48 = index 47: "// ECHTE, historisch..."
# Line 49 = index 48: "const ALL_SPOTS = ["
# Line 13737 = index 13736: "];"
# We want to remove lines 48-13737 (index 47-13736, inclusive)
$removeStart = 47   # "// ECHTE, historisch..." comment
$removeEnd   = 13736 # "];"

$newLines = $lines[0..($removeStart-1)] + $lines[($removeEnd+1)..($lines.Count-1)]
$newLines | Set-Content $src -Encoding UTF8

Write-Host "Total lines after: $($newLines.Count)"
$size = (Get-Item $src).Length
Write-Host "New file size: $([math]::Round($size/1KB, 1)) KB"
