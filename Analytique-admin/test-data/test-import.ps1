# CSV Import Test Script
# Run this after starting the backend server

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CSV IMPORT TESTING SCRIPT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/import-export"
$testDataPath = "C:\Users\LENOVO\Desktop\UNISHIP\Analytique\test-data"

function Test-Import {
    param(
        [string]$Entity,
        [string]$FileName
    )
    
    Write-Host "`n>>> Testing $Entity Import: $FileName" -ForegroundColor Yellow
    Write-Host "=" * 50
    
    $filePath = Join-Path $testDataPath $FileName
    
    if (-not (Test-Path $filePath)) {
        Write-Host "ERROR: File not found: $filePath" -ForegroundColor Red
        return
    }
    
    try {
        $url = "$baseUrl/$Entity/import"
        
        # Create multipart form data
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        $fileContent = [System.IO.File]::ReadAllBytes($filePath)
        $fileString = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($fileContent)
        
        $bodyLines = (
            "--$boundary",
            "Content-Disposition: form-data; name=`"file`"; filename=`"$FileName`"",
            "Content-Type: text/csv$LF",
            $fileString,
            "--$boundary",
            "Content-Disposition: form-data; name=`"updateExisting`"$LF",
            "false",
            "--$boundary--$LF"
        ) -join $LF
        
        $response = Invoke-RestMethod -Uri $url -Method Post `
            -ContentType "multipart/form-data; boundary=$boundary" `
            -Body ([System.Text.Encoding]::GetEncoding('iso-8859-1').GetBytes($bodyLines))
        
        Write-Host "SUCCESS!" -ForegroundColor Green
        Write-Host "  Created: $($response.summary.success)" -ForegroundColor Green
        Write-Host "  Updated: $($response.summary.updated)" -ForegroundColor Yellow
        Write-Host "  Errors:  $($response.summary.errors)" -ForegroundColor $(if($response.summary.errors -gt 0){'Red'}else{'Green'})
        
        if ($response.details.success.Count -gt 0) {
            Write-Host "`n  Successfully imported:" -ForegroundColor Green
            $response.details.success | ForEach-Object { 
                Write-Host "    - $_" -ForegroundColor Gray
            }
        }
        
        if ($response.details.errors.Count -gt 0) {
            Write-Host "`n  Errors encountered:" -ForegroundColor Red
            $response.details.errors | ForEach-Object {
                Write-Host "    - $($_.error)" -ForegroundColor Red
            }
        }
        
    } catch {
        Write-Host "ERROR!" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "  Response: $responseBody" -ForegroundColor Red
        }
    }
    
    Start-Sleep -Seconds 1
}

# Check if server is running
Write-Host "Checking if server is running..." -ForegroundColor Cyan
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 2
    Write-Host "Server is running!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Server is not running!" -ForegroundColor Red
    Write-Host "Please start the server first:" -ForegroundColor Yellow
    Write-Host "  cd C:\Users\LENOVO\Desktop\UNISHIP\Analytique" -ForegroundColor Gray
    Write-Host "  npm run dev" -ForegroundColor Gray
    exit 1
}

# Run tests
Write-Host "`nStarting imports..." -ForegroundColor Cyan

Test-Import -Entity "groups" -FileName "groups-test.csv"
Test-Import -Entity "rooms" -FileName "rooms-test.csv"
Test-Import -Entity "students" -FileName "students-test.csv"
Test-Import -Entity "teachers" -FileName "teachers-test.csv"
Test-Import -Entity "subjects" -FileName "subjects-test.csv"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ALL TESTS COMPLETED!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Check the web UI: http://localhost:5173/import-export" -ForegroundColor Gray
Write-Host "  2. Verify in database with SQL queries" -ForegroundColor Gray
Write-Host "  3. Test export functionality" -ForegroundColor Gray
