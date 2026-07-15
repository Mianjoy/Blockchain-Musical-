param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)
Add-Type -AssemblyName System.Drawing
function Convert-PngToIco {
  param([string]$PngPath, [string]$IcoPath, [int[]]$Sizes = @(16,32,48,256))
  $src = [System.Drawing.Image]::FromFile((Resolve-Path $PngPath))
  try {
    $ms = New-Object System.IO.MemoryStream
    $bw = New-Object System.IO.BinaryWriter $ms
    $bw.Write([uint16]0); $bw.Write([uint16]1); $bw.Write([uint16]$Sizes.Count)
    $imageData = New-Object System.Collections.Generic.List[byte[]]
    $offset = 6 + (16 * $Sizes.Count)
    foreach ($size in $Sizes) {
      $bmp = New-Object System.Drawing.Bitmap $size, $size
      $g = [System.Drawing.Graphics]::FromImage($bmp)
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $g.Clear([System.Drawing.Color]::Transparent)
      $g.DrawImage($src, 0, 0, $size, $size)
      $g.Dispose()
      $pngMs = New-Object System.IO.MemoryStream
      $bmp.Save($pngMs, [System.Drawing.Imaging.ImageFormat]::Png)
      $bytes = $pngMs.ToArray()
      $pngMs.Dispose(); $bmp.Dispose()
      $w = if ($size -ge 256) { 0 } else { $size }
      $bw.Write([byte]$w); $bw.Write([byte]$w); $bw.Write([byte]0); $bw.Write([byte]0)
      $bw.Write([uint16]1); $bw.Write([uint16]32)
      $bw.Write([uint32]$bytes.Length); $bw.Write([uint32]$offset)
      $offset += $bytes.Length; $imageData.Add($bytes)
    }
    foreach ($data in $imageData) { $bw.Write($data) }
    $bw.Flush()
    [System.IO.File]::WriteAllBytes($IcoPath, $ms.ToArray())
    $bw.Dispose(); $ms.Dispose()
  } finally { $src.Dispose() }
}
Convert-PngToIco (Join-Path $Root 'packaging\icons\app-music.png') (Join-Path $Root 'packaging\icons\app-music.ico')
Convert-PngToIco (Join-Path $Root 'packaging\icons\fabric-hl.png') (Join-Path $Root 'packaging\icons\fabric-hl.ico')
Write-Host 'ICO files updated.'
