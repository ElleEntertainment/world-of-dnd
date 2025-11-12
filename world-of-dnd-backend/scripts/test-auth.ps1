# PowerShell script to login and call protected endpoints
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File .\world-of-dnd-backend\scripts\test-auth.ps1

try {
  $body = @{ email = 'admin@admin.it'; password = 'admin' } | ConvertTo-Json
  Write-Output "Calling /auth/login ..."
  $resp = Invoke-RestMethod -Uri 'http://localhost:3000/auth/login' -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
  Write-Output "LOGIN RESPONSE:"
  $resp | ConvertTo-Json -Depth 5 | Write-Output

  $token = $resp.access_token
  if (-not $token) {
    Write-Output "No access_token returned."
    exit 2
  }

  Write-Output "`nTOKEN:"
  Write-Output $token

  Write-Output "`nCalling /game-sessions/data/skills ..."
  try {
    $skills = Invoke-RestMethod -Uri 'http://localhost:3000/game-sessions/data/skills' -Headers @{ Authorization = 'Bearer ' + $token } -Method Get -ErrorAction Stop
    Write-Output "SKILLS RESPONSE:"
    $skills | ConvertTo-Json -Depth 5 | Write-Output
  } catch {
    Write-Output "ERROR calling skills endpoint:"
    if ($_.Exception.Response) {
      try {
        $content = $_.Exception.Response | Select -ExpandProperty Content
        if ($content) {
          $content | ConvertFrom-Json | ConvertTo-Json -Depth 5 | Write-Output
        } else {
          $_.Exception.Response | ConvertTo-Json -Depth 5 | Write-Output
        }
      } catch {
        $_.Exception.Response | ConvertTo-Json -Depth 5 | Write-Output
      }
    } else {
      $_ | ConvertTo-Json -Depth 5 | Write-Output
    }
  }

  Write-Output "`nCalling /game-sessions/data/spells ..."
  try {
    $spells = Invoke-RestMethod -Uri 'http://localhost:3000/game-sessions/data/spells' -Headers @{ Authorization = 'Bearer ' + $token } -Method Get -ErrorAction Stop
    Write-Output "SPELLS RESPONSE:"
    $spells | ConvertTo-Json -Depth 5 | Write-Output
  } catch {
    Write-Output "ERROR calling spells endpoint:"
    if ($_.Exception.Response) {
      try {
        $content = $_.Exception.Response | Select -ExpandProperty Content
        if ($content) {
          $content | ConvertFrom-Json | ConvertTo-Json -Depth 5 | Write-Output
        } else {
          $_.Exception.Response | ConvertTo-Json -Depth 5 | Write-Output
        }
      } catch {
        $_.Exception.Response | ConvertTo-Json -Depth 5 | Write-Output
      }
    } else {
      $_ | ConvertTo-Json -Depth 5 | Write-Output
    }
  }

  Write-Output "`nCalling /game-sessions/data/talents ..."
  try {
    $talents = Invoke-RestMethod -Uri 'http://localhost:3000/game-sessions/data/talents' -Headers @{ Authorization = 'Bearer ' + $token } -Method Get -ErrorAction Stop
    Write-Output "TALENTS RESPONSE:"
    $talents | ConvertTo-Json -Depth 5 | Write-Output
  } catch {
    Write-Output "ERROR calling talents endpoint:"
    if ($_.Exception.Response) {
      try {
        $content = $_.Exception.Response | Select -ExpandProperty Content
        if ($content) {
          $content | ConvertFrom-Json | ConvertTo-Json -Depth 5 | Write-Output
        } else {
          $_.Exception.Response | ConvertTo-Json -Depth 5 | Write-Output
        }
      } catch {
        $_.Exception.Response | ConvertTo-Json -Depth 5 | Write-Output
      }
    } else {
      $_ | ConvertTo-Json -Depth 5 | Write-Output
    }
  }

} catch {
  Write-Output "Fatal error during login or requests:"
  $_ | ConvertTo-Json -Depth 5 | Write-Output
  exit 1
}
