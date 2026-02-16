param(
  [switch]$NoAdminPrompt,
  [switch]$SkipNpmInstall
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Path $PSScriptRoot -Parent
$serverDir = Join-Path $projectRoot 'server'
$clientDir = Join-Path $projectRoot 'client'
$serverEnvPath = Join-Path $serverDir '.env'
$logDir = Join-Path $projectRoot 'service-logs'

function Write-Info {
  param([string]$Message)
  Write-Host "[CMMS] $Message" -ForegroundColor Cyan
}

function Write-WarnLine {
  param([string]$Message)
  Write-Host "[CMMS][Uyari] $Message" -ForegroundColor Yellow
}

function Test-IsAdmin {
  $principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Ensure-Tool {
  param([string]$Name)
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  return $null -ne $cmd
}

function Refresh-ProcessPath {
  $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $user = [Environment]::GetEnvironmentVariable('Path', 'User')
  $env:Path = "$machine;$user"
}

function Install-NodeIfMissing {
  if ((Ensure-Tool 'node') -and (Ensure-Tool 'npm')) {
    return
  }

  Write-WarnLine 'Node.js/NPM bulunamadi. Otomatik kurulum deneniyor (winget)...'
  if (-not (Ensure-Tool 'winget')) {
    throw 'Node.js bulunamadi ve winget yok. Lutfen Node.js LTS kurup tekrar calistirin.'
  }

  & winget install --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
  Refresh-ProcessPath

  if (-not ((Ensure-Tool 'node') -and (Ensure-Tool 'npm'))) {
    throw 'Node.js kurulumu tamamlanamadi. Lutfen manuel kurup tekrar deneyin.'
  }
}

function Get-PreferredIPv4 {
  $defaultRoute = Get-NetRoute -AddressFamily IPv4 -DestinationPrefix '0.0.0.0/0' -ErrorAction SilentlyContinue |
    Where-Object { $_.NextHop -and $_.NextHop -ne '0.0.0.0' } |
    Sort-Object RouteMetric, InterfaceMetric |
    Select-Object -First 1

  if ($defaultRoute) {
    $routeIp = Get-NetIPAddress -AddressFamily IPv4 -InterfaceIndex $defaultRoute.InterfaceIndex -ErrorAction SilentlyContinue |
      Where-Object {
        $_.IPAddress -notlike '169.254*' -and
        $_.IPAddress -ne '127.0.0.1'
      } |
      Select-Object -First 1 -ExpandProperty IPAddress

    if ($routeIp) {
      return $routeIp
    }
  }

  $privateIp = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -match '^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)' -and
      $_.IPAddress -notlike '169.254*'
    } |
    Sort-Object InterfaceMetric |
    Select-Object -First 1 -ExpandProperty IPAddress

  if ($privateIp) {
    return $privateIp
  }

  return '127.0.0.1'
}

function New-RandomSecret {
  $chars = (48..57) + (65..90) + (97..122)
  -join (1..64 | ForEach-Object { [char]($chars | Get-Random) })
}

function Get-EnvLineValue {
  param(
    [string[]]$Lines,
    [string]$Key
  )

  $pattern = '^\s*' + [Regex]::Escape($Key) + '\s*=\s*(.*)\s*$'
  foreach ($line in $Lines) {
    if ($line -match $pattern) {
      $raw = $Matches[1].Trim()
      if (
        ($raw.StartsWith('"') -and $raw.EndsWith('"')) -or
        ($raw.StartsWith("'") -and $raw.EndsWith("'"))
      ) {
        return $raw.Substring(1, $raw.Length - 2)
      }
      return $raw
    }
  }
  return $null
}

function Set-EnvLine {
  param(
    [string[]]$Lines,
    [string]$Key,
    [string]$Value
  )

  $line = "$Key=`"$Value`""
  $pattern = '^\s*' + [Regex]::Escape($Key) + '\s*='
  $updated = $false

  for ($i = 0; $i -lt $Lines.Count; $i += 1) {
    if ($Lines[$i] -match $pattern) {
      $Lines[$i] = $line
      $updated = $true
      break
    }
  }

  if (-not $updated) {
    $Lines += $line
  }

  return $Lines
}

function Ensure-ServerEnv {
  param([string]$LocalIp)

  $lines = @()
  if (Test-Path $serverEnvPath) {
    $lines = Get-Content -Path $serverEnvPath
  }

  if (-not $lines) {
    $lines = @()
  }

  $jwtSecret = Get-EnvLineValue -Lines $lines -Key 'JWT_SECRET'
  if (-not $jwtSecret) {
    $jwtSecret = New-RandomSecret
  }

  $lines = Set-EnvLine -Lines $lines -Key 'DATABASE_URL' -Value 'file:./cmms_local.db'
  $lines = Set-EnvLine -Lines $lines -Key 'JWT_SECRET' -Value $jwtSecret
  $lines = Set-EnvLine -Lines $lines -Key 'PORT' -Value '4001'
  $lines = Set-EnvLine -Lines $lines -Key 'NODE_ENV' -Value 'development'
  $lines = Set-EnvLine -Lines $lines -Key 'CLIENT_ORIGIN' -Value ("http://{0}:5174" -f $LocalIp)

  Set-Content -Path $serverEnvPath -Value $lines -Encoding UTF8
}

function Invoke-CmdChecked {
  param(
    [string]$WorkingDir,
    [string]$Command
  )

  Push-Location $WorkingDir
  try {
    Write-Info "$WorkingDir > $Command"
    & cmd.exe /c $Command
    if ($LASTEXITCODE -ne 0) {
      throw "Komut hatasi: $Command (exit code $LASTEXITCODE)"
    }
  } finally {
    Pop-Location
  }
}

function Ensure-FirewallRule {
  param(
    [string]$Name,
    [int]$Port
  )

  $rule = Get-NetFirewallRule -DisplayName $Name -ErrorAction SilentlyContinue
  if ($null -eq $rule) {
    New-NetFirewallRule `
      -DisplayName $Name `
      -Direction Inbound `
      -Action Allow `
      -Protocol TCP `
      -LocalPort $Port `
      -Profile Any | Out-Null
  } else {
    Set-NetFirewallRule -DisplayName $Name -Enabled True -Action Allow -Profile Any | Out-Null
  }
}

function Set-ActiveNetworkPrivate {
  $profiles = Get-NetConnectionProfile -ErrorAction SilentlyContinue |
    Where-Object { $_.IPv4Connectivity -ne 'Disconnected' -and $_.NetworkCategory -eq 'Public' }

  foreach ($profile in $profiles) {
    try {
      Set-NetConnectionProfile -InterfaceIndex $profile.InterfaceIndex -NetworkCategory Private -ErrorAction Stop
      Write-Info "Ag profili Private yapildi: $($profile.Name)"
    } catch {
      Write-WarnLine "Ag profili degistirilemedi: $($profile.Name)"
    }
  }
}

function Wait-HttpReady {
  param(
    [string]$Url,
    [int]$TimeoutSeconds = 90
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 4
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return $true
      }
    } catch {
      Start-Sleep -Seconds 2
      continue
    }
  }

  return $false
}

function Stop-CmmsTasksIfRunning {
  $taskNames = @('CMMS-Server', 'CMMS-Client')
  foreach ($taskName in $taskNames) {
    try {
      $task = Get-ScheduledTask -TaskName $taskName -ErrorAction Stop
      if ($task.State -eq 'Running') {
        Stop-ScheduledTask -TaskName $taskName -ErrorAction Stop
      }
    } catch {
      # task may not exist yet
    }
  }
}

if (-not (Test-IsAdmin) -and -not $NoAdminPrompt) {
  Write-Info 'Yonetici izinleri gerekiyor. UAC penceresi aciliyor...'
  $args = "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -NoAdminPrompt"
  Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList $args | Out-Null
  exit 190
}

$isAdmin = Test-IsAdmin

Write-Info 'CMMS tek tik kurulum/baslatma basladi'

Install-NodeIfMissing

$localIp = Get-PreferredIPv4
Write-Info "Tespit edilen IP: $localIp"

if (!(Test-Path $logDir)) {
  New-Item -Path $logDir -ItemType Directory -Force | Out-Null
}

Ensure-ServerEnv -LocalIp $localIp
Write-Info 'server/.env guncellendi'

if (-not $SkipNpmInstall) {
  Invoke-CmdChecked -WorkingDir $serverDir -Command 'npm install'
  Invoke-CmdChecked -WorkingDir $clientDir -Command 'npm install'
} else {
  Write-WarnLine 'npm install adimi atlandi (-SkipNpmInstall)'
}

Stop-CmmsTasksIfRunning
Invoke-CmdChecked -WorkingDir $serverDir -Command 'npx prisma db push --skip-generate'

if ($isAdmin) {
  Write-Info 'Windows guvenlik/firewall ayarlari yapiliyor'
  Ensure-FirewallRule -Name 'CMMS Backend 4001' -Port 4001
  Ensure-FirewallRule -Name 'CMMS Frontend 5174' -Port 5174
  Set-ActiveNetworkPrivate
} else {
  Write-WarnLine 'Admin izni yok: firewall ve ag profili adimlari atlandi'
}

Write-Info 'Servis gorevleri kuruluyor'
& (Join-Path $PSScriptRoot 'install-services.ps1')

Write-Info 'Servislerin ayaga kalkmasi bekleniyor'
$apiOk = Wait-HttpReady -Url 'http://127.0.0.1:4001/api/health' -TimeoutSeconds 120
$webOk = Wait-HttpReady -Url 'http://127.0.0.1:5174' -TimeoutSeconds 120

if (-not $apiOk -or -not $webOk) {
  throw 'CMMS servisleri zamaninda ayaga kalkmadi. service-logs klasorunu kontrol edin.'
}

Write-Host ''
Write-Host '================ CMMS HAZIR ================' -ForegroundColor Green
Write-Host ("Web (bu bilgisayar): http://localhost:5174")
Write-Host ("Web (ag):            http://{0}:5174" -f $localIp)
Write-Host ("API Health:          http://{0}:4001/api/health" -f $localIp)
Write-Host ("Log klasoru:         {0}" -f $logDir)
Write-Host '============================================' -ForegroundColor Green
