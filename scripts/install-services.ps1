$ErrorActionPreference = 'Stop'

function Test-IsAdmin {
  $principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-IsAdmin)) {
  throw 'install-services.ps1 yonetici olarak calistirilmalidir.'
}

$serverScript = Join-Path $PSScriptRoot 'start-server-service.ps1'
$clientScript = Join-Path $PSScriptRoot 'start-client-service.ps1'

$serverTaskName = 'CMMS-Server'
$clientTaskName = 'CMMS-Client'

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -RestartCount 999 `
  -RestartInterval (New-TimeSpan -Minutes 1) `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Days 3650)

$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
$startupTrigger = New-ScheduledTaskTrigger -AtStartup

$serverAction = New-ScheduledTaskAction `
  -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$serverScript`""

$clientAction = New-ScheduledTaskAction `
  -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$clientScript`""

Register-ScheduledTask `
  -TaskName $serverTaskName `
  -Action $serverAction `
  -Trigger $startupTrigger `
  -Settings $settings `
  -Principal $principal `
  -Description 'CMMS backend auto-start task (PC startup)' `
  -Force | Out-Null

Register-ScheduledTask `
  -TaskName $clientTaskName `
  -Action $clientAction `
  -Trigger $startupTrigger `
  -Settings $settings `
  -Principal $principal `
  -Description 'CMMS frontend auto-start task (PC startup)' `
  -Force | Out-Null

# Stop previous listeners if still running on these ports.
$portPids = @()
foreach ($port in 4001, 5174) {
  $rows = netstat -ano | Select-String -Pattern (":{0}\s+.*LISTENING\s+(\d+)$" -f $port)
  foreach ($row in $rows) {
    if ($row.Matches.Count -gt 0) {
      $pid = [int]$row.Matches[0].Groups[1].Value
      if ($pid -gt 0 -and -not $portPids.Contains($pid)) {
        $portPids += $pid
      }
    }
  }
}

foreach ($pid in $portPids) {
  try {
    $process = Get-Process -Id $pid -ErrorAction Stop
    if ($process.ProcessName -in @('node', 'powershell', 'pwsh', 'cmd')) {
      Stop-Process -Id $pid -Force -ErrorAction Stop
    }
  } catch {
    # ignore process stop failures
  }
}

Start-ScheduledTask -TaskName $serverTaskName
Start-ScheduledTask -TaskName $clientTaskName

Write-Output 'CMMS servis gorevleri kuruldu ve baslatildi.'
Write-Output "Task adlari: $serverTaskName, $clientTaskName"
Write-Output 'Durum kontrol: Get-ScheduledTask -TaskName CMMS-* | Select-Object TaskName,State,LastRunTime'
