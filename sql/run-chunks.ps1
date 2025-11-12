param(
  [string]$DatabaseUrl = $env:DATABASE_URL
)
if (-not $DatabaseUrl) {
  Write-Error "Please set the DATABASE_URL environment variable (e.g. $env:DATABASE_URL = 'postgres://user:pass@host:port/db')"
  exit 2
}
$chunksDir = "sql\for_later_usage\_chunks"
Get-ChildItem -Path $chunksDir -Filter "dnd_chunk_*.sql" | Sort-Object Name | ForEach-Object {
  Write-Host "Executing $($_.FullName)..."
  psql $DatabaseUrl -f $_.FullName
}
Write-Host "All chunks executed."
