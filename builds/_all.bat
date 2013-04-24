@set /p answer=Version: 

@echo need update on server "config.json" and "scripts" > vkopt_%answer%_!onserver.txt

@del vkopt_%answer%_firefox.xpi
_zip_packer.py firefox vkopt_%answer%_firefox.xpi


@del vkopt_%answer%_opera.oex
_zip_packer.py opera.extension vkopt_%answer%_opera.oex


@del vkopt_%answer%_chrome.zip
_zip_packer.py chrome vkopt_%answer%_chrome.zip


@del vkopt_%answer%_opera.zip
cd ..
builds\_zip_packer.py source builds\vkopt_%answer%_opera.zip "^vk(_|opt|lang)" "vkopt_debug.js"


pause