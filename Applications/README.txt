In order to allow the scripting engine to function within JMC, execute the batch script located in the JMC directory.  

The script will register ttcoreex.dll executing the following commands:

@setlocal enableextensions
@cd /d "%~dp0"

%WinDir%\system32\regsvr32.exe ttcoreex.dll
%WinDir%\system\regsvr32.exe ttcoreex.dll

If Windows smartscreen blocks the execution, click More and allow to run.  If you question the contents, feel free to open the file with a text editor before executing.