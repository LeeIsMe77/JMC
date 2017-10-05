@echo off
echo Preparing to send email to %1 from %2...
START powershell -WindowStyle Hidden -File emailMessage.ps1 %1 %2 %3
REM START "" "C:\jmc\3.7.1.1\powershell_hidden.exe.ink" -WindowStyle Hidden -File emailMessage.ps1 %1 %2 %3
REM C:\jmc\3.7.1.1\powershell.exe -WindowStyle Hidden -File emailMessage.ps1 %1 %2 %3
echo Email sent.