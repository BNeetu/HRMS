# Copy HRMS to C:\HRMS so npm install works (avoids OneDrive sync issues)
# Run this from PowerShell, then open C:\HRMS in VS Code and run: cd frontend; npm install; npm start

$dest = "C:\HRMS"
$src = $PSScriptRoot

Write-Host "Copying HRMS from $src to $dest ..." -ForegroundColor Cyan
if (Test-Path $dest) {
    Remove-Item $dest -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Copy-Item -Path "$src\*" -Destination $dest -Recurse -Force -Exclude "node_modules", ".angular", "venv", "__pycache__", "*.pyc", "hrms.db"
Write-Host "Done. Open folder in VS Code: $dest" -ForegroundColor Green
Write-Host "Then in terminal: cd frontend; npm install; npm start" -ForegroundColor Yellow
