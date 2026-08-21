param(
    [switch]$Release,
    [switch]$VBS  # Set when called from VBS (lock already created)
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# ── UI Setup ────────────────────────────────────────────────────────
$form = New-Object System.Windows.Forms.Form
$form.Text = "StudyFlow"
$form.Size = New-Object System.Drawing.Size(380, 180)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.ControlBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(8, 8, 20)
$form.ForeColor = [System.Drawing.Color]::White
$form.TopMost = $true
$form.ShowInTaskbar = $true

$iconPath = Join-Path (Split-Path $PSCommandPath -Parent) "..\public\favicon.svg"
if (Test-Path $iconPath) {
    try { $form.Icon = [System.Drawing.Icon]::ExtractAssociatedIcon($iconPath) } catch {}
}

$title = New-Object System.Windows.Forms.Label
$title.Text = "Starting StudyFlow..."
$title.Font = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$title.ForeColor = [System.Drawing.Color]::FromArgb(255, 255, 255)
$title.Size = New-Object System.Drawing.Size(340, 30)
$title.Location = New-Object System.Drawing.Point(20, 20)
$title.TextAlign = "MiddleLeft"
$form.Controls.Add($title)

$subtitle = New-Object System.Windows.Forms.Label
$subtitle.Text = "Starting server..."
$subtitle.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$subtitle.ForeColor = [System.Drawing.Color]::FromArgb(160, 160, 180)
$subtitle.Size = New-Object System.Drawing.Size(340, 20)
$subtitle.Location = New-Object System.Drawing.Point(20, 55)
$subtitle.TextAlign = "MiddleLeft"
$form.Controls.Add($subtitle)

$progress = New-Object System.Windows.Forms.ProgressBar
$progress.Style = "Marquee"
$progress.Size = New-Object System.Drawing.Size(340, 20)
$progress.Location = New-Object System.Drawing.Point(20, 85)
$progress.ForeColor = [System.Drawing.Color]::FromArgb(46, 230, 216)
$form.Controls.Add($progress)

$status = New-Object System.Windows.Forms.Label
$status.Text = ""
$status.Font = New-Object System.Drawing.Font("Segoe UI", 8)
$status.ForeColor = [System.Drawing.Color]::FromArgb(120, 120, 140)
$status.Size = New-Object System.Drawing.Size(340, 20)
$status.Location = New-Object System.Drawing.Point(20, 115)
$status.TextAlign = "MiddleLeft"
$form.Controls.Add($status)

$form.Add_Shown({ $form.Activate() })
$form.Show()

# ── Helpers ─────────────────────────────────────────────────────────
function Set-Status($text) {
    $subtitle.Text = $text
    $form.Refresh()
}

function Test-Endpoint($url, $timeoutMs = 2000) {
    try {
        $req = [System.Net.HttpWebRequest]::Create($url)
        $req.Timeout = $timeoutMs
        $req.Method = "GET"
        $resp = $req.GetResponse()
        $resp.Close()
        return $true
    } catch {
        return $false
    }
}

function Wait-ForPort($port, $path, $maxWaitSec = 35) {
    $start = Get-Date
    do {
        if (Test-Endpoint "http://localhost:$port$path") { return $true }
        Start-Sleep -Milliseconds 400
        $elapsed = [int]((Get-Date) - $start).TotalSeconds
        $status.Text = "Waiting... ${elapsed}s"
        $form.Refresh()
    } while (((Get-Date) - $start).TotalSeconds -lt $maxWaitSec)
    return $false
}

# ── Main ────────────────────────────────────────────────────────────
try {
    $appDir = Split-Path (Split-Path $PSCommandPath -Parent) -Parent

    $lockDir = Join-Path $appDir ".studyflow-lock"

    if (-not $VBS) {
        # Only manage lock when called independently (not from VBS)
        if (Test-Path $lockDir) {
            Set-Status "StudyFlow is already starting..."
            Start-Sleep 2
            $form.Close()
            exit 0
        }
        New-Item -Path $lockDir -ItemType Directory -Force | Out-Null
    }

    # Kill stale node processes from this project only
    Set-Status "Cleaning up previous sessions..."
    $currentProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -and $_.CommandLine.Contains($appDir)
    }
    if ($currentProcesses) {
        $currentProcesses | ForEach-Object { $_.Kill() }
        Start-Sleep 1
    }

    # Start the dev server
    Set-Status "Starting StudyFlow servers..."
    $cmd = if ($Release) { "npm start" } else { "npm run dev" }
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "cmd"
    $psi.Arguments = "/c $cmd"
    $psi.WorkingDirectory = $appDir
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $proc = [System.Diagnostics.Process]::Start($psi)

    # Wait for API health
    Set-Status "Connecting to API..."
    $apiReady = Wait-ForPort 3001 "/api/health"

    if (-not $apiReady) {
        Set-Status "API failed to start. Opening browser anyway..."
        Start-Sleep 1
    } else {
        Set-Status "API server ready!"
    }

    # Wait for Vite (dev mode only)
    if (-not $Release) {
        Set-Status "Loading frontend..."
        $viteReady = Wait-ForPort 5173 ""
        if ($viteReady) {
            Set-Status "StudyFlow is ready!"
        } else {
            Set-Status "Frontend taking longer than expected..."
        }
    }

    # Cleanup lock (only if we created it)
    if (-not $VBS -and (Test-Path $lockDir)) {
        Remove-Item -Path $lockDir -Force -Recurse -ErrorAction SilentlyContinue
    }

    # Open browser
    $url = if ($Release) { "http://localhost:3001" } else { "http://localhost:5173" }
    try { Start-Process $url } catch {}

    Start-Sleep 1.5
    Set-Status "StudyFlow is running!"
    Start-Sleep 1
} catch {
    $subtitle.Text = "Error starting StudyFlow"
    $subtitle.ForeColor = [System.Drawing.Color]::FromArgb(255, 80, 80)
    $status.Text = $_.Exception.Message
    Start-Sleep 4
} finally {
    $form.Close()
}
