$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Path $PSScriptRoot -Parent
$serverScript = Join-Path $PSScriptRoot 'start-server-service.ps1'
$clientScript = Join-Path $PSScriptRoot 'start-client-service.ps1'

$serverTaskName = 'CMMS-Server'
$clientTaskName = 'CMMS-Client'

$currentUser = "{0}\{1}" -f $env:USERDOMAIN, $env:USERNAME
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -RestartCount 999 `
  -RestartInterval (New-TimeSpan -Minutes 1) `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Days 3650)
$principal = New-ScheduledTaskPrincipal -UserId $currentUser -LogonType Interactive -RunLevel Limited

$serverAction = New-ScheduledTaskAction `
  -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$serverScript`""
$clientAction = New-ScheduledTaskAction `
  -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$clientScript`""

$serverTrigger = New-ScheduledTaskTrigger -AtLogOn -User $currentUser
$clientTrigger = New-ScheduledTaskTrigger -AtLogOn -User $currentUser

Register-ScheduledTask `
  -TaskName $serverTaskName `
  -Action $serverAction `
  -Trigger $serverTrigger `
  -Settings $settings `
  -Principal $principal `
  -Description 'CMMS backend auto-start task' `
  -Force | Out-Null

Register-ScheduledTask `
  -TaskName $clientTaskName `
  -Action $clientAction `
  -Trigger $clientTrigger `
  -Settings $settings `
  -Principal $principal `
  -Description 'CMMS frontend auto-start task' `
  -Force | Out-Null

# Stop previous listeners if still running on these ports.
$portPids = @()
foreach ($port in 4001, 5174) {
  $rows = netstat -ano | Select-String -Pattern (":{0}\\s+.*LISTENING\\s+(\\d+)$" -f $port)
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
Write-Output 'Durum kontrol: Get-ScheduledTask -TaskName CMMS-* | Select-Object TaskName,State'
