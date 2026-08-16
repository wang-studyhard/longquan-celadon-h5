param(
  [switch]$NoBrowser,
  [int]$Port = 0
)

$ErrorActionPreference = "Stop"
$siteRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "site"))
if (-not (Test-Path -LiteralPath (Join-Path $siteRoot "index.html"))) {
  throw "Offline site files are incomplete."
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
$port = ([System.Net.IPEndPoint]$listener.LocalEndpoint).Port
$url = "http://127.0.0.1:$port/"
if (-not $NoBrowser) { Start-Process $url }
Write-Host "Longquan Celadon offline exhibition: $url"
Write-Host "Close this window to stop the local server."

$mime = @{
  ".html" = "text/html; charset=utf-8"; ".css" = "text/css; charset=utf-8"; ".js" = "text/javascript; charset=utf-8";
  ".json" = "application/json; charset=utf-8"; ".svg" = "image/svg+xml"; ".png" = "image/png"; ".jpg" = "image/jpeg";
  ".jpeg" = "image/jpeg"; ".webp" = "image/webp"; ".woff2" = "font/woff2"; ".ico" = "image/x-icon"
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()
      while (($line = $reader.ReadLine()) -ne "" -and $null -ne $line) { }
      if (-not $requestLine) { continue }
      $parts = $requestLine.Split(" ")
      $requestPath = [System.Uri]::UnescapeDataString($parts[1].Split("?")[0]).TrimStart("/")
      if ([string]::IsNullOrWhiteSpace($requestPath)) { $requestPath = "index.html" }
      $candidate = [System.IO.Path]::GetFullPath((Join-Path $siteRoot $requestPath.Replace("/", [System.IO.Path]::DirectorySeparatorChar)))
      if ((Test-Path -LiteralPath $candidate -PathType Container)) { $candidate = Join-Path $candidate "index.html" }
      $allowed = $candidate.StartsWith($siteRoot, [System.StringComparison]::OrdinalIgnoreCase)
      $found = $allowed -and (Test-Path -LiteralPath $candidate -PathType Leaf)
      if ($found) {
        $body = [System.IO.File]::ReadAllBytes($candidate)
        $extension = [System.IO.Path]::GetExtension($candidate).ToLowerInvariant()
        $contentType = if ($mime.ContainsKey($extension)) { $mime[$extension] } else { "application/octet-stream" }
        $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
      } else {
        $body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
        $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
      }
      $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($headerBytes, 0, $headerBytes.Length)
      $stream.Write($body, 0, $body.Length)
    } finally {
      $client.Dispose()
    }
  }
} finally {
  $listener.Stop()
}
