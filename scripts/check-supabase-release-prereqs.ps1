param(
  [string]$ReportPath = "docs/evidence/$(Get-Date -Format 'yyyy-MM-dd')-supabase-release-prereqs.txt"
)

$ErrorActionPreference = "Continue"

$checks = New-Object System.Collections.Generic.List[object]
$lines = New-Object System.Collections.Generic.List[string]

function Redact-Text {
  param([string]$Text)

  if ([string]::IsNullOrEmpty($Text)) {
    return ""
  }

  $redacted = $Text -replace "eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+", "[redacted-jwt]"
  $redacted = $redacted -replace "(postgres(?:ql)?://[^:\s]+:)([^@\s]+)(@)", '$1[redacted]$3'
  $redacted = $redacted -replace "(SUPABASE_[A-Z0-9_]*=)[^\s]+", '$1[redacted]'
  return $redacted
}

function Add-Line {
  param([string]$Text)

  $lines.Add($Text) | Out-Null
  Write-Host $Text
}

function Add-Check {
  param(
    [string]$Name,
    [string]$Status,
    [string]$Detail
  )

  $checks.Add([pscustomobject]@{
      Name   = $Name
      Status = $Status
      Detail = $Detail
    }) | Out-Null
}

function Invoke-ExternalCheck {
  param(
    [string]$Name,
    [string]$Command
  )

  Add-Line ""
  Add-Line "## $Name"
  Add-Line "Command: $Command"

  $global:LASTEXITCODE = 0
  $output = Invoke-Expression "$Command 2>&1"
  $exitCode = $LASTEXITCODE
  $text = ($output | ForEach-Object { $_.ToString() }) -join [Environment]::NewLine
  $text = Redact-Text $text

  if (-not [string]::IsNullOrWhiteSpace($text)) {
    Add-Line $text
  }

  Add-Line "Exit code: $exitCode"

  if ($exitCode -eq 0) {
    Add-Check $Name "Pass" "Command completed successfully."
  } else {
    Add-Check $Name "Blocked" "Command exited $exitCode. See redacted output above."
  }

  return $exitCode
}

Add-Line "# PinayMate Supabase Release Prerequisite Check"
Add-Line ""
Add-Line "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')"
Add-Line "Scope: local prerequisite checks only. This does not prove staging or production Supabase readiness."
Add-Line "Secrets policy: command output is redacted for JWT-like tokens, Postgres passwords, and SUPABASE_* assignment values."

$npx = Get-Command npx -ErrorAction SilentlyContinue
if ($null -eq $npx) {
  Add-Check "npx availability" "Blocked" "npx is not available on PATH."
  Add-Line ""
  Add-Line "## npx availability"
  Add-Line "Blocked: npx is not available on PATH."
} else {
  Add-Check "npx availability" "Pass" "npx found at $($npx.Source)."
  Invoke-ExternalCheck "Supabase CLI version" "npx supabase --version" | Out-Null
}

$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($null -eq $docker) {
  Add-Check "Docker CLI availability" "Blocked" "docker is not available on PATH."
  Add-Line ""
  Add-Line "## Docker CLI availability"
  Add-Line "Blocked: docker is not available on PATH."
} else {
  Add-Check "Docker CLI availability" "Pass" "docker found at $($docker.Source)."
  Invoke-ExternalCheck "Docker daemon" "docker info --format '{{.ServerVersion}}'" | Out-Null
}

$smokePath = "supabase/tests/04_safety_smoke_test.sql"
if (Test-Path $smokePath) {
  Add-Check "Safety smoke SQL file" "Pass" "$smokePath exists."
  Add-Line ""
  Add-Line "## Safety smoke SQL file"
  Add-Line "Pass: $smokePath exists."
} else {
  Add-Check "Safety smoke SQL file" "Blocked" "$smokePath is missing."
  Add-Line ""
  Add-Line "## Safety smoke SQL file"
  Add-Line "Blocked: $smokePath is missing."
}

$statusExit = Invoke-ExternalCheck "Supabase local status" "npx supabase status"

if ($statusExit -eq 0) {
  Invoke-ExternalCheck "Supabase DB lint" "npx supabase db lint" | Out-Null
} else {
  Add-Check "Supabase DB lint" "Blocked" "Skipped because local Supabase status did not pass."
  Add-Line ""
  Add-Line "## Supabase DB lint"
  Add-Line "Blocked: skipped because local Supabase status did not pass."
}

Add-Line ""
Add-Line "## Summary"

$hasBlocked = $false
foreach ($check in $checks) {
  Add-Line "- $($check.Status): $($check.Name) - $($check.Detail)"
  if ($check.Status -eq "Blocked") {
    $hasBlocked = $true
  }
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
  New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
}

$lines -join [Environment]::NewLine | Set-Content -Path $ReportPath

Add-Line ""
Add-Line "Report written to: $ReportPath"

if ($hasBlocked) {
  exit 2
}

exit 0
