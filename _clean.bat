@echo off

del /Q builds\chrome\background.js
del /Q builds\chrome\content_script.js
del /Q builds\edge\background.js
del /Q builds\edge\content_script.js
del /Q builds\firefox\resources\vkopt\data\content_script.js
del /Q builds\firefox\resources\vkopt\lib\background.js
del /Q builds\firefoxJetpack\resources\vkopt\data\background.js
del /Q builds\firefoxJetpack\resources\vkopt\data\content_script.js
del /Q builds\maxthon\background.js
del /Q builds\maxthon\content_script.js
del /Q builds\opera.extension\background.js
del /Q builds\opera.extension\includes\content_script.js
del /Q builds\vkopt.safariextension\background.js
del /Q builds\vkopt.safariextension\content_script.js

del /Q builds\chrome\scripts\vk*
del /Q builds\edge\scripts\vk*
del /Q builds\firefox\scripts\vk*
del /Q builds\firefoxJetpack\resources\vkopt\data\scripts\vk*
del /Q builds\vkopt.safariextension\scripts\vk*
del /Q builds\opera.extension\scripts\vk*

del /Q builds\vkopt_chrome.zip builds\vkopt_firefox_jetpack.xpi builds\vkopt_firefox.xpi builds\vkopt_opera.oex
