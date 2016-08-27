@ECHO OFF
CALL _build.bat

ECHO Packing
CALL _winrar_chrome_pack.bat 1
ECHO vkopt_chrome.zip
CALL _winrar_firefox_jetpack_pack.bat 1
ECHO vkopt_firefox_jetpack.xpi
CALL _winrar_firefox_pack.bat 1
ECHO vkopt_firefox.xpi
CALL _winrar_firefox_webext_pack.bat 1
ECHO vkopt_firefox_webext.xpi
CALL _winrar_opera.ext_pack.bat 1
ECHO vkopt_opera.oex
CALL _maxthon_pack.bat 1
ECHO vkopt_maxthon.mxaddon
ECHO Done
PAUSE
