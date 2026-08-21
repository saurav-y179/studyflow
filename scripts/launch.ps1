param(
    [switch]$Release,
    [switch]$VBS  # Set when called from VBS (lock already created)
)

$appDir = Split-Path (Split-Path $PSCommandPath -Parent) -Parent
$lockDir = Join-Path $appDir ".studyflow-lock"
$port = if ($Release) { 3001 } else { 5173 }
$url = "http://localhost:$port"

function Test-Endpoint($urlToCheck, $timeoutMs = 700) {
    try {
        $req = [System.Net.HttpWebRequest]::Create($urlToCheck)
        $req.Timeout = $timeoutMs
        $req.ReadWriteTimeout = $timeoutMs
        $req.Method = "GET"
        $resp = $req.GetResponse()
        $resp.Close()
        return $true
    } catch {
        # A server that responds at all (404 etc.) is up; only connection
        # failures land here.
        return $false
    }
}

# ── Fast path: already running? Open the browser immediately. ──────
# Done before any UI so re-launches are near-instant.
if (Test-Endpoint "$url/") {
    Start-Process $url
    exit 0
}

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# ── UI Setup (only reached when actually starting servers) ─────────
$form = New-Object System.Windows.Forms.Form
$form.Text = "StudyFlow"
$form.Size = New-Object System.Drawing.Size(380, 140)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.ControlBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(8, 8, 20)
$form.ForeColor = [System.Drawing.Color]::White
$form.TopMost = $true
$form.ShowInTaskbar = $true

$title = New-Object System.Windows.Forms.Label
$title.Text = "Starting StudyFlow..."
$title.Font = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$title.ForeColor = [System.Drawing.Color]::White
$title.Size = New-Object System.Drawing.Size(340, 30)
$title.Location = New-Object System.Drawing.Point(20, 20)
$title.TextAlign = "MiddleLeft"
$form.Controls.Add($title)

$subtitle = New-Object System.Windows.Forms.Label
$subtitle.Text = "Starting servers..."
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

$form.Add_Shown({ $form.Activate() })
$form.Show()

function Set-Status($text) {
    $subtitle.Text = $text
    $form.Refresh()
}

try {
    if (-not $VBS) {
        # Only manage lock when called independently (not from VBS)
        if (Test-Path $lockDir) {
            Set-Status "StudyFlow is already starting..."
            Start-Sleep 2
            exit 0
        }
        New-Item -Path $lockDir -ItemType Directory -Force | Out-Null
    }

    # Start both servers via dev.js directly (no npm/cmd wrapper overhead).
    Set-Status "Starting StudyFlow servers..."
    $nodeArgs = if ($Release) { @("server.js") } else { @("dev.js") }
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "node"
    $psi.Arguments = ($nodeArgs -join " ")
    $psi.WorkingDirectory = $appDir
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    [System.Diagnostics.Process]::Start($psi) | Out-Null

    # Wait for the frontend to answer — it is the last thing to boot and
    # the app handles a still-warming API gracefully.
    Set-Status "Waiting for StudyFlow to come online..."
    $maxWaitSec = 45
    $start = Get-Date
    $ready = $false
    while (((Get-Date) - $start).TotalSeconds -lt $maxWaitSec) {
        if (Test-Endpoint "$url/") { $ready = $true; break }
        Start-Sleep -Milliseconds 120
    }

    if ($ready) {
        Set-Status "StudyFlow is ready!"
    } else {
        Set-Status "Taking longer than expected... opening anyway."
    }

    Start-Process $url

    if (-not $VBS -and (Test-Path $lockDir)) {
        Remove-Item -Path $lockDir -Force -Recurse -ErrorAction SilentlyContinue
    }

    Start-Sleep -Milliseconds 800
} catch {
    Set-Status "Error starting StudyFlow: $($_.Exception.Message)"
    Start-Sleep 4
} finally {
    $form.Close()
}
