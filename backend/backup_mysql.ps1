param(
  [string]$OutputDirectory = "..\backups"
)

$ErrorActionPreference = 'Stop'

foreach ($name in @('DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER')) {
  if (-not (Get-Item "Env:$name" -ErrorAction SilentlyContinue)) {
    throw "$name belum diatur di environment."
  }
}

New-Item -ItemType Directory -Force $OutputDirectory | Out-Null
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$outputFile = Join-Path $OutputDirectory "$($env:DB_NAME)-$timestamp.sql"

mysqldump `
  --host=$env:DB_HOST `
  --port=$env:DB_PORT `
  --user=$env:DB_USER `
  --single-transaction `
  --routines `
  --triggers `
  $env:DB_NAME | Set-Content -Path $outputFile -Encoding UTF8

if ($LASTEXITCODE -ne 0) {
  Remove-Item $outputFile -Force -ErrorAction SilentlyContinue
  throw "mysqldump gagal."
}

Write-Output "Backup berhasil dibuat: $outputFile"
