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

$files = @(
  "package.json",
  "package-lock.json",
  "server.js",
  "README.md",
  "RELEASE.md",
  "Start StudyFlow Release.bat"
)

foreach ($file in $files) {
  Copy-Item -LiteralPath (Join-Path $root $file) -Destination (Join-Path $stagingDir $file)
}

Copy-Item -LiteralPath (Join-Path $root "dist") -Destination (Join-Path $stagingDir "dist") -Recurse

Compress-Archive -Path (Join-Path $stagingDir "*") -DestinationPath $zipPath -Force

Write-Host ""
Write-Host "Created release bundle:"
Write-Host $zipPath
Write-Host "Package version: $version"
Write-Host ""
Write-Host "Upload this zip file to your GitHub Release."
