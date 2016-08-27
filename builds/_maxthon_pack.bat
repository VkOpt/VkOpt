@IF [%1] == [] ECHO OFF
IF  [%1] == [] CALL _build.bat 6
makpak.exe  .\maxthon\  vkopt_maxthon.mxaddon
IF  [%1] == [] PAUSE
