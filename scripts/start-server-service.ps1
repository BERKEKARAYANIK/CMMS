param(
  [switch]$Once
)

$ErrorActionPreference = 'Continue'

$projectRoot = Split-Path -Path $PSScriptRoot -Parent
$serverDir = Join-Path $projectRoot 'server'
$logDir = Join-Path $projectRoot 'service-logs'
$logFile = Join-Path $logDir 'server-service.log'

if (!(Test-Path $logDir)) {
  New-Item -Path $logDir -ItemType Directory -Force | Out-Null
}

function Write-ServiceLog {
  param([string]$Message)
  $line = "[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message
  Add-Content -Path $logFile -Value $line
}

Set-Location $serverDir
Write-ServiceLog 'Server service script started'

do {
  Write-ServiceLog 'Running: npm run dev'
  npm run dev *>> $logFile
  $exitCode = $LASTEXITCODE
  Write-ServiceLog ("Server process exited with code {0}" -f $exitCode)

  if ($Once) {
    break
  }

  Start-Sleep -Seconds 3
} while ($true)
