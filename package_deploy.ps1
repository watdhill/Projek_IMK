$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$output = Join-Path $root 'deploy-package'

if (Test-Path $output) { Remove-Item $output -Recurse -Force }
New-Item -ItemType Directory -Force $output | Out-Null

Copy-Item (Join-Path $root 'backend\server.js') $output
Copy-Item (Join-Path $root 'backend\db.js') $output
Copy-Item (Join-Path $root 'backend\package.json') $output
Copy-Item (Join-Path $root 'backend\package-lock.json') $output
Copy-Item (Join-Path $root 'backend\routes') (Join-Path $output 'routes') -Recurse
Copy-Item (Join-Path $root 'backend\uploads') (Join-Path $output 'uploads') -Recurse
Copy-Item (Join-Path $root 'backend\private-uploads') (Join-Path $output 'private-uploads') -Recurse
Copy-Item (Join-Path $root 'frontend\dist') (Join-Path $output 'frontend-dist') -Recurse

Write-Output "Deployment package dibuat: $output"
Write-Output "Jangan menyalin backend/.env ke repository atau package publik."
