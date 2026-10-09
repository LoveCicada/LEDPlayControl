$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$htmlPath = Join-Path $here "index.html"
$bytes = [System.IO.File]::ReadAllBytes($htmlPath)
$html = [System.Text.Encoding]::UTF8.GetString($bytes)
$found = [regex]::Matches($html, '(?s)<p class="caption">(.*?)</p>')
if ($found.Count -ne 8) {
  throw "expected 8 captions, got $($found.Count)"
}

Add-Type -AssemblyName System.Speech
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(
  16000,
  [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,
  [System.Speech.AudioFormat.AudioChannel]::Mono
)
$outDir = Join-Path $here "audio"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

for ($i = 0; $i -lt $found.Count; $i++) {
  $text = $found[$i].Groups[1].Value
  $text = [regex]::Replace($text, "<[^>]+>", "")
  $text = [System.Net.WebUtility]::HtmlDecode($text)
  $text = ($text -replace "\s+", " ").Trim()
  if (-not $text) { throw "empty caption $($i + 1)" }
  $path = Join-Path $outDir ("{0:D2}.wav" -f ($i + 1))
  $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $synth.SelectVoice("Microsoft Huihui Desktop")
  $synth.SetOutputToWaveFile($path, $fmt)
  $synth.Speak($text)
  $synth.Dispose()
  $size = (Get-Item $path).Length
  $sec = [Math]::Round(($size - 44) / (16000 * 2), 1)
  Write-Output ("{0:D2}.wav  {1}s  {2}" -f ($i + 1), $sec, $text)
}
