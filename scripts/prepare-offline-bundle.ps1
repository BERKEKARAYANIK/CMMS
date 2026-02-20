param(
  [switch]$SkipNodeRuntime,
  [switch]$SkipNodeModules
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Path $PSScriptRoot -Parent
$offlineDir = Join-Path $projectRoot 'offline'
$serverNodeModules = Join-Path $projectRoot 'server\node_modules'
$clientNodeModules = Join-Path $projectRoot 'client\node_modules'
$offlineNodeZip = Join-Path $offlineDir 'node-runtime.zip'
$offlineServerZip = Join-Path $offlineDir 'server-node_modules.zip'
$offlineClientZip = Join-Path $offlineDir 'client-node_modules.zip'

function Write-Info {
  param([string]$Message)
  Write-Host "[CMMS] $Message" -ForegroundColor Cyan
}

function New-ZipFromPath {
  param(
    [string]$SourcePath,
    [string]$DestinationZip,
    [switch]$IncludeContentsOnly
  )

  if (!(Test-Path $SourcePath)) {
    throw "Kaynak bulunamadi: $SourcePath"
  }

  if (Test-Path $DestinationZip) {
    Remove-Item -Path $DestinationZip -Force
  }

  if ($IncludeContentsOnly) {
    Compress-Archive -Path (Join-Path $SourcePath '*') -DestinationPath $DestinationZip -Force
  } else {
    Compress-Archive -Path $SourcePath -DestinationPath $DestinationZip -Force
  }
}

if (!(Test-Path $offlineDir)) {
  New-Item -Path $offlineDir -ItemType Directory -Force | Out-Null
}

if (-not $SkipNodeRuntime) {
  $nodeCommand = Get-Command 'node' -ErrorAction SilentlyContinue
  if (-not $nodeCommand) {
    throw 'Node.js bulunamadi. Once bu bilgisayara Node.js kurulu olmali.'
  }

  $nodeInstallDir = Split-Path -Path $nodeCommand.Source -Parent
  Write-Info "Node runtime kaynak klasoru: $nodeInstallDir"
  New-ZipFromPath -SourcePath $nodeInstallDir -DestinationZip $offlineNodeZip -IncludeContentsOnly
  Write-Info "Olusturuldu: $offlineNodeZip"
}

if (-not $SkipNodeModules) {
  if (!(Test-Path $serverNodeModules) -or !(Test-Path $clientNodeModules)) {
    throw 'server/client node_modules bulunamadi. Once proje bagimliliklarini kurun (npm install).'
  }

  Write-Info 'server/node_modules zipleniyor...'
  New-ZipFromPath -SourcePath $serverNodeModules -DestinationZip $offlineServerZip
  Write-Info "Olusturuldu: $offlineServerZip"

  Write-Info 'client/node_modules zipleniyor...'
  New-ZipFromPath -SourcePath $clientNodeModules -DestinationZip $offlineClientZip
  Write-Info "Olusturuldu: $offlineClientZip"
}

Write-Host ''
Write-Host '========== OFFLINE BUNDLE HAZIR ==========' -ForegroundColor Green
if (Test-Path $offlineNodeZip) {
  Write-Host ("- {0}" -f $offlineNodeZip)
}
if (Test-Path $offlineServerZip) {
  Write-Host ("- {0}" -f $offlineServerZip)
}
if (Test-Path $offlineClientZip) {
  Write-Host ("- {0}" -f $offlineClientZip)
}
Write-Host 'Bu dosyalarla yeni PC kurulumunda internet gerekmez.' -ForegroundColor Green
