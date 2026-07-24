$src = "src\App.jsx"
$dest = "src\data\spots.js"

# Create dir if needed
New-Item -ItemType Directory -Force -Path "src\data" | Out-Null

$lines = Get-Content $src -Encoding UTF8

# ALL_SPOTS starts at line 47 (index 46) with "const ALL_SPOTS = ["
# and ends at line 13736 (index 13735) with "];"
$startIdx = 46
$endIdx   = 13735

$header = "// Alle verlassenen Objekte der Comunitat Valenciana`nexport const ALL_SPOTS = ["
$header | Set-Content $dest -Encoding UTF8

# Write lines between the brackets (skip first "const ALL_SPOTS = [" and last "];")
$lines[($startIdx+1)..($endIdx-1)] | Add-Content $dest -Encoding UTF8

"];`n" | Add-Content $dest -Encoding UTF8

$written = (Get-Content $dest).Count
Write-Host "spots.js written with $written lines."
$size = (Get-Item $dest).Length
Write-Host "File size: $([math]::Round($size/1KB, 1)) KB"
