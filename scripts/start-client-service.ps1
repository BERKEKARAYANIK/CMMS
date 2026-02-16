param(
  [switch]$Once
)

$ErrorActionPreference = 'Continue'

$projectRoot = Split-Path -Path $PSScriptRoot -Parent
$clientDir = Join-Path $projectRoot 'client'
$logDir = Join-Path $projectRoot 'service-logs'
$logFile = Join-Path $logDir 'client-service.log'

if (!(Test-Path $logDir)) {
  New-Item -Path $logDir -ItemType Directory -Force | Out-Null
}

function Write-ServiceLog {
  param([string]$Message)
  $line = "[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message
  Add-Content -Path $logFile -Value $line
}

Set-Location $clientDir
Write-ServiceLog 'Client service script started'

do {
  Write-ServiceLog 'Running: npm run dev -- --host 0.0.0.0 --port 5174'
  npm run dev -- --host 0.0.0.0 --port 5174 *>> $logFile
  $exitCode = $LASTEXITCODE
  Write-ServiceLog ("Client process exited with code {0}" -f $exitCode)

  if ($Once) {
    break
  }

  Start-Sleep -Seconds 3
} while ($true)
