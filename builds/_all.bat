@set /p answer=Version: 

@echo need update on server "config.json" and "scripts" > vkopt_%answer%_!onserver.txt

@del vkopt_%answer%_firefox.xpi

_tools\amo_app_versions.py "firefox\install.rdf"
_tools\_zip_packer.py firefox vkopt_%answer%_firefox.xpi

del vkopt_%answer%_firefox_jetpack.xpi
_tools\amo_app_versions.py "firefoxJetpack\install.rdf"
_tools\_zip_packer.py firefoxJetpack vkopt_%answer%_firefox_jetpack.xpi "" ^\\.

@del vkopt_%answer%_opera.oex
_tools\_zip_packer.py opera.extension vkopt_%answer%_opera.oex


@del vkopt_%answer%_chrome.zip
_tools\_zip_packer.py chrome vkopt_%answer%_chrome.zip

del vkopt_%answer%_maxthon.mxaddon
_tools\_zip_packer.py  .\maxthon\  vkopt_%answer%_maxthon.mxaddon

@del vkopt_%answer%_opera.zip
cd ..
_tools\_zip_packer.py source builds\vkopt_%answer%_opera.zip "^vk(_|opt|lang)" "vkopt_debug.js"


pause