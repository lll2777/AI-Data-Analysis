param(
  [int]$FrontendPort = 3000,
  [int]$BackendPort = 8000,
  [switch]$SkipDocker,
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$NodeDir = "D:\codex_project\tools\node-v24.16.0-win-x64"
$NpmCmd = Join-Path $NodeDir "npm.cmd"
$PythonExe = "D:\conda_envs\pytorch\python.exe"
$NpmCache = "D:\codex_project\cache\npm"
$LogDir = Join-Path $Root "logs"

function Write-Status {
  param([string]$Message)
  Write-Host "[local] $Message"
}

function Test-Url {
  param([string]$Url)
  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 4
    return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
  } catch {
    return $false
  }
}

if (-not (Test-Path $NpmCmd)) {
  throw "Node.js runtime was not found at $NpmCmd"
}

if (-not (Test-Path $PythonExe)) {
  throw "Python runtime was not found at $PythonExe"
}

New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
New-Item -ItemType Directory -Path $NpmCache -Force | Out-Null

$env:PATH = "$NodeDir;$env:PATH"
$env:NPM_CONFIG_CACHE = $NpmCache

if (-not $SkipDocker) {
  $docker = Get-Command docker -ErrorAction SilentlyContinue
  if ($docker) {
    Write-Status "starting postgres and redis with Docker Compose"
    Push-Location $Root
    try {
      docker compose up -d postgres redis
    } finally {
      Pop-Location
    }
  } else {
    Write-Status "docker command not found; skipping local postgres/redis startup"
  }
}

$BackendUrl = "http://127.0.0.1:$BackendPort/api/v1/health"
$FrontendUrl = "http://127.0.0.1:$FrontendPort"

if (Test-Url $BackendUrl) {
  Write-Status "backend already responds at $BackendUrl"
} else {
  Write-Status "starting backend on http://127.0.0.1:$BackendPort"
  Start-Process -FilePath $PythonExe `
    -ArgumentList @("-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "$BackendPort", "--reload") `
    -WorkingDirectory (Join-Path $Root "apps\api") `
    -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $LogDir "backend.log") `
    -RedirectStandardError (Join-Path $LogDir "backend.err.log")
}

if (Test-Url $FrontendUrl) {
  Write-Status "frontend already responds at $FrontendUrl"
} else {
  Write-Status "starting frontend on $FrontendUrl"
  Start-Process -FilePath $NpmCmd `
    -ArgumentList @("--cache", $NpmCache, "run", "dev", "--", "--hostname", "127.0.0.1", "--port", "$FrontendPort") `
    -WorkingDirectory $Root `
    -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $LogDir "frontend.log") `
    -RedirectStandardError (Join-Path $LogDir "frontend.err.log")
}

Write-Status "waiting for services"
Start-Sleep -Seconds 5

& (Join-Path $PSScriptRoot "check-local.ps1") -FrontendPort $FrontendPort -BackendPort $BackendPort -SupabaseAsWarning

if (-not $NoBrowser) {
  Start-Process $FrontendUrl
}
