@echo off
echo Preparing to send email to %1 from %2...
START powershell -WindowStyle Hidden -File emailMessage.ps1 %1 %2 %3
echo Email sent.