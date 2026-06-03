param(
  [int]$FrontendPort = 3000,
  [int]$BackendPort = 8000,
  [switch]$SupabaseAsWarning
)

$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$EnvFiles = @(
  (Join-Path $Root ".env"),
  (Join-Path $Root "apps\api\.env"),
  (Join-Path $Root "apps\web\.env.local")
)

function Write-Check {
  param(
    [string]$Name,
    [bool]$Ok,
    [string]$Detail
  )

  if ($Ok) {
    Write-Host "[ok]   $Name - $Detail"
  } else {
    Write-Host "[fail] $Name - $Detail"
  }
}

function Test-Url {
  param(
    [string]$Url,
    [hashtable]$Headers = @{}
  )

  try {
    $response = Invoke-WebRequest -Uri $Url -Headers $Headers -UseBasicParsing -TimeoutSec 10
    return @{
      Ok = $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
      Detail = "HTTP $($response.StatusCode)"
    }
  } catch {
    return @{
      Ok = $false
      Detail = $_.Exception.Message
    }
  }
}

function Read-LocalEnv {
  $values = @{}

  foreach ($file in $EnvFiles) {
    if (-not (Test-Path $file)) {
      continue
    }

    foreach ($rawLine in Get-Content -Path $file -Encoding UTF8) {
      $line = $rawLine.Trim().Trim([char]0xFEFF)
      if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) {
        continue
      }

      $parts = $line.Split("=", 2)
      $key = $parts[0].Trim().Trim([char]0xFEFF)
      $value = $parts[1].Trim().Trim('"').Trim("'")
      $values[$key] = $value
    }
  }

  return $values
}

$hadFailure = $false

$BackendUrl = "http://127.0.0.1:$BackendPort/api/v1/health"
$backend = Test-Url -Url $BackendUrl
Write-Check -Name "Backend" -Ok $backend.Ok -Detail "$BackendUrl ($($backend.Detail))"
$hadFailure = $hadFailure -or (-not $backend.Ok)

$FrontendUrl = "http://127.0.0.1:$FrontendPort"
$frontend = Test-Url -Url $FrontendUrl
Write-Check -Name "Frontend" -Ok $frontend.Ok -Detail "$FrontendUrl ($($frontend.Detail))"
$hadFailure = $hadFailure -or (-not $frontend.Ok)

$envValues = Read-LocalEnv
$supabaseUrl = $envValues["SUPABASE_URL"]
if (-not $supabaseUrl) {
  $supabaseUrl = $envValues["NEXT_PUBLIC_SUPABASE_URL"]
}

$supabaseKey = $envValues["SUPABASE_PUBLISHABLE_KEY"]
if (-not $supabaseKey) {
  $supabaseKey = $envValues["SUPABASE_ANON_KEY"]
}
if (-not $supabaseKey) {
  $supabaseKey = $envValues["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
}

if (-not $supabaseUrl -or -not $supabaseKey) {
  Write-Check -Name "Supabase Auth" -Ok $false -Detail "SUPABASE_URL or anon/publishable key is missing"
  $hadFailure = $true
} else {
  $settingsUrl = "$($supabaseUrl.TrimEnd('/'))/auth/v1/settings"
  $supabase = Test-Url -Url $settingsUrl -Headers @{ apikey = $supabaseKey }
  Write-Check -Name "Supabase Auth" -Ok $supabase.Ok -Detail "$settingsUrl ($($supabase.Detail))"
  if (-not $supabase.Ok) {
    Write-Host "[hint] Supabase Auth failed while local frontend/backend may still be running. If login shows 'Failed to fetch', wait for network stability or sign out and sign in again."
  }
  $hadFailure = $hadFailure -or ((-not $supabase.Ok) -and (-not $SupabaseAsWarning))
}

if ($hadFailure) {
  exit 1
}

Write-Host "[ok]   Local development checks passed"
