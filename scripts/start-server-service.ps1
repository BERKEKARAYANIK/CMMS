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

$envFile = Join-Path $serverDir '.env'
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) {
      return
    }

    $separatorIndex = $line.IndexOf('=')
    if ($separatorIndex -lt 1) {
      return
    }

    $key = $line.Substring(0, $separatorIndex).Trim()
    $value = $line.Substring($separatorIndex + 1).Trim()
    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    [Environment]::SetEnvironmentVariable($key, $value, 'Process')
  }
}

if (-not $env:DATABASE_URL) {
  [Environment]::SetEnvironmentVariable('DATABASE_URL', 'file:./prisma/cmms_local.db', 'Process')
}

[Environment]::SetEnvironmentVariable('PRISMA_CLIENT_ENGINE_TYPE', 'library', 'Process')

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
