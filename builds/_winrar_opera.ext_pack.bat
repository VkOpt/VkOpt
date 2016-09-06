@IF [%1] == [] ECHO OFF
IF  [%1] == [] CALL _build.bat 3
"%PROGRAMFILES%\WinRar\WinRAR.exe" a -edh -x*\.gitignore -m2 -r -ed -ep1 -afzip vkopt_opera.oex opera.extension\*
IF  [%1] == [] PAUSE
