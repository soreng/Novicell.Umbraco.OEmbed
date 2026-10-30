<#
.SYNOPSIS
    Runs the test site on several Umbraco 17 versions and smoke-tests the package on each.

.DESCRIPTION
    For each version the test site is built with that Umbraco version (and a uSync that works with
    it), started on a fresh SQLite database of its own, and checked: the site starts, the front-end
    and headless pages and the package's swagger document answer, and the backoffice smoke test
    (scripts/backoffice-smoke.mjs) retrieves embeds through the picker. The log of each run and
    the screenshots end up in artifacts/umbraco-versions/<version>/.

    The package itself is not rebuilt per version: it is compiled against its floor (17.0.0) and
    runs on whatever Umbraco the site has, like an installed package does.

    Needs the client's npm packages (npm ci in src/Novicell.Umbraco.OEmbed/Client) and Chrome.
    Stops a running test site first. Afterwards the test site is built again with its own versions.

.PARAMETER Versions
    Umbraco versions to test, each optionally with the uSync version to use: "17.0.0=17.0.0".
    Without a uSync version, the test site's own uSync version is used.

.EXAMPLE
    ./scripts/Test-UmbracoVersions.ps1
    ./scripts/Test-UmbracoVersions.ps1 -Versions "17.0.0=17.0.0", "17.4.2"
#>
[CmdletBinding()]
param(
    [string[]] $Versions = @("17.0.0=17.0.0", "17.4.2=17.3.2", "17.8.0=17.3.2"),
    [string] $Url = "https://localhost:44366",
    [int] $StartTimeoutSeconds = 240,
    [switch] $SkipClientBuild
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$site = Join-Path $root "src/Novicell.Umbraco.OEmbed.TestSite"
$client = Join-Path $root "src/Novicell.Umbraco.OEmbed/Client"
$smoke = Join-Path $PSScriptRoot "backoffice-smoke.mjs"
$out = Join-Path $root "artifacts/umbraco-versions"
$siteProcessName = "Novicell.Umbraco.OEmbed.TestSite"

function Stop-TestSite {
    Get-Process $siteProcessName -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
}

function Get-Status([string] $path) {
    try {
        (Invoke-WebRequest "$Url$path" -SkipCertificateCheck -TimeoutSec 30 -SkipHttpErrorCheck).StatusCode
    } catch {
        0
    }
}

if (-not $SkipClientBuild) {
    Write-Host "Building the client" -ForegroundColor Cyan
    npm --prefix $client run build | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "The client build failed." }
}

Stop-TestSite
$results = @()

foreach ($entry in $Versions) {
    $umbraco, $usync = $entry.Split("=")
    $runOut = Join-Path $out $umbraco
    New-Item -ItemType Directory -Force $runOut | Out-Null
    $log = Join-Path $runOut "site.log"
    $result = [ordered]@{ Umbraco = $umbraco; uSync = $usync; Build = "-"; Start = "-"; Pages = "-"; Backoffice = "-" }
    Write-Host "`n=== Umbraco $umbraco" -ForegroundColor Cyan

    $buildArgs = @("build", $site, "-c", "Release", "-v", "q", "-p:TestSiteUmbracoVersion=$umbraco")
    if ($usync) { $buildArgs += "-p:TestSiteUSyncVersion=$usync" }
    dotnet @buildArgs *> (Join-Path $runOut "build.log")
    if ($LASTEXITCODE -ne 0) {
        $result.Build = "failed (see build.log)"
        $results += [pscustomobject]$result
        continue
    }
    $result.Build = "ok"

    # A database of its own: a database from a newer Umbraco cannot be opened by an older one.
    $env:ASPNETCORE_ENVIRONMENT = "Development"
    $env:ConnectionStrings__umbracoDbDSN = "Data Source=|DataDirectory|/Umbraco.v$umbraco.sqlite.db;Cache=Shared;Foreign Keys=True;Pooling=True"
    $process = Start-Process dotnet -ArgumentList "run", "--project", $site, "-c", "Release", "--no-build", "--no-launch-profile", "--urls", $Url `
        -RedirectStandardOutput $log -RedirectStandardError (Join-Path $runOut "site.err.log") -PassThru -NoNewWindow
    Remove-Item Env:ConnectionStrings__umbracoDbDSN, Env:ASPNETCORE_ENVIRONMENT

    $deadline = (Get-Date).AddSeconds($StartTimeoutSeconds)
    while ((Get-Date) -lt $deadline -and -not $process.HasExited -and (Get-Status "/") -ne 200) {
        Start-Sleep -Seconds 3
    }

    if ((Get-Status "/") -ne 200) {
        $result.Start = "failed (see site.log)"
        Stop-TestSite
        $results += [pscustomobject]$result
        continue
    }
    $result.Start = "ok"

    $pages = "/", "/headless/", "/umbraco/swagger/novicell-oembed/swagger.json" |
        ForEach-Object { "$_ $(Get-Status $_)" }
    $result.Pages = if ($pages -match " 200$" -and @($pages -notmatch " 200$").Count -eq 0) { "ok" } else { $pages -join ", " }

    Push-Location $client
    node $smoke $Url $runOut $umbraco | Tee-Object -FilePath (Join-Path $runOut "smoke.log") | Write-Host
    $result.Backoffice = if ($LASTEXITCODE -eq 0) { "ok" } else { "failed (see smoke.log)" }
    Pop-Location

    $errors = @(Select-String -Path $log -Pattern "\[\d\d:\d\d:\d\d (ERR|FTL)\]").Count
    if ($errors -gt 0) { $result.Pages += " ($errors errors logged)" }

    Stop-TestSite
    $results += [pscustomobject]$result
}

Write-Host "`nBuilding the test site with its own versions again" -ForegroundColor Cyan
dotnet build $site -c Release -v q *> $null

$results | Format-Table -AutoSize
if ($results | Where-Object { ($_.PSObject.Properties.Value | Select-Object -Skip 2) -match "failed|errors" }) { exit 1 }
