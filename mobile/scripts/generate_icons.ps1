Add-Type -AssemblyName System.Drawing

function Draw-UplinkEmblemCentered {
    param(
        [System.Drawing.Graphics]$g,
        [float]$canvasWidth,
        [float]$canvasHeight,
        [float]$emblemTargetSize,
        [bool]$drawShadow = $true
    )

    $scale = $emblemTargetSize / 26.0
    $centerX = $canvasWidth / 2.0
    $centerY = $canvasHeight / 2.0

    $state = $g.Save()
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $g.TranslateTransform($centerX, $centerY)
    $g.ScaleTransform($scale, $scale)
    $g.TranslateTransform(-20.0, -18.5)

    $strokeWidthMain = 3.0
    $strokeWidthCenter = 2.5

    $whiteBrush = [System.Drawing.Brushes]::White
    $mainPen = [System.Drawing.Pen]::new([System.Drawing.Color]::White, $strokeWidthMain)
    $mainPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $mainPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    $centerPen = [System.Drawing.Pen]::new([System.Drawing.Color]::White, $strokeWidthCenter)
    $centerPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $centerPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    # U-Path: (12, 11) -> (12, 21) -> Arc to (28, 21) -> (28, 11)
    $uPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $uPath.AddLine(12.0, 11.0, 12.0, 21.0)
    $uPath.AddArc(12.0, 12.0, 16.0, 18.0, 180, -180)
    $uPath.AddLine(28.0, 21.0, 28.0, 11.0)

    if ($drawShadow) {
        $shadowPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(40, 0, 18, 75), $strokeWidthMain + 1.2)
        $shadowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $shadowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
        $shadowBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(40, 0, 18, 75))

        $g.TranslateTransform(0.0, 1.0)
        $g.DrawPath($shadowPen, $uPath)
        $g.DrawLine($shadowPen, 20.0, 18.5, 20.0, 9.0)
        $g.FillEllipse($shadowBrush, 20.0 - 2.5, 8.0 - 2.5, 5.0, 5.0)
        $g.FillEllipse($shadowBrush, 12.0 - 2.0, 12.0 - 2.0, 4.0, 4.0)
        $g.FillEllipse($shadowBrush, 28.0 - 2.0, 12.0 - 2.0, 4.0, 4.0)
        $g.TranslateTransform(0.0, -1.0)

        $shadowPen.Dispose()
        $shadowBrush.Dispose()
    }

    # Main emblem
    $g.DrawPath($mainPen, $uPath)
    $g.DrawLine($centerPen, 20.0, 18.5, 20.0, 9.0)

    # Center node (circle at 20, 8, r=2.5)
    $g.FillEllipse($whiteBrush, 20.0 - 2.5, 8.0 - 2.5, 5.0, 5.0)

    # Side nodes (circles at 12, 12, r=2 and 28, 12, r=2)
    $g.FillEllipse($whiteBrush, 12.0 - 2.0, 12.0 - 2.0, 4.0, 4.0)
    $g.FillEllipse($whiteBrush, 28.0 - 2.0, 12.0 - 2.0, 4.0, 4.0)

    $uPath.Dispose()
    $mainPen.Dispose()
    $centerPen.Dispose()

    $g.Restore($state)
}

function Generate-SquareIcon {
    param([int]$size, [string]$outputPath)

    $bmp = [System.Drawing.Bitmap]::new($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Background gradient
    $rect = [System.Drawing.Rectangle]::new(0, 0, $size, $size)
    $gradBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 25, 98, 240),  # Top-left slightly lighter
        [System.Drawing.Color]::FromArgb(255, 12, 68, 186),  # Bottom-right deeper
        45.0
    )

    # Squircle with standard 22% radius
    $radius = [float]($size * 0.22)
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $d = $radius * 2.0
    $path.AddArc(0, 0, $d, $d, 180, 90)
    $path.AddArc($size - $d, 0, $d, $d, 270, 90)
    $path.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
    $path.AddArc(0, $size - $d, $d, $d, 90, 90)
    $path.CloseFigure()

    $g.FillPath($gradBrush, $path)

    # Subtle inner border for contrast
    $borderPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(45, 255, 255, 255), 1.0)
    $g.DrawPath($borderPen, $path)
    $borderPen.Dispose()

    # Draw Emblem
    $targetEmblemSize = [float]($size * 0.60)
    Draw-UplinkEmblemCentered $g $size $size $targetEmblemSize $true

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $gradBrush.Dispose()
    $path.Dispose()
}

function Generate-RoundIcon {
    param([int]$size, [string]$outputPath)

    $bmp = [System.Drawing.Bitmap]::new($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Circular background gradient
    $rect = [System.Drawing.Rectangle]::new(0, 0, $size, $size)
    $gradBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 25, 98, 240),
        [System.Drawing.Color]::FromArgb(255, 12, 68, 186),
        45.0
    )

    # Perfect circle slightly inset to prevent antialias edge clipping
    $inset = 1.0
    $circleSize = $size - ($inset * 2.0)
    $g.FillEllipse($gradBrush, $inset, $inset, $circleSize, $circleSize)

    # Subtle inner border
    $borderPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(45, 255, 255, 255), 1.0)
    $g.DrawEllipse($borderPen, $inset, $inset, $circleSize, $circleSize)
    $borderPen.Dispose()

    # Draw Centered Emblem
    $targetEmblemSize = [float]($size * 0.54)
    Draw-UplinkEmblemCentered $g $size $size $targetEmblemSize $true

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $gradBrush.Dispose()
}

function Generate-AdaptiveForeground {
    param([int]$size, [string]$outputPath)

    $bmp = [System.Drawing.Bitmap]::new($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    # Emblem centered strictly within 72dp safe zone of 108dp canvas (48% canvas size)
    $emblemSize = [float]($size * 0.48)
    Draw-UplinkEmblemCentered $g $size $size $emblemSize $false

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

# Densities and sizes
$densities = @{
    "mdpi"    = 48
    "hdpi"    = 72
    "xhdpi"   = 96
    "xxhdpi"  = 144
    "xxxhdpi" = 192
}

$adaptiveSizes = @{
    "mdpi"    = 108
    "hdpi"    = 162
    "xhdpi"   = 216
    "xxhdpi"  = 324
    "xxxhdpi" = 432
}

$resDir = "C:\dev\Uplink\mobile\android\app\src\main\res"

foreach ($d in $densities.Keys) {
    $size = $densities[$d]
    $folder = Join-Path $resDir "mipmap-$d"
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
    }

    $squarePath = Join-Path $folder "ic_launcher.png"
    $roundPath = Join-Path $folder "ic_launcher_round.png"

    Generate-SquareIcon $size $squarePath
    Generate-RoundIcon $size $roundPath

    # Adaptive foreground for each density in drawable folders
    $drawFolder = Join-Path $resDir "drawable-$d"
    if (-not (Test-Path $drawFolder)) {
        New-Item -ItemType Directory -Path $drawFolder -Force | Out-Null
    }
    $fgSize = $adaptiveSizes[$d]
    $fgPath = Join-Path $drawFolder "ic_launcher_foreground.png"
    Generate-AdaptiveForeground $fgSize $fgPath

    Write-Host "Generated $d icon ($size x $size) & foreground ($fgSize x $fgSize)"
}

# Fallback in main drawable directory
$mainDrawDir = Join-Path $resDir "drawable"
if (-not (Test-Path $mainDrawDir)) { New-Item -ItemType Directory -Path $mainDrawDir -Force | Out-Null }
Generate-AdaptiveForeground 432 (Join-Path $mainDrawDir "ic_launcher_foreground.png")

# Generate master 512x512 preview in artifacts folder
$artifactDir = "C:\Users\adina\.gemini\antigravity\brain\563c4397-7616-413a-8ecb-214e02b88481"
Generate-SquareIcon 512 (Join-Path $artifactDir "app_icon_square_512.png")
Generate-RoundIcon 512 (Join-Path $artifactDir "app_icon_round_512.png")
Write-Host "Generated 512x512 master previews in artifact directory"
