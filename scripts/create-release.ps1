$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$packageJson = Get-Content -Raw -LiteralPath (Join-Path $root "package.json") | ConvertFrom-Json
$version = $packageJson.version
$releaseDir = Join-Path $root "release"
$stagingDir = Join-Path $releaseDir "studyflow"
$zipPath = Join-Path $releaseDir "studyflow.zip"
$resolvedReleaseParent = Split-Path -Parent $releaseDir

if (-not (Test-Path -LiteralPath (Join-Path $root "dist"))) {
  throw "dist/ was not found. Run npm run build before creating a release."
}

if ((Resolve-Path $resolvedReleaseParent).Path -ne $root.Path) {
  throw "Refusing to clean a release directory outside the project root."
}

if (Test-Path -LiteralPath $releaseDir) {
  Remove-Item -LiteralPath $releaseDir -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $stagingDir | Out-Null

# Copy package files first so we can run npm ci in the staging folder
Copy-Item -LiteralPath (Join-Path $root "package.json") -Destination (Join-Path $stagingDir "package.json")
if (Test-Path -LiteralPath (Join-Path $root "package-lock.json")) {
  Copy-Item -LiteralPath (Join-Path $root "package-lock.json") -Destination (Join-Path $stagingDir "package-lock.json")
}

# Install production dependencies inside the staging folder (omit dev deps to reduce size)
Write-Host "Installing production dependencies inside staging folder..."
Push-Location $stagingDir
# Use npm ci for reproducible install; --omit=dev keeps devDependencies out
npm ci --omit=dev
Pop-Location

$files = @(
  "server.js",
  "README.md",
  "RELEASE.md",
  "Start StudyFlow Release.bat",
  "open-studyflow.vbs"
)

foreach ($file in $files) {
  if (Test-Path -LiteralPath (Join-Path $root $file)) {
    Copy-Item -LiteralPath (Join-Path $root $file) -Destination (Join-Path $stagingDir $file)
  }
}

# Copy built frontend
Copy-Item -LiteralPath (Join-Path $root "dist") -Destination (Join-Path $stagingDir "dist") -Recurse

# Create the zip
Compress-Archive -Path (Join-Path $stagingDir "*") -DestinationPath $zipPath -Force

Write-Host ""
Write-Host "Created release bundle:"
Write-Host $zipPath
Write-Host "Package version: $version"
Write-Host ""
Write-Host "Upload this zip file to your GitHub Release."
