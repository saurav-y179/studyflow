# Start StudyFlow with progress window
$scriptPath = Split-Path $PSCommandPath -Parent
$launcher = Join-Path $scriptPath "scripts\launch.ps1"
& $launcher @args
