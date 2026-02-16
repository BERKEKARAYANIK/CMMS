$ErrorActionPreference = 'SilentlyContinue'

$taskNames = @('CMMS-Server', 'CMMS-Client')

foreach ($taskName in $taskNames) {
  Stop-ScheduledTask -TaskName $taskName | Out-Null
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false | Out-Null
}

# Any leftover service script powershell processes can be stopped manually if needed.
Write-Output 'CMMS servis gorevleri kaldirildi.'
