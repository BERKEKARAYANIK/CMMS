param(
  [switch]$Once
)

$ErrorActionPreference = 'Continue'

$projectRoot = Split-Path -Path $PSScriptRoot -Parent
$serverDir = Join-Path $projectRoot 'server'
$runtimeNodeDir = Join-Path $projectRoot 'runtime\nodejs'
$bundledNpmCmd = Join-Path $runtimeNodeDir 'npm.cmd'
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

function Resolve-NpmCommand {
  if (Test-Path $bundledNpmCmd) {
    $env:Path = "$runtimeNodeDir;$env:Path"
    return $bundledNpmCmd
  }

  $npmCmd = Get-Command 'npm.cmd' -ErrorAction SilentlyContinue
  if ($npmCmd) {
    return $npmCmd.Source
  }

  $npm = Get-Command 'npm' -ErrorAction SilentlyContinue
  if ($npm) {
    return $npm.Source
  }

  return $null
}

$npmCommand = Resolve-NpmCommand
if (-not $npmCommand) {
  Write-ServiceLog 'npm bulunamadi. Offline runtime eksik olabilir.'
  throw 'npm command bulunamadi.'
}

Set-Location $serverDir
Write-ServiceLog "Server service script started (npm: $npmCommand)"

do {
  Write-ServiceLog "Running: $npmCommand run dev"
  & $npmCommand run dev *>> $logFile
  $exitCode = $LASTEXITCODE
  Write-ServiceLog ("Server process exited with code {0}" -f $exitCode)

  if ($Once) {
    break
  }

  Start-Sleep -Seconds 3
} while ($true)
