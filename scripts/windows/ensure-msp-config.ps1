# Ensures every MSP folder has a valid NodeOUs config.yaml (required by Fabric 2.5).
# Missing config.yaml => "creator org unknown, creator is malformed".
$ErrorActionPreference = 'Stop'
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$orgRoot = Join-Path $root 'network\organizations'

function Get-CaCertRelativeName([string]$mspDir) {
  $caDir = Join-Path $mspDir 'cacerts'
  if (-not (Test-Path $caDir)) { return $null }
  $cert = Get-ChildItem $caDir -File | Select-Object -First 1
  if (-not $cert) { return $null }
  return "cacerts/$($cert.Name)"
}

function Write-NodeOuConfig([string]$mspDir) {
  $caRel = Get-CaCertRelativeName $mspDir
  if (-not $caRel) { return $false }

  $content = @"
NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: $caRel
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: $caRel
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: $caRel
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: $caRel
    OrganizationalUnitIdentifier: orderer
"@
  $path = Join-Path $mspDir 'config.yaml'
  # LF endings (YAML/PEM tooling on Linux containers is happier)
  [System.IO.File]::WriteAllText($path, ($content -replace "`r`n", "`n"))
  return $true
}

if (-not (Test-Path $orgRoot)) {
  Write-Host "[ensure-msp] No existe $orgRoot"
  exit 1
}

$count = 0
Get-ChildItem -Path $orgRoot -Recurse -Directory -Filter 'msp' | ForEach-Object {
  if (Write-NodeOuConfig $_.FullName) {
    $count++
    Write-Host "[ensure-msp] OK $($_.FullName)"
  }
}

if ($count -eq 0) {
  Write-Host "[ensure-msp] No se encontro ningun MSP con cacerts"
  exit 1
}

Write-Host "[ensure-msp] config.yaml asegurado en $count carpetas MSP"
exit 0
