@IF [%1] == [] ECHO OFF
IF  [%1] == [] CALL _build.bat 1
"%PROGRAMFILES%\WinRar\WinRAR.exe" a -edh -x*\.gitignore -m2 -r -ed -ep1 -afzip vkopt_firefox_webext.xpi chrome\*
IF  [%1] == [] PAUSE
